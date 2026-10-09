<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Self-service signup. Always assigns the base "user" role — the admin
     * role can only be granted by an existing admin, never by signup.
     */
    public function register(RegisterRequest $request): \Illuminate\Http\JsonResponse
    {
        $userRole = Role::query()->where('slug', Role::USER)->firstOrFail();

        $user = User::query()->create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'password' => Hash::make($request->string('password')),
            'role_id' => $userRole->id,
            'is_active' => true,
        ]);

        ActivityLog::record('user.registered', user: $user);

        return response()->json([
            'data' => $this->serializeUser($user),
        ], 201);
    }

    public function login(LoginRequest $request): \Illuminate\Http\JsonResponse
    {
        $request->authenticate();

        $user = $request->user();

        if (! $user->is_active) {
            Auth::logout();

            return response()->json([
                'message' => 'This account has been deactivated. Contact an administrator.',
            ], 403);
        }

        $request->session()->regenerate();

        $user->forceFill(['last_login_at' => now()])->save();

        ActivityLog::record('user.logged_in', user: $user);

        return response()->json([
            'data' => $this->serializeUser($user),
        ]);
    }

    public function logout(Request $request): \Illuminate\Http\JsonResponse
    {
        ActivityLog::record('user.logged_out', user: $request->user());

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'data' => $this->serializeUser($request->user()),
        ]);
    }

    private function serializeUser(\App\Models\User $user): array
    {
        $user->loadMissing('role');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->slug,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at,
        ];
    }
}
