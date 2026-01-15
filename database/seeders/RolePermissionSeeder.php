<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Roles utama sesuai modul
        $roles = [
            'superadmin',
            'admin',
            'editor',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'sanctum',
            ]);
        }

        // Daftar permission (bisa lu tambah lagi nanti)
        $permissions = [
            'manage programs',
            'manage donations',
            'manage pickup_requests',
            'manage consultations',
            'manage partners',
            'manage articles',
            'manage organization',
            'manage settings',
            'view reports',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'sanctum',
            ]);
        }

        // Kasih semua permission ke superadmin
        $superadminRole = Role::where('name', 'superadmin')->first();
        if ($superadminRole) {
            $superadminRole->syncPermissions(Permission::all());
        }
    }
}
