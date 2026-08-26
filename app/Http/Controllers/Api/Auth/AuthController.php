<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterMitraRequest;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

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
        $email = $credentials['email'] ?? null;

        // 1. Cek apakah user dengan email ini terdaftar di database
        $userExists = User::query()->where('email', $email)->exists();
        if (! $userExists) {
            throw ValidationException::withMessages([
                'email' => __('auth.account_not_found'),
            ]);
        }

        // 2. Cek apakah kata sandi cocok
        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'password' => __('auth.password_incorrect'),
            ]);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        // 3. Cek apakah akun dinonaktifkan
        if (isset($user->is_active) && ! $user->is_active) {
            if ($request->hasSession()) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            } else {
                $user->tokens()->delete();
                Auth::guard('web')->logout();
            }

            throw ValidationException::withMessages([
                'email' => __('auth.account_inactive'),
            ]);
        }

        $user->load('roles.permissions', 'permissions');
        $primaryRole = $user->roles->first()?->name;
        if ($primaryRole && (empty($user->role_label) || in_array(strtolower((string) $user->role_label), ['admin', 'editor', 'keuangan', 'superadmin', 'mitra', 'pelihat']))) {
            $user->role_label = ucfirst($primaryRole);
            $user->save();
        }

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
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        $token = $user?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    /**
     * Return authenticated user with roles & permissions.
     */
    public function me(Request $request)
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        if ($user) {
            $user->load('roles.permissions', 'permissions');
            $primaryRole = $user->roles->first()?->name;
            if ($primaryRole && (empty($user->role_label) || in_array(strtolower((string) $user->role_label), ['admin', 'editor', 'keuangan', 'superadmin', 'mitra', 'pelihat']))) {
                $user->role_label = ucfirst($primaryRole);
                $user->save();
            }
        }

        return response()->json([
            'user' => $user,
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
