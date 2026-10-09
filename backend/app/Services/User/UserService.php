<?php

namespace App\Services\User;

use App\Mail\UserBlockedMail;
use App\Mail\UserUnblockedMail;
use App\Models\ActivityLog;
use App\Models\User;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class UserService
{
    public function __construct(protected UserRepositoryInterface $repository)
    {
    }

    public function list(int $perPage = 20): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage);
    }

    /**
     * Applies a role change and/or an active/blocked status change, logging
     * and emailing only for whichever of those two actually changed.
     */
    public function update(User $user, array $data, User $actor): User
    {
        $roleChanged = array_key_exists('role_id', $data) && $data['role_id'] !== $user->role_id;
        $statusChanged = array_key_exists('is_active', $data) && $data['is_active'] !== $user->is_active;

        $user = $this->repository->update($user, $data);

        if ($roleChanged) {
            ActivityLog::record('user.role_changed', $user, [
                'name' => $user->name,
                'role' => $user->role->slug,
            ], $actor);
        }

        if ($statusChanged) {
            $this->handleStatusChange($user, $actor);
        }

        return $user;
    }

    private function handleStatusChange(User $user, User $actor): void
    {
        if ($user->is_active) {
            ActivityLog::record('user.activated', $user, ['name' => $user->name], $actor);
            $this->sendNotification(new UserUnblockedMail($user), $user);

            return;
        }

        ActivityLog::record('user.deactivated', $user, ['name' => $user->name], $actor);
        $this->sendNotification(new UserBlockedMail($user), $user);

        // Kick them out of any session they're currently signed in with —
        // blocking shouldn't wait for their next login attempt to take effect.
        DB::table('sessions')->where('user_id', $user->id)->delete();
    }

    /**
     * Queued, never sent inline: a slow or unreachable mail server can block
     * on the SMTP handshake long enough to hit PHP's max_execution_time,
     * which is a fatal error — not a catchable exception — and would take
     * the whole block/unblock request down with it even though the status
     * change had already been persisted. Queueing only ever touches the
     * database, so this can't hang the request. Requires `php artisan
     * queue:work` (QUEUE_CONNECTION=database) to actually be running for
     * delivery to happen.
     */
    private function sendNotification(Mailable $mailable, User $user): void
    {
        try {
            Mail::to($user->email)->queue($mailable);
        } catch (Throwable $e) {
            Log::warning('Failed to queue user status notification email.', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
