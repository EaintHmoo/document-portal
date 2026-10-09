<?php

namespace App\Services\Auth;

use App\Exceptions\AccountDeactivatedException;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(protected UserRepositoryInterface $users)
    {
    }

    /**
     * Post-authentication checks and bookkeeping. Credential verification
     * and rate limiting already happened in LoginRequest — this only runs
     * once Auth::attempt() has succeeded.
     *
     * @throws AccountDeactivatedException
     */
    public function completeLogin(User $user): User
    {
        if (! $user->is_active) {
            Auth::logout();

            throw new AccountDeactivatedException('This account has been deactivated. Contact an administrator.');
        }

        $user->forceFill(['last_login_at' => now()])->save();

        ActivityLog::record('user.logged_in', user: $user);

        return $user->loadMissing('role');
    }

    public function logout(User $user): void
    {
        ActivityLog::record('user.logged_out', user: $user);
    }

    /** Always assigns the base "user" role — admin is only ever granted by an admin. */
    public function register(array $data): User
    {
        $userRole = Role::query()->where('slug', Role::USER)->firstOrFail();

        $user = $this->users->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id' => $userRole->id,
            'is_active' => true,
        ]);

        ActivityLog::record('user.registered', user: $user);

        return $user->loadMissing('role');
    }
}
