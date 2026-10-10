<?php

namespace App\Console\Commands;

use App\Services\Document\DocumentService;
use Illuminate\Console\Command;

class PurgeDeletedDocuments extends Command
{
    protected $signature = 'documents:purge-deleted
                            {--days= : Retention in days (defaults to config documents.purge_after_days)}';

    protected $description = 'Permanently delete soft-deleted documents, and their S3 files, past the retention window';

    public function handle(DocumentService $service): int
    {
        $days = (int) ($this->option('days') ?? config('documents.purge_after_days'));

        if ($days < 0) {
            $this->error('--days must be zero or greater.');

            return self::INVALID;
        }

        $result = $service->purgeDeletedBefore(now()->subDays($days));

        $this->info("Purged {$result['purged']} document(s) deleted more than {$days} day(s) ago.");

        if ($result['failed'] > 0) {
            $this->warn("{$result['failed']} document(s) kept because their S3 files could not be removed; they will be retried on the next run.");

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
