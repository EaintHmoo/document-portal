<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
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

    public function me(Request $request): JsonResponse
    {
        return UserResource::make($request->user()->loadMissing('role'))->response();
    }
}
