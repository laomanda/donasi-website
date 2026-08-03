<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Roles utama sesuai modul
        $roles = [
            'superadmin',
            'admin',
            'editor',
            'mitra',
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
            'view reports',
            'manage banners',
            'manage gallery dpf',
            'manage tags',
            'manage bank_accounts',
            'manage allocations',
            'manage suggestions',
            'manage tasks',
            'manage users',
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

        $editorRole = Role::where('name', 'editor')->first();
        if ($editorRole) {
            $editorRole->givePermissionTo('manage gallery dpf');
        }
    }
}
