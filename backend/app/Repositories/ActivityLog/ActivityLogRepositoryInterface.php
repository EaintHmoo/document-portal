<?php

namespace App\Repositories\ActivityLog;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ActivityLogRepositoryInterface
{
    public function paginate(int $perPage = 20): LengthAwarePaginator;

    /** Distinct action strings seen so far, for populating a filter dropdown. */
    public function distinctActions(): array;
}
