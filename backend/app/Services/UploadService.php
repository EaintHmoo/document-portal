<?php

namespace App\Services;

use Aws\S3\S3Client;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class UploadService
{

    /**
     * Deletes an object from S3. Best-effort: a version row being removed
     * from the database is the source of truth, so a transient S3 failure
     * here shouldn't block that — it just leaves an orphaned object behind,
     * logged for manual cleanup instead of surfacing as a 500.
     *
     * Returns whether the object is gone, so callers that must not lose
     * track of it (the purge command) can retry later instead.
     */
    public function deleteFile($storageKey): bool
    {
        if (!$storageKey) {
            return true;
        }

        try {
            // The s3 disk has 'throw' => false, so failures surface as false
            // here rather than as an exception.
            if (Storage::disk('s3')->delete($storageKey)) {
                return true;
            }

            Log::warning('Failed to delete S3 object.', ['key' => $storageKey]);

            return false;
        } catch (Throwable $e) {
            Log::warning('Failed to delete S3 object.', ['key' => $storageKey, 'error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Generate presigned url for s3 upload
     */
    public function generatePresignedUrl($file, $path)
    {
        $expiryMinutes = 1;
        
        $fileName = $file->getClientOriginalName();

        $fileType = $file->getMimeType();

        $generatedName = "document_" . Str::random(6) . "_" . time() . "." . pathinfo($fileName, PATHINFO_EXTENSION);
        // An empty prefix must be omitted entirely, not joined in — otherwise
        // the leading "/" becomes a literal empty-named "folder" at the
        // bucket root in the S3 console (bucket -> "/" -> documents -> ...).
        $prefix = trim((string) config('filesystems.disks.s3.s3_prefix', ''), '/');
        $path = trim($path, '/');
        $key = ($prefix !== '' ? "{$prefix}/" : '') . "{$path}/{$generatedName}";

        $s3Client = new S3Client([
            'version'     => 'latest',
            'region'      => config('filesystems.disks.s3.region'),
            'credentials' => [
                'key'    => config('filesystems.disks.s3.key'),
                'secret' => config('filesystems.disks.s3.secret'),
            ],
        ]);

        $cmd = $s3Client->getCommand('PutObject', [
            'Bucket'      => config('filesystems.disks.s3.bucket'),
            'Key'         => $key,
            'ContentType' => $fileType,
        ]);

        $request = $s3Client->createPresignedRequest($cmd, '+' . $expiryMinutes . ' minutes');

        return [
            'upload_url' => (string) $request->getUri(),
            'file_path'  => $key,
            'expires_in' => $expiryMinutes * 60,
        ];
    }

    /**
     * Upload file to S3 using presigned URL
     */
    public function uploadPresignedFile($file, $presignedUrl)
    {
        $client = new Client();

        $fileType = $file->getMimeType() ?? 'application/octet-stream';

        $client->put($presignedUrl, [
            'body' => fopen($file->getRealPath(), 'r'),
            'headers' => [
                'Content-Type' => $fileType,
            ],
        ]);

        return true;
    }

    /**
     * Short-lived presigned GET so a document never has a public, guessable
     * URL — the link dies in 5 minutes even if it leaks. Forces the browser
     * to download under the document's real filename via Content-Disposition
     * rather than the random storage key.
     */
    public function generateDownloadUrl(string $storageKey, string $downloadFilename, int $expiryMinutes = 5): string
    {
        $s3Client = new S3Client([
            'version'     => 'latest',
            'region'      => config('filesystems.disks.s3.region'),
            'credentials' => [
                'key'    => config('filesystems.disks.s3.key'),
                'secret' => config('filesystems.disks.s3.secret'),
            ],
        ]);

        $cmd = $s3Client->getCommand('GetObject', [
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $storageKey,
            'ResponseContentDisposition' => 'attachment; filename="'.addslashes($downloadFilename).'"',
        ]);

        $request = $s3Client->createPresignedRequest($cmd, '+'.$expiryMinutes.' minutes');

        return (string) $request->getUri();
    }
}