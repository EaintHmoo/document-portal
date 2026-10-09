<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

/** Gate::before in AppServiceProvider already grants admins every ability here. */
class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        return $this->hasAccess($document, $user);
    }

    public function download(User $user, Document $document): bool
    {
        return $this->hasAccess($document, $user);
    }

    /** Metadata edits (title/description). */
    public function update(User $user, Document $document): bool
    {
        return $document->folder->hasEditAccess($user);
    }

    /** Uploading a new file as the next version. */
    public function addVersion(User $user, Document $document): bool
    {
        return $document->folder->hasEditAccess($user);
    }

    /** Deleting the whole document. */
    public function delete(User $user, Document $document): bool
    {
        return $document->folder->hasDeleteAccess($user);
    }

    /** Deleting a single version while keeping the rest of the document. */
    public function deleteVersion(User $user, Document $document): bool
    {
        return $document->folder->hasDeleteAccess($user);
    }

    private function hasAccess(Document $document, User $user): bool
    {
        $folder = $document->folder;

        return $folder->is_public
            || $folder->hasViewAccess($user)
            || $folder->hasCreateAccess($user)
            || $folder->hasEditAccess($user)
            || $folder->hasDeleteAccess($user);
    }
}
