<?php

namespace App\Services\Document;

use App\Exceptions\ConflictException;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\Folder;
use App\Models\User;
use App\Repositories\Document\DocumentRepositoryInterface;
use App\Services\UploadService;
use DateTimeInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentService
{
    public function __construct(
        protected DocumentRepositoryInterface $repository,
        protected UploadService $uploadService,
    ) {
    }

    public function list(User $user): LengthAwarePaginator
    {
        return $this->repository->paginate($user);
    }

    public function find(User $user, string $uuid): ?Document
    {
        return $this->repository->findByUuid($user, $uuid);
    }

    public function recent(User $user, int $limit = 5): Collection
    {
        return $this->repository->recent($user, $limit);
    }

    public function countAccessibleTo(User $user): int
    {
        return $this->repository->countAccessibleTo($user);
    }

    /**
     * Upload a brand-new document (version 1). The S3 write happens before
     * anything is committed to the database, so a failed upload never
     * leaves a half-created document behind.
     */
    public function upload(UploadedFile $file, Folder $folder, string $title, ?string $description, User $uploader): Document
    {
        $uuid = (string) Str::uuid();
        $storageKey = $this->putFile($file, $uuid, 1);
        $checksum = hash_file('sha256', $file->getRealPath());

        return DB::transaction(function () use ($file, $folder, $title, $description, $uploader, $uuid, $storageKey, $checksum) {
            $document = $this->repository->create([
                'uuid' => $uuid,
                'folder_id' => $folder->id,
                'title' => $title,
                'description' => $description,
                'extension' => strtolower($file->getClientOriginalExtension()),
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
                'version_count' => 1,
                'uploaded_by' => $uploader->id,
            ]);

            $version = $this->createVersion($document, $file, $storageKey, $checksum, 1, null, $uploader);

            $document->update(['current_version_id' => $version->id]);

            ActivityLog::record('document.uploaded', $document, [
                'title' => $document->title,
                'version' => 1,
            ], $uploader);

            return $document->fresh(['folder', 'uploader', 'currentVersion', 'versions.author']);
        });
    }

    /**
     * Upload a new file for an existing document (version N+1). Metadata
     * (title/description) is untouched — only a brand-new file creates a
     * version, per the versioning rule in the spec.
     */
    public function addVersion(Document $document, UploadedFile $file, ?string $changeNote, User $uploader): Document
    {
        $nextVersion = $document->version_count + 1;
        $storageKey = $this->putFile($file, $document->uuid, $nextVersion);
        $checksum = hash_file('sha256', $file->getRealPath());

        return DB::transaction(function () use ($document, $file, $storageKey, $checksum, $nextVersion, $changeNote, $uploader) {
            $version = $this->createVersion($document, $file, $storageKey, $checksum, $nextVersion, $changeNote, $uploader);

            $document->update([
                'current_version_id' => $version->id,
                'version_count' => $nextVersion,
                'updated_by' => $uploader->id,
            ]);

            ActivityLog::record('document.updated', $document, [
                'title' => $document->title,
                'version' => $nextVersion,
            ], $uploader);

            return $document->fresh(['folder', 'uploader', 'currentVersion', 'versions.author']);
        });
    }

    /** Title/description only — does not touch versions, per the spec. */
    public function updateMetadata(Document $document, array $data, User $editor): Document
    {
        $document = $this->repository->update($document, [...$data, 'updated_by' => $editor->id]);

        ActivityLog::record('document.updated', $document, ['title' => $document->title], $editor);

        return $document;
    }

    public function delete(Document $document, User $deleter): void
    {
        ActivityLog::record('document.deleted', $document, ['title' => $document->title], $deleter);

        $this->repository->delete($document);
    }

    /**
     * A 5-minute presigned link, never the storage key itself — logs the
     * download so it shows up in the activity feed.
     */
    public function downloadUrl(Document $document, User $downloader): string
    {
        return $this->versionDownloadUrl($document, $document->currentVersion, $downloader);
    }

    /** Same as downloadUrl() but for any specific version, not just the current one. */
    public function versionDownloadUrl(Document $document, DocumentVersion $version, User $downloader): string
    {
        ActivityLog::record('document.downloaded', $document, [
            'title' => $document->title,
            'version' => $version->version_number,
        ], $downloader);

        return $this->uploadService->generateDownloadUrl($version->storage_key, $version->original_filename);
    }

    /**
     * Removes one version while keeping the rest of the document intact.
     * Deleting the current version promotes the next-most-recent remaining
     * one; deleting the document's only version is rejected outright —
     * use delete() on the whole document for that instead.
     *
     * @throws ConflictException
     */
    public function deleteVersion(Document $document, DocumentVersion $version, User $actor): Document
    {
        if ($document->versions()->count() <= 1) {
            throw new ConflictException('A document must keep at least one version — delete the document instead.');
        }

        $wasCurrent = $document->current_version_id === $version->id;

        $document = DB::transaction(function () use ($document, $version, $wasCurrent) {
            if ($wasCurrent) {
                $nextCurrent = $document->versions()
                    ->where('id', '!=', $version->id)
                    ->orderByDesc('version_number')
                    ->firstOrFail();

                $document->update(['current_version_id' => $nextCurrent->id]);
            }

            $version->delete();

            return $document->fresh(['folder', 'uploader', 'currentVersion', 'versions.author']);
        });

        $this->uploadService->deleteFile($version->storage_key);

        ActivityLog::record('document.version_deleted', $document, [
            'title' => $document->title,
            'version' => $version->version_number,
        ], $actor);

        return $document;
    }

    /**
     * Permanently removes documents soft-deleted at or before $cutoff:
     * every version's S3 object, then the database rows. A document is
     * only removed from the database once all of its objects are gone, so
     * a failed S3 delete leaves it in place for the next run to retry
     * instead of orphaning files nothing points to anymore.
     *
     * @return array{purged: int, failed: int}
     */
    public function purgeDeletedBefore(DateTimeInterface $cutoff): array
    {
        $result = ['purged' => 0, 'failed' => 0];

        $this->repository->eachTrashedBefore($cutoff, function (Document $document) use (&$result) {
            $filesRemoved = $document->versions->every(
                fn (DocumentVersion $version) => $this->uploadService->deleteFile($version->storage_key),
            );

            if (! $filesRemoved) {
                $result['failed']++;

                return;
            }

            $this->repository->forceDelete($document);

            ActivityLog::record('document.purged', $document, [
                'title' => $document->title,
                'versions' => $document->versions->count(),
            ]);

            $result['purged']++;
        });

        return $result;
    }

    private function putFile(UploadedFile $file, string $documentUuid, int $versionNumber): string
    {
        $presigned = $this->uploadService->generatePresignedUrl($file, "documents/{$documentUuid}/v{$versionNumber}");
        $this->uploadService->uploadPresignedFile($file, $presigned['upload_url']);

        return $presigned['file_path'];
    }

    private function createVersion(
        Document $document,
        UploadedFile $file,
        string $storageKey,
        string $checksum,
        int $versionNumber,
        ?string $changeNote,
        User $uploader,
    ): DocumentVersion {
        return $document->versions()->create([
            'version_number' => $versionNumber,
            'disk' => 's3',
            'storage_key' => $storageKey,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'extension' => strtolower($file->getClientOriginalExtension()),
            'size_bytes' => $file->getSize(),
            'checksum_sha256' => $checksum,
            'change_note' => $changeNote,
            'created_by' => $uploader->id,
            'created_at' => now(),
        ]);
    }
}
