<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan roles sudah ada (hasil dari RolePermissionSeeder)
        $superadminRole = Role::firstOrCreate(['name' => 'superadmin']);
        $adminRole      = Role::firstOrCreate(['name' => 'admin']);
        $editorRole     = Role::firstOrCreate(['name' => 'editor']);

        /*
         * 1) SUPERADMIN
         */
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@dpf.test'],
            [
                'name'       => 'Super Admin DPF',
                'password'   => Hash::make('password123'), // GANTI di production
                'phone'      => '081234567890',
                'is_active'  => true,
                'role_label' => 'Super Admin',
            ]
        );

        if (! $superadmin->hasRole('superadmin')) {
            $superadmin->assignRole($superadminRole);
        }

        /*
         * 2) ADMIN
         */
        $admin = User::firstOrCreate(
            ['email' => 'admin@dpf.test'],
            [
                'name'       => 'Admin DPF',
                'password'   => Hash::make('password123'), // GANTI di production
                'phone'      => '081298765432',
                'is_active'  => true,
                'role_label' => 'Admin',
            ]
        );

        if (! $admin->hasRole('admin')) {
            $admin->assignRole($adminRole);
        }

        /*
         * 3) EDITOR
         */
        $editor = User::firstOrCreate(
            ['email' => 'editor@dpf.test'],
            [
                'name'       => 'Editor DPF',
                'password'   => Hash::make('password123'), // GANTI di production
                'phone'      => '081277788899',
                'is_active'  => true,
                'role_label' => 'Editor',
            ]
        );

        if (! $editor->hasRole('editor')) {
            $editor->assignRole($editorRole);
        }
    }
}
