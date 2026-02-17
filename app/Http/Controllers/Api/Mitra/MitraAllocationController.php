<?php

namespace App\Http\Controllers\Api\Mitra;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MitraAllocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $allocations = Allocation::with('program')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'status' => 'success',
            'data' => $allocations
        ]);
    }
    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = Auth::user();
        $allocation = Allocation::with('program')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $allocation
        ]);
    }
}
