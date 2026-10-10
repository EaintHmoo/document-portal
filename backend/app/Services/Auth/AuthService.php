<?php

namespace App\Services\Auth;

use App\Exceptions\AccountDeactivatedException;
use App\Models\ActivityLog;
use App\Models\EmailOtp;
use App\Models\Role;
use App\Models\User;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

class AuthService
{
    public function __construct(
        protected UserRepositoryInterface $users,
        protected OtpService $otp,
    ) {
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

    /** Step 1 of registration: proves the person owns the address before any account exists. */
    public function sendRegistrationOtp(string $email): void
    {
        $this->otp->send($email, EmailOtp::PURPOSE_REGISTER);
    }

    /**
     * Step 2 of registration. The emailed code is checked (and consumed)
     * before the account is created, so unverified accounts never exist.
     * Always assigns the base "user" role — admin is only ever granted by an admin.
     *
     * @throws ValidationException if the code is wrong or expired
     */
    public function register(array $data): User
    {
        $this->otp->verify($data['email'], EmailOtp::PURPOSE_REGISTER, $data['otp']);

        $userRole = Role::query()->where('slug', Role::USER)->firstOrFail();

        $user = $this->users->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id' => $userRole->id,
            'is_active' => true,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        ActivityLog::record('user.registered', user: $user);

        return $user->loadMissing('role');
    }

    /**
     * Emails a reset code — but only to an active account. Unknown or
     * blocked addresses get the same cooldown and the same (silent)
     * outcome, so the endpoint can't be used to discover who has an account.
     */
    public function sendPasswordResetOtp(string $email): void
    {
        $user = $this->users->findByEmail($email);

        if (! $user || ! $user->is_active) {
            $this->otp->reserveSendSlot($email, EmailOtp::PURPOSE_PASSWORD_RESET);

            return;
        }

        try {
            $this->otp->send($email, EmailOtp::PURPOSE_PASSWORD_RESET);
        } catch (ServiceUnavailableHttpException) {
            // Already logged by OtpService. Surfacing it would reveal that
            // this address has an account, so the caller sees the usual reply.
        }
    }

    /**
     * Sets a new password with an emailed code, then signs the account out
     * everywhere — whoever had the old password shouldn't keep a session.
     *
     * @throws ValidationException if the code is wrong or expired
     */
    public function resetPassword(string $email, string $code, string $password): void
    {
        $this->otp->verify($email, EmailOtp::PURPOSE_PASSWORD_RESET, $code);

        $user = $this->users->findByEmail($email);

        // Codes are only ever sent to active accounts, but the account may
        // have been blocked since — re-check rather than trust the code alone.
        if (! $user || ! $user->is_active) {
            throw ValidationException::withMessages([
                'otp' => 'This code is invalid or has expired. Please request a new one.',
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($password),
            'remember_token' => Str::random(60),
        ])->save();

        DB::table('sessions')->where('user_id', $user->id)->delete();

        ActivityLog::record('user.password_reset', $user, ['name' => $user->name], $user);
    }

    /**
     * Changes the signed-in user's password (current password already
     * verified by the request) and signs out every *other* session, keeping
     * the one that made the change (or every session, when the request
     * didn't come from one).
     */
    public function changePassword(User $user, string $password, ?string $currentSessionId): void
    {
        $user->forceFill([
            'password' => Hash::make($password),
            'remember_token' => Str::random(60),
        ])->save();

        DB::table('sessions')
            ->where('user_id', $user->id)
            ->when($currentSessionId, fn ($query) => $query->where('id', '!=', $currentSessionId))
            ->delete();

        ActivityLog::record('user.password_changed', $user, ['name' => $user->name], $user);
    }
}
