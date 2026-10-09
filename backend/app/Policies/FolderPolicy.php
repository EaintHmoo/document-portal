<?php

namespace App\Policies;

use App\Models\Folder;
use App\Models\User;

/** Gate::before in AppServiceProvider already grants admins every ability here. */
class FolderPolicy
{
    public function view(User $user, Folder $folder): bool
    {
        return $folder->is_public
            || $folder->hasViewAccess($user)
            || $folder->hasCreateAccess($user)
            || $folder->hasEditAccess($user)
            || $folder->hasDeleteAccess($user);
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Folder $folder): bool
    {
        return $folder->hasEditAccess($user);
    }

    public function delete(User $user, Folder $folder): bool
    {
        return false;
    }

    /** Uploading a brand-new document requires create access specifically — not the same as editing an existing one. */
    public function uploadDocument(User $user, Folder $folder): bool
    {
        return $folder->hasCreateAccess($user);
    }

    /** Only admins manage who can access a folder — Gate::before handles the true case. */
    public function manageAccess(User $user, Folder $folder): bool
    {
        return false;
    }
}
