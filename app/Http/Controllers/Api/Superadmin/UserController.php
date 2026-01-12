<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        $role = $request->string('role')->trim()->toString();
        if ($role !== '') {
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')
            ->paginate($request->integer('per_page', 20));

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone'     => $data['phone'] ?? null,
            'password'  => Hash::make($data['password']),
            'is_active' => $data['is_active'],
            'role_label'=> $data['role_label'] ?? null,
        ]);

        if (! empty($data['roles'])) {
            $user->syncRoles($data['roles']);
        }

        return response()->json($user->load('roles'), 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load('roles'));
    }

    public function update(Request $request, User $user)
    {
        $data = $this->validatePayload($request, $user->id);

        $payload = [
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone'     => $data['phone'] ?? null,
            'is_active' => $data['is_active'],
            'role_label'=> $data['role_label'] ?? null,
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        if (array_key_exists('roles', $data)) {
            $user->syncRoles($data['roles'] ?? []);
        }

        return response()->json($user->refresh()->load('roles'));
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Tidak dapat menghapus akun sendiri.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    public function roles()
    {
        return response()->json(
            Role::query()
                ->with(['permissions:id,name'])
                ->withCount('users')
                ->orderBy('name')
                ->get(['id', 'name', 'guard_name', 'created_at', 'updated_at'])
        );
    }

    private function validatePayload(Request $request, ?int $userId = null): array
    {
        return $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255', 'unique:users,email,' . $userId],
            'phone'      => ['nullable', 'string', 'max:30'],
            'password'   => [$userId ? 'nullable' : 'required', 'string', 'min:8'],
            'is_active'  => ['required', 'boolean'],
            'role_label' => ['nullable', 'string', 'max:100'],
            'roles'      => ['nullable', 'array'],
            'roles.*'    => ['string', 'exists:roles,name'],
        ]);
    }
}
