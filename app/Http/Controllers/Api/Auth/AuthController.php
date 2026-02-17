<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    /**
     * Handle SPA login and issue Sanctum token.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $user = $request->user()->load('roles', 'permissions');

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
            'user' => $request->user()->load('roles', 'permissions'),
        ]);
    }

    /**
     * Register a new Mitra (Corporate Partner).
     */
    public function registerMitra(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone'    => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'instansi' => ['nullable', 'string', 'max:255'], // Optional Corporate Name
        ]);

        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'phone'    => $data['phone'],
                'password' => Hash::make($data['password']),
                'role_label' => 'Mitra', 
            ]);

            // Assign role
            $user->assignRole('mitra');

            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi Berhasil. Silakan Login.',
                'user' => $user
            ], 201);
        });
    }

    /**
     * Handle Google Login / Registration for Mitra.
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'access_token' => 'required|string',
        ]);

        // Verify token with Google
        $response = Http::get('https://www.googleapis.com/oauth2/v3/userinfo', [
            'access_token' => $request->access_token,
        ]);

        if ($response->failed()) {
            return response()->json(['message' => 'Invalid Google Token'], 401);
        }

        $googleUser = $response->json();
        $email = $googleUser['email'];
        $name = $googleUser['name'];

        return DB::transaction(function () use ($email, $name) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                // Create user as Mitra if not found
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make(str()->random(24)),
                    'role_label' => 'Mitra',
                ]);
                $user->assignRole('mitra');
            } else {
                // If user exists but doesn't have mitra role, we might want to assign it 
                // but let's be careful about existing admins.
                // For this requirement, we assume social login for Mitra registration.
                if (!$user->hasRole('mitra')) {
                    $user->assignRole('mitra');
                    $user->update(['role_label' => 'Mitra']);
                }
            }

            return response()->json([
                'token' => $user->createToken('spa')->plainTextToken,
                'token_type' => 'Bearer',
                'user' => $user->load('roles', 'permissions'),
            ]);
        });
    }
}
