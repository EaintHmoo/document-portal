<?php

namespace App\Repositories\Folder;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface FolderRepositoryInterface
{
    public function accessibleTo(User $user): Collection;

    public function findById(int $id): ?Folder;

    public function create(array $data): Folder;

    public function update(Folder $folder, array $data): Folder;

    public function delete(Folder $folder): void;

    public function hasDocuments(Folder $folder): bool;
}
