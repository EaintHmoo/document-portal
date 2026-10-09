<?php

namespace App\Repositories\Dashboard;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class DashboardRepository implements DashboardRepositoryInterface
{
    public function totalUsers(): int
    {
        return User::query()->count();
    }

    public function totalFolders(): int
    {
        return Folder::query()->count();
    }

    public function totalDocuments(): int
    {
        return Document::query()->count();
    }

    public function recentActivities(int $limit, ?int $userId = null): Collection
    {
        return ActivityLog::query()
            ->with('user')
            ->when($userId, fn ($query) => $query->where('user_id', $userId))
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }
}
