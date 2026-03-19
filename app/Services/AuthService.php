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
}
