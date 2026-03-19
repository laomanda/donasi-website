<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterMitraRequest;
use App\Services\AuthService;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Handle SPA login and issue Sanctum token.
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $user = $request->user()->load('roles.permissions', 'permissions');

        return response()->json([
            'token'      => $user->createToken('spa')->plainTextToken,
            'token_type' => 'Bearer',
            'user'       => $user,
        ]);
    }

    /**
     * Remove current token and session.
     */
    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    /**
     * Return authenticated user with roles & permissions.
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('roles.permissions', 'permissions'),
        ]);
    }

    /**
     * Register a new Mitra (Corporate Partner).
     */
    public function registerMitra(RegisterMitraRequest $request)
    {
        $data = $request->validated();

        $user = $this->authService->registerMitra($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi Berhasil. Silakan Login.',
            'user' => $user
        ], 201);
    }
}
