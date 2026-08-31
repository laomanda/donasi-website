<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use App\Models\Program;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\Admin\AllocationRequest;
use App\Exports\AllocationReportExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class AllocationController extends Controller
{
    /**
     * Export allocations to Excel or PDF
     */
    public function export(Request $request)
    {
        $format = strtolower($request->string('format', 'pdf')->trim()->toString());

        $query = Allocation::with(['program', 'user', 'donation']);

        if ($request->filled('q')) {
            $q = trim((string) $request->q);
            $query->where(function ($sub) use ($q) {
                $sub->where('description', 'like', "%{$q}%")
                    ->orWhereHas('program', function ($p) use ($q) {
                        $p->where('title', 'like', "%{$q}%");
                    })
                    ->orWhereHas('user', function ($u) use ($q) {
                        $u->where('name', 'like', "%{$q}%");
                    })
                    ->orWhereHas('donation', function ($d) use ($q) {
                        $d->where('donor_name', 'like', "%{$q}%")
                          ->orWhere('donation_code', 'like', "%{$q}%");
                    });
            });
        }

        $programTitle = 'Semua Program';
        if ($request->filled('program_id')) {
            $progVal = (string) $request->program_id;
            if ($progVal === 'general' || $progVal === 'null' || $progVal === '0') {
                $query->whereNull('program_id');
                $programTitle = 'Dana Umum / Infaq & Wakaf Terbuka';
            } else {
                $query->where('program_id', $progVal);
                $prog = Program::find($progVal);
                if ($prog) {
                    $programTitle = $prog->title;
                }
            }
        }

        if ($request->filled('category')) {
            $cat = trim((string) $request->category);
            if (strtolower($cat) === 'umum') {
                $query->whereNull('program_id');
            } else {
                $query->whereHas('program', function ($p) use ($cat) {
                    $p->where('category', $cat);
                });
            }
        }

        if ($request->filled('date_from')) {
            $query->whereDate('allocated_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('allocated_at', '<=', $request->date_to);
        }

        $allocations = $query->orderByDesc('allocated_at')->latest('id')->get();
        $timestamp = now()->format('Ymd_His');

        if (in_array($format, ['xlsx', 'excel'], true)) {
            return Excel::download(
                new AllocationReportExport($allocations),
                "laporan-penyaluran-dpf-{$timestamp}.xlsx"
            );
        }

        if ($format === 'pdf') {
            $filters = [
                'q' => $request->string('q')->trim()->toString(),
                'program_title' => $programTitle,
                'date_from' => $request->string('date_from')->trim()->toString(),
                'date_to' => $request->string('date_to')->trim()->toString(),
            ];

            $pdf = Pdf::loadView('reports.allocations', [
                'allocations' => $allocations,
                'filters' => $filters,
                'generatedAt' => now(),
            ])->setPaper('a4', 'portrait');

            return $pdf->download("laporan-penyaluran-dpf-{$timestamp}.pdf");
        }

        return response()->json(['message' => 'Format export tidak didukung.'], 400);
    }
    /**
     * List all allocations (Admin/Superadmin view)
     */
    public function index(Request $request)
    {
        $query = Allocation::with(['program', 'user', 'donation']);

        if ($request->filled('q')) {
            $q = trim((string) $request->q);
            $query->where(function ($sub) use ($q) {
                $sub->where('description', 'like', "%{$q}%")
                    ->orWhereHas('program', function ($p) use ($q) {
                        $p->where('title', 'like', "%{$q}%");
                    })
                    ->orWhereHas('user', function ($u) use ($q) {
                        $u->where('name', 'like', "%{$q}%");
                    })
                    ->orWhereHas('donation', function ($d) use ($q) {
                        $d->where('donor_name', 'like', "%{$q}%")
                          ->orWhere('donation_code', 'like', "%{$q}%");
                    });
            });
        }

        if ($request->filled('program_id')) {
            $progVal = (string) $request->program_id;
            if ($progVal === 'general' || $progVal === 'null' || $progVal === '0') {
                $query->whereNull('program_id');
            } else {
                $query->where('program_id', $progVal);
            }
        }

        if ($request->filled('category')) {
            $cat = trim((string) $request->category);
            if (strtolower($cat) === 'umum') {
                $query->whereNull('program_id');
            } else {
                $query->whereHas('program', function ($p) use ($cat) {
                    $p->where('category', $cat);
                });
            }
        }

        if ($request->filled('date_from')) {
            $query->whereDate('allocated_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('allocated_at', '<=', $request->date_to);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->orderByDesc('allocated_at')->latest('id')->paginate($request->integer('per_page', 25))
        ]);
    }

    /**
     * Show a single allocation
     */
    public function show(Allocation $allocation)
    {
        return response()->json([
            'status' => 'success',
            'data' => $allocation->load(['program', 'user', 'donation.program'])
        ]);
    }

    /**
     * Store a new allocation (Admin Action)
     */
    public function store(AllocationRequest $request)
    {
        $data = $request->validated();
        $programId = !empty($data['program_id']) ? (int) $data['program_id'] : null;
        $amount = (float) $data['amount'];

        // Balance validation based on program or general fund
        if ($programId) {
            /** @var Program $program */
            $program = Program::findOrFail($programId);
            $totalCollected = (float) $program->collected_amount;
            $totalAllocated = (float) Allocation::where('program_id', $program->id)->sum('amount');
            $remaining = max(0, $totalCollected - $totalAllocated);

            if ($amount > $remaining + 0.01) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nominal penyaluran melebihi sisa dana program ini (Maksimal tersedia: Rp ' . number_format($remaining, 0, ',', '.') . ').'
                ], 422);
            }
        } else {
            $generalDonations = (float) Donation::whereNull('program_id')->where('status', 'paid')->sum('amount');
            $generalAllocated = (float) Allocation::whereNull('program_id')->sum('amount');
            $generalRemaining = max(0, $generalDonations - $generalAllocated);

            if ($amount > $generalRemaining + 0.01) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nominal penyaluran melebihi sisa saldo dana umum (Maksimal tersedia: Rp ' . number_format($generalRemaining, 0, ',', '.') . ').'
                ], 422);
            }
        }

        // Upload proof if exists
        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('allocations/proofs', 'public');
        }

        $description = !empty($data['description']) ? trim($data['description']) : 'Penyaluran dana program';

        $allocation = Allocation::create([
            'user_id'      => $data['user_id'] ?? null,
            'donation_id'  => $data['donation_id'] ?? null,
            'program_id'   => $programId,
            'amount'       => $amount,
            'description'  => $description,
            'proof_path'   => $proofPath,
            'allocated_at' => !empty($data['allocated_at']) ? $data['allocated_at'] : now()->toDateString(),
        ]);

        // Invalidate program public cache
        if ($programId) {
            $prog = Program::find($programId);
            if ($prog) {
                Cache::forget("frontend_program_show_{$prog->slug}");
                if ($prog->slug_en) {
                    Cache::forget("frontend_program_show_{$prog->slug_en}");
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Penyaluran dana berhasil disimpan.',
            'data' => $allocation->load(['program'])
        ], 201);
    }

    /**
     * Update an existing allocation
     */
    public function update(AllocationRequest $request, Allocation $allocation)
    {
        $data = $request->validated();
        $programId = !empty($data['program_id']) ? (int) $data['program_id'] : null;
        $amount = (float) $data['amount'];
        $oldProgramId = $allocation->program_id;

        // Balance validation excluding this allocation record
        if ($programId) {
            /** @var Program $program */
            $program = Program::findOrFail($programId);
            $totalCollected = (float) $program->collected_amount;
            $otherAllocated = (float) Allocation::where('program_id', $program->id)
                ->where('id', '!=', $allocation->id)
                ->sum('amount');
            $remaining = max(0, $totalCollected - $otherAllocated);

            if ($amount > $remaining + 0.01) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nominal penyaluran melebihi sisa dana program ini (Maksimal tersedia: Rp ' . number_format($remaining, 0, ',', '.') . ').'
                ], 422);
            }
        } else {
            $generalDonations = (float) Donation::whereNull('program_id')->where('status', 'paid')->sum('amount');
            $otherGeneralAllocated = (float) Allocation::whereNull('program_id')
                ->where('id', '!=', $allocation->id)
                ->sum('amount');
            $generalRemaining = max(0, $generalDonations - $otherGeneralAllocated);

            if ($amount > $generalRemaining + 0.01) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nominal penyaluran melebihi sisa saldo dana umum (Maksimal tersedia: Rp ' . number_format($generalRemaining, 0, ',', '.') . ').'
                ], 422);
            }
        }

        // Upload proof if exists or handle removal
        $proofPath = $allocation->proof_path;
        if ($request->hasFile('proof')) {
            if ($allocation->proof_path) {
                Storage::disk('public')->delete($allocation->proof_path);
            }
            $proofPath = $request->file('proof')->store('allocations/proofs', 'public');
        } elseif ($request->boolean('remove_proof', false)) {
            if ($allocation->proof_path) {
                Storage::disk('public')->delete($allocation->proof_path);
            }
            $proofPath = null;
        }

        $description = !empty($data['description']) ? trim($data['description']) : 'Penyaluran dana program';

        $allocation->update([
            'program_id'   => $programId,
            'amount'       => $amount,
            'description'  => $description,
            'proof_path'   => $proofPath,
            'allocated_at' => !empty($data['allocated_at']) ? $data['allocated_at'] : $allocation->allocated_at,
        ]);

        // Invalidate cache for previous and current program
        $programsToInvalidate = array_filter(array_unique([$oldProgramId, $programId]));
        foreach ($programsToInvalidate as $pid) {
            $prog = Program::find($pid);
            if ($prog) {
                Cache::forget("frontend_program_show_{$prog->slug}");
                if ($prog->slug_en) {
                    Cache::forget("frontend_program_show_{$prog->slug_en}");
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Penyaluran dana berhasil diperbarui.',
            'data' => $allocation->fresh(['program', 'user', 'donation'])
        ]);
    }

    /**
     * Remove an allocation
     */
    public function destroy(Allocation $allocation)
    {
        $programId = $allocation->program_id;

        if ($allocation->proof_path) {
            Storage::disk('public')->delete($allocation->proof_path);
        }

        $allocation->delete();

        if ($programId) {
            $prog = Program::find($programId);
            if ($prog) {
                Cache::forget("frontend_program_show_{$prog->slug}");
                if ($prog->slug_en) {
                    Cache::forget("frontend_program_show_{$prog->slug_en}");
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Penyaluran berhasil dihapus.'
        ]);
    }

    /**
     * Get all programs that can be allocated with their collected amount & available balance
     */
    public function getAllocatablePrograms(Request $request, $userId = null)
    {
        $programs = Program::orderBy('title')->get();
        $allocatable = [];

        // General Fund
        $generalDonations = (float) Donation::whereNull('program_id')->where('status', 'paid')->sum('amount');
        $generalAllocated = (float) Allocation::whereNull('program_id')->sum('amount');
        $generalRemaining = max(0, $generalDonations - $generalAllocated);

        $allocatable[] = [
            'program_id'        => null,
            'program_title'     => 'Dana Umum / Infaq & Wakaf Terbuka',
            'category'          => 'Umum',
            'collected_amount'  => $generalDonations,
            'total_allocated'   => $generalAllocated,
            'remaining_balance' => $generalRemaining,
        ];

        // Specific Programs
        foreach ($programs as $prog) {
            $totalCollected = (float) $prog->collected_amount;
            $totalAllocated = (float) Allocation::where('program_id', $prog->id)->sum('amount');
            $remaining = max(0, $totalCollected - $totalAllocated);

            $allocatable[] = [
                'program_id'        => $prog->id,
                'program_title'     => $prog->title,
                'category'          => $prog->category,
                'collected_amount'  => $totalCollected,
                'total_allocated'   => $totalAllocated,
                'remaining_balance' => $remaining,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $allocatable
        ]);
    }

    /**
     * Get public (paid) donations that can be allocated (legacy fallback)
     */
    public function getAllocatablePublicDonations(Request $request)
    {
        $includeDepleted = $request->boolean('include_depleted', false);

        $donations = Donation::with(['program', 'allocations'])
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
