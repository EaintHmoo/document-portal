<?php

namespace App\Services\ActivityLog;

use App\Repositories\ActivityLog\ActivityLogRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityLogService
{
    public function __construct(protected ActivityLogRepositoryInterface $repository)
    {
    }

    public function list(int $perPage = 20): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage);
    }

    public function availableActions(): array
    {
        return $this->repository->distinctActions();
    }
}
