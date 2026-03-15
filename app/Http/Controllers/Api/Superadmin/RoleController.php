<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index()
    {
        $roles = Role::with('permissions:id,name')
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return response()->json($roles);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        \Log::info('RoleController@store payload', $request->all());

        $validator = \Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                Rule::unique('roles', 'name')->where('guard_name', 'sanctum'),
            ],
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        if ($validator->fails()) {
            \Log::error('RoleController@store validation failed', $validator->errors()->toArray());
            return response()->json(['message' => $validator->errors()->first(), 'errors' => $validator->errors()], 422);
        }

        $role = Role::create([
            'name' => strtolower($request->name),
            'guard_name' => 'sanctum',
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json($role->load('permissions'), 201);
    }

    /**
     * Display the specified role.
     */
    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return response()->json($role);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'name' => [
                'required',
                'string',
                Rule::unique('roles', 'name')->where('guard_name', 'sanctum')->ignore($role->id),
            ],
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        // Don't allow renaming core roles to avoid breaking system logic
        $coreRoles = ['superadmin', 'admin', 'editor', 'mitra'];
        if (in_array($role->name, $coreRoles) && strtolower($request->name) !== $role->name) {
            return response()->json(['message' => 'Role utama sistem tidak dapat diubah namanya.'], 422);
        }

        $role->update([
            'name' => strtolower($request->name),
            'guard_name' => 'sanctum', // Ensure consistency
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json($role->load('permissions'));
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        
        $coreRoles = ['superadmin', 'admin', 'editor', 'mitra'];
        if (in_array($role->name, $coreRoles)) {
            return response()->json(['message' => 'Role utama sistem tidak dapat dihapus.'], 422);
        }

        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Role ini masih digunakan oleh beberapa pengguna.'], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Role berhasil dihapus.']);
    }

    /**
     * Display a listing of all permissions for dropdowns.
     */
    public function permissions()
    {
        $permissions = Permission::orderBy('name')->get();
        return response()->json($permissions);
    }
}
