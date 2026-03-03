<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AllocationController extends Controller
{
    /**
     * List all allocations (Admin/Superadmin view)
     */
    public function index(Request $request)
    {
        $query = Allocation::with(['user', 'program']);

        if ($request->has('q')) {
            $q = $request->q;
            $query->where(function($sub) use ($q) {
                $sub->whereHas('user', function($u) use ($q) {
                        $u->where('name', 'like', "%{$q}%");
                    })
                    ->orWhereHas('program', function($p) use ($q) {
                        $p->where('title', 'like', "%{$q}%");
                    });
            });
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->latest()->paginate($request->per_page ?? 15)
        ]);
    }

    /**
     * Store a new allocation (Admin Action)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'     => ['required', 'exists:users,id'],
            'program_id'  => ['nullable', 'exists:programs,id'],
            'amount'      => ['required', 'numeric', 'min:0'],
            'description' => ['required', 'string'],
            'proof'       => ['nullable', 'image', 'max:2048'], // 2MB max
        ]);

        // Upload proof if exists
        if ($request->hasFile('proof')) {
            $data['proof_path'] = $request->file('proof')->store('allocations/proofs', 'public');
        }

        $allocation = Allocation::create([
            'user_id'     => $data['user_id'],
            'program_id'  => $data['program_id'],
            'amount'      => $data['amount'],
            'description' => $data['description'],
            'proof_path'  => $data['proof_path'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Dana berhasil dialokasikan.',
            'data' => $allocation->load(['user', 'program'])
        ], 201);
    }

    /**
     * Remove an allocation
     */
    public function destroy(Allocation $allocation)
    {
        if ($allocation->proof_path) {
            Storage::disk('public')->delete($allocation->proof_path);
        }

        $allocation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Alokasi berhasil dihapus.'
        ]);
    }

    /**
     * Get programs that can be allocated for a specific user
     */
    public function getAllocatablePrograms($userId)
    {
        // 1. Get Confirm/Paid Donations grouped by program
        $donations = \App\Models\Donation::where('user_id', $userId)
            ->where('status', 'paid')
            ->selectRaw('program_id, SUM(amount) as total_donated')
            ->groupBy('program_id')
            ->get()
            ->keyBy('program_id');

        // 2. Get Allocations grouped by program
        $allocations = Allocation::where('user_id', $userId)
            ->selectRaw('program_id, SUM(amount) as total_allocated')
            ->groupBy('program_id')
            ->get()
            ->keyBy('program_id');

        // 3. Calculate remaining balance per program
        $allocatable = [];

        foreach ($donations as $programId => $donation) {
            $allocated = $allocations[$programId]->total_allocated ?? 0;
            $remaining = $donation->total_donated - $allocated;

            if ($remaining > 0) {
                // Fetch program title
                $programTitle = 'Dana Umum / Tak Terikat';
                if ($programId) {
                    $program = \App\Models\Program::find($programId);
                    $programTitle = $program ? $program->title : 'Unknown Program';
                }

                $allocatable[] = [
                    'program_id' => $programId, // null for General
                    'program_title' => $programTitle,
                    'remaining_balance' => $remaining
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $allocatable
        ]);
    }
}
