<?php

namespace App\Repositories\Document;

use App\Models\Document;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface DocumentRepositoryInterface
{
    public function paginate(User $user, int $perPage = 20): LengthAwarePaginator;

    public function findByUuid(User $user, string $uuid): ?Document;

    public function recent(User $user, int $limit = 5): Collection;

    public function countAccessibleTo(User $user): int;

    public function create(array $data): Document;

    public function update(Document $document, array $data): Document;

    public function delete(Document $document): void;

    /** Calls $callback for each soft-deleted document (versions loaded) deleted at or before $cutoff. */
    public function eachTrashedBefore(DateTimeInterface $cutoff, callable $callback): void;

    public function forceDelete(Document $document): void;
}
