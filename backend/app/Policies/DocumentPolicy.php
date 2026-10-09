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

    public function update(User $user, Document $document): bool
    {
        return $this->canEdit($document, $user);
    }

    public function delete(User $user, Document $document): bool
    {
        return $this->canEdit($document, $user);
    }

    public function addVersion(User $user, Document $document): bool
    {
        return $this->canEdit($document, $user);
    }

    private function hasAccess(Document $document, User $user): bool
    {
        return $document->folder->is_public || $document->folder->permissionFor($user) !== null;
    }

    private function canEdit(Document $document, User $user): bool
    {
        return $document->folder->permissionFor($user) === 'edit';
    }
}
