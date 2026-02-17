<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class PelihatUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Pastikan Role Pelihat sudah ada
        $pelihatRole = Role::firstOrCreate([
            'name' => 'pelihat',
            'guard_name' => 'sanctum',
        ]);

        // 2. Buat User Testing dengan Role Pelihat
        $user = User::firstOrCreate(
            ['email' => 'pelihat@dpf.test'],
            [
                'name'       => 'Pelihat Testing',
                'password'   => Hash::make('pelihat123'),
                'phone'      => '081233344455',
                'is_active'  => true,
                'role_label' => 'Viewer',
            ]
        );

        // 3. Assign Role
        if (!$user->hasRole('pelihat')) {
            $user->assignRole($pelihatRole);
        }
    }
}
