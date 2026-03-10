<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class AuthService
{
    public function registerMitra(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'phone'    => $data['phone'],
                'password' => Hash::make($data['password']),
                'role_label' => 'Mitra', 
            ]);

            $user->assignRole('mitra');

            return $user;
        });
    }

    public function googleLogin(string $accessToken): ?User
    {
        $response = Http::get('https://www.googleapis.com/oauth2/v3/userinfo', [
            'access_token' => $accessToken,
        ]);

        if ($response->failed()) {
            return null;
        }

        $googleUser = $response->json();
        $email = $googleUser['email'];
        $name = $googleUser['name'];

        return DB::transaction(function () use ($email, $name) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make(str()->random(24)),
                    'role_label' => 'Mitra',
                ]);
                $user->assignRole('mitra');
            } else {
                if (!$user->hasRole('mitra')) {
                    $user->assignRole('mitra');
                    $user->update(['role_label' => 'Mitra']);
                }
            }

            return $user;
        });
    }
}
