<?php

namespace App\Repositories\Dashboard;

use Illuminate\Database\Eloquent\Collection;

interface DashboardRepositoryInterface
{
    public function totalUsers(): int;

    public function totalFolders(): int;

    public function totalDocuments(): int;

    /** @param int|null $userId Scope to one user's own activity, or null for everyone (admin view). */
    public function recentActivities(int $limit, ?int $userId = null): Collection;
}
