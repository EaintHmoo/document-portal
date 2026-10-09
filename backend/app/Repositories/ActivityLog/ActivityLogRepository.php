<?php

namespace App\Repositories\ActivityLog;

use App\Filters\ActivityLogFilter;
use App\Models\ActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityLogRepository implements ActivityLogRepositoryInterface
{
    public function paginate(int $perPage = 20): LengthAwarePaginator
    {
        $query = ActivityLog::query()->with('user')->latest('created_at');

        $query = app(ActivityLogFilter::class)->apply($query);

        return $query->paginate($perPage);
    }

    public function distinctActions(): array
    {
        return ActivityLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->all();
    }
}
