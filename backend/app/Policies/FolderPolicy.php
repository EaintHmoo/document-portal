<?php

namespace App\Policies;

use App\Models\Folder;
use App\Models\User;

/** Gate::before in AppServiceProvider already grants admins every ability here. */
class FolderPolicy
{
    public function view(User $user, Folder $folder): bool
    {
        return $folder->is_public || $folder->permissionFor($user) !== null;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Folder $folder): bool
    {
        return $folder->permissionFor($user) === 'edit';
    }

    public function delete(User $user, Folder $folder): bool
    {
        return false;
    }

    /** Uploading a document into a folder requires edit access on that folder. */
    public function uploadDocument(User $user, Folder $folder): bool
    {
        return $folder->permissionFor($user) === 'edit';
    }
}
