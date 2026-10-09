<?php

namespace App\Providers;

use App\Repositories\Dashboard\DashboardRepository;
use App\Repositories\Dashboard\DashboardRepositoryInterface;
use App\Repositories\Document\DocumentRepository;
use App\Repositories\Document\DocumentRepositoryInterface;
use App\Repositories\Folder\FolderRepository;
use App\Repositories\Folder\FolderRepositoryInterface;
use App\Repositories\User\UserRepository;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(FolderRepositoryInterface::class, FolderRepository::class);
        $this->app->bind(DocumentRepositoryInterface::class, DocumentRepository::class);
        $this->app->bind(DashboardRepositoryInterface::class, DashboardRepository::class);
    }
}
