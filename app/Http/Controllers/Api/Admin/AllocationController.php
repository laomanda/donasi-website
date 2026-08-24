<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\Admin\AllocationRequest;

class AllocationController extends Controller
{
    /**
     * List all allocations (Admin/Superadmin view)
     */
    public function index(Request $request)
    {
        $query = Allocation::with(['user', 'donation.program', 'program']);

        if ($request->has('q') && !empty($request->q)) {
            $q = $request->q;
            $query->where(function($sub) use ($q) {
                $sub->whereHas('user', function($u) use ($q) {
                        $u->where('name', 'like', "%{$q}%");
                    })
                    ->orWhereHas('donation', function($d) use ($q) {
                        $d->where('donor_name', 'like', "%{$q}%")
                          ->orWhere('donor_email', 'like', "%{$q}%")
                          ->orWhere('donor_phone', 'like', "%{$q}%")
                          ->orWhere('donation_code', 'like', "%{$q}%");
                    })
                    ->orWhereHas('program', function($p) use ($q) {
                        $p->where('title', 'like', "%{$q}%");
                    })
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('donation_id')) {
            $query->where('donation_id', $request->donation_id);
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
    public function store(AllocationRequest $request)
    {
        $data = $request->validated();

        if (empty($data['user_id']) && empty($data['donation_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Harus memilih Mitra Terdaftar atau Donatur Publik.'
            ], 422);
        }

        // Upload proof if exists
        if ($request->hasFile('proof')) {
            $data['proof_path'] = $request->file('proof')->store('allocations/proofs', 'public');
        }

        // If donation_id is provided, auto-set program_id from donation if missing
        if (!empty($data['donation_id'])) {
            $donation = \App\Models\Donation::findOrFail($data['donation_id']);
            if (empty($data['program_id'])) {
                $data['program_id'] = $donation->program_id;
            }

            // Check remaining balance
            $totalAllocated = Allocation::where('donation_id', $donation->id)->sum('amount');
            $remaining = max(0, (float) $donation->amount - $totalAllocated);
            if ((float) $data['amount'] > $remaining + 0.01) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nominal penyaluran melebihi sisa dana donasi ini (Maksimal: Rp ' . number_format($remaining, 0, ',', '.') . ').'
                ], 422);
            }
        }

        $allocation = Allocation::create([
            'user_id'     => $data['user_id'] ?? null,
            'donation_id' => $data['donation_id'] ?? null,
            'program_id'  => $data['program_id'] ?? null,
            'amount'      => $data['amount'],
            'description' => $data['description'],
            'proof_path'  => $data['proof_path'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Penyaluran dana berhasil disimpan.',
            'data' => $allocation->load(['user', 'donation.program', 'program'])
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
            'message' => 'Penyaluran berhasil dihapus.'
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

    /**
     * Get public (paid) donations that can be allocated
     */
    public function getAllocatablePublicDonations(Request $request)
    {
        $includeDepleted = $request->boolean('include_depleted', false);

        $donations = \App\Models\Donation::with(['program', 'allocations'])
            ->where('status', 'paid')
            ->latest('paid_at')
            ->get();

        $result = [];
        foreach ($donations as $donation) {
            $totalAllocated = $donation->allocations->sum('amount');
            $remaining = max(0, (float) $donation->amount - $totalAllocated);

            if ($remaining > 0 || $includeDepleted) {
                $result[] = [
                    'id' => $donation->id,
                    'donation_code' => $donation->donation_code,
                    'donor_name' => $donation->donor_name ?: 'Hamba Allah (Anonim)',
                    'donor_email' => $donation->donor_email,
                    'donor_phone' => $donation->donor_phone,
                    'program_id' => $donation->program_id,
                    'program_title' => $donation->program ? $donation->program->title : 'Dana Umum / Wakaf Terbuka',
                    'amount' => (float) $donation->amount,
                    'total_allocated' => $totalAllocated,
                    'remaining_balance' => $remaining,
                    'is_depleted' => $remaining <= 0,
                    'paid_at' => $donation->paid_at?->toIso8601String(),
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $result
        ]);
    }
}
