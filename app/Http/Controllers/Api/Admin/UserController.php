<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get list of users (filtered by role if needed)
     */
    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->has('role')) {
            $role = $request->role;
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            })->orWhere('role_label', $role); // Handle manual label
        }

        // Search
        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Return all or paginate? Frontend expects pagination structure probably based on previous calls
        // but frontend code uses `usersRes.data.data.data` implies pagination.
        // Let's use simple pagination.
        
        $users = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }
}
