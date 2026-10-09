<?php

namespace App\Policies;

use App\Models\User;

/** Gate::before in AppServiceProvider already grants admins every ability here. */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function update(User $user, User $target): bool
    {
        return false;
    }
}
