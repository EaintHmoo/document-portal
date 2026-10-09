<?php

use Aws\S3\S3Client;

if (! function_exists('image_path')) {
    function image_path(string | null $filePath): string | null
    {
        $expiryMinutes = 1;
        if (!$filePath) {
            return null;
        }

        if (filter_var($filePath, FILTER_VALIDATE_URL)) {
            return $filePath;
        }

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
            'Key'    => $filePath,
        ]);

        $request = $s3Client->createPresignedRequest($cmd, '+' . $expiryMinutes . ' minutes');

        return (string) $request->getUri();
    }
}
