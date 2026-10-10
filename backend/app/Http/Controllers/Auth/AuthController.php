<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SendRegisterOtpRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService)
    {
    }

    public function sendRegisterOtp(SendRegisterOtpRequest $request): JsonResponse
    {
        $this->authService->sendRegistrationOtp($request->validated('email'));

        return response()->json([
            'message' => 'We sent a 6-digit verification code to your email.',
            'expires_in' => config('auth.otp.expires_minutes') * 60,
            'resend_in' => config('auth.otp.resend_seconds'),
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return UserResource::make($user)->response()->setStatusCode(201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $user = $this->authService->completeLogin($request->user());

        $request->session()->regenerate();

        return UserResource::make($user)->response();
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out.']);
    }

    /** Always the same reply, whether or not the email has an account. */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendPasswordResetOtp($request->validated('email'));

        return response()->json([
            'message' => 'If an account exists for that email, we sent a 6-digit code to it.',
            'expires_in' => config('auth.otp.expires_minutes') * 60,
            'resend_in' => config('auth.otp.resend_seconds'),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword(
            $request->validated('email'),
            $request->validated('otp'),
            $request->validated('password'),
        );

        return response()->json(['message' => 'Your password has been reset. You can now sign in.']);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword(
            $request->user(),
            $request->validated('password'),
            $request->hasSession() ? $request->session()->getId() : null,
        );

        return response()->json(['message' => 'Password updated. Your other sessions have been signed out.']);
    }

    public function me(Request $request): JsonResponse
    {
        return UserResource::make($request->user()->loadMissing('role'))->response();
    }
}
