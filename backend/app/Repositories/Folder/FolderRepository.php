<?php

namespace App\Repositories\Folder;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class FolderRepository implements FolderRepositoryInterface
{
    public function accessibleTo(User $user): Collection
    {
        return Folder::query()
            ->accessibleBy($user)
            ->with('creator')
            ->withCount('documents')
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): ?Folder
    {
        return Folder::query()->with('creator', 'parent')->find($id);
    }

    public function create(array $data): Folder
    {
        return Folder::query()->create($data);
    }

    public function update(Folder $folder, array $data): Folder
    {
        $folder->update($data);

        return $folder->fresh();
    }

    public function delete(Folder $folder): void
    {
        $folder->delete();
    }

    public function hasDocuments(Folder $folder): bool
    {
        return $folder->documents()->exists();
    }
}
