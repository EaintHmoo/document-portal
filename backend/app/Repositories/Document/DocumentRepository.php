<?php

namespace App\Repositories\Document;

use App\Filters\DocumentFilter;
use App\Models\Document;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class DocumentRepository implements DocumentRepositoryInterface
{
    public function paginate(User $user, int $perPage = 20): LengthAwarePaginator
    {
        $query = Document::query()
            ->accessibleBy($user)
            ->with(['folder', 'uploader', 'currentVersion']);

        $query = app(DocumentFilter::class)->apply($query);

        return $query->paginate($perPage);
    }

    public function findByUuid(User $user, string $uuid): ?Document
    {
        return Document::query()
            ->accessibleBy($user)
            ->with(['folder', 'uploader', 'updater', 'currentVersion'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function recent(User $user, int $limit = 5): Collection
    {
        return Document::query()
            ->accessibleBy($user)
            ->with(['folder', 'uploader'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function countAccessibleTo(User $user): int
    {
        return Document::query()->accessibleBy($user)->count();
    }

    public function create(array $data): Document
    {
        return Document::query()->create($data);
    }

    public function update(Document $document, array $data): Document
    {
        $document->update($data);

        return $document->fresh();
    }

    public function delete(Document $document): void
    {
        $document->delete();
    }

    public function eachTrashedBefore(DateTimeInterface $cutoff, callable $callback): void
    {
        Document::onlyTrashed()
            ->where('deleted_at', '<=', $cutoff)
            ->with('versions')
            ->chunkById(100, fn (Collection $documents) => $documents->each($callback));
    }

    /**
     * Versions first: their FK nulls documents.current_version_id on the
     * way out, so the document row itself can then go cleanly.
     */
    public function forceDelete(Document $document): void
    {
        DB::transaction(function () use ($document) {
            $document->versions()->delete();
            $document->forceDelete();
        });
    }
}
