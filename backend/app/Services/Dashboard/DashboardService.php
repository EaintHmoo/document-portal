<?php

namespace App\Services\Dashboard;

use App\Models\User;
use App\Repositories\Dashboard\DashboardRepositoryInterface;
use App\Repositories\Document\DocumentRepositoryInterface;
use App\Repositories\Folder\FolderRepositoryInterface;

class DashboardService
{
    public function __construct(
        protected DashboardRepositoryInterface $repository,
        protected DocumentRepositoryInterface $documents,
        protected FolderRepositoryInterface $folders,
    ) {
    }

    public function forUser(User $user): array
    {
        return $user->isAdmin() ? $this->adminSummary($user) : $this->userSummary($user);
    }

    private function adminSummary(User $admin): array
    {
        return [
            'total_users' => $this->repository->totalUsers(),
            'total_documents' => $this->repository->totalDocuments(),
            'total_folders' => $this->repository->totalFolders(),
            'recent_documents' => $this->documents->recent($admin),
            'recent_activities' => $this->repository->recentActivities(10),
        ];
    }

    private function userSummary(User $user): array
    {
        return [
            'accessible_document_count' => $this->documents->countAccessibleTo($user),
            'accessible_folders' => $this->folders->accessibleTo($user),
            'recent_documents' => $this->documents->recent($user),
            'recent_activities' => $this->repository->recentActivities(10, $user->id),
        ];
    }
}
