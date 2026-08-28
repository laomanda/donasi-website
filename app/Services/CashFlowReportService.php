<?php

namespace App\Services;

use App\Models\Allocation;
use App\Models\Donation;
use App\Models\Program;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CashFlowReportService
{
    /**
     * Get compiled cash flow data with summaries, breakdowns, and mutations.
     *
     * @return array{
     *     summary: array<string, mixed>,
     *     program_breakdowns: array<int, array<string, mixed>>,
     *     mutations: Collection<int, array<string, mixed>>,
     *     filters: array<string, mixed>
     * }
     */
    public function getCashFlowData(Request $request): array
    {
        $dateFrom = $request->filled('date_from') ? Carbon::parse($request->input('date_from')) : null;
        $dateTo = $request->filled('date_to') ? Carbon::parse($request->input('date_to')) : null;
        $programId = $request->filled('program_id') ? (int) $request->input('program_id') : null;
        $search = trim((string) $request->input('q', ''));

        // 1. Inflow Query (Paid Donations)
        $inflowQuery = Donation::query()
            ->with('program')
            ->where('status', 'paid');

        if ($dateFrom) {
            $inflowQuery->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $inflowQuery->whereDate('created_at', '<=', $dateTo);
        }
        if ($programId) {
            $inflowQuery->where('program_id', $programId);
        }
        if ($search !== '') {
            $inflowQuery->where(function ($q) use ($search) {
                $q->where('donor_name', 'like', "%{$search}%")
                  ->orWhere('donation_code', 'like', "%{$search}%");
            });
        }

        // 2. Outflow Query (Allocations)
        $outflowQuery = Allocation::query()
            ->with(['program', 'user', 'donation']);

        if ($dateFrom) {
            $outflowQuery->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $outflowQuery->whereDate('created_at', '<=', $dateTo);
        }
        if ($programId) {
            $outflowQuery->where('program_id', $programId);
        }
        if ($search !== '') {
            $outflowQuery->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Summary metrics
        $totalInflow = (float) (clone $inflowQuery)->sum('amount');
        $totalInflowCount = (int) (clone $inflowQuery)->count();

        $totalOutflow = (float) (clone $outflowQuery)->sum('amount');
        $totalOutflowCount = (int) (clone $outflowQuery)->count();

        $netCashFlow = $totalInflow - $totalOutflow;
        $disbursementRatio = $totalInflow > 0 ? round(($totalOutflow / $totalInflow) * 100, 2) : 0;

        // 3. Program Ring-Fenced Breakdown
        $programs = Program::query()
            ->when($programId, fn ($q) => $q->where('id', $programId))
            ->get();

        $programBreakdowns = [];
        foreach ($programs as $prog) {
            $progInflow = (float) Donation::query()
                ->where('program_id', $prog->id)
                ->where('status', 'paid')
                ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->sum('amount');

            $progOutflow = (float) Allocation::query()
                ->where('program_id', $prog->id)
                ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->sum('amount');

            $balance = $progInflow - $progOutflow;
            $ratio = $progInflow > 0 ? round(($progOutflow / $progInflow) * 100, 1) : 0;

            if ($progInflow > 0 || $progOutflow > 0 || $programId) {
                $programBreakdowns[] = [
                    'program_id' => $prog->id,
                    'program_title' => $prog->title,
                    'category' => $prog->category,
                    'target_amount' => (float) ($prog->target_amount ?? 0),
                    'inflow_amount' => $progInflow,
                    'outflow_amount' => $progOutflow,
                    'remaining_balance' => $balance,
                    'disbursement_ratio' => $ratio,
                    'status' => $balance > 0 ? 'surplus' : ($balance === 0.0 ? 'balanced' : 'deficit'),
                ];
            }
        }

        // 4. Unified Mutasi List
        $donations = (clone $inflowQuery)->orderByDesc('created_at')->get();
        $allocations = (clone $outflowQuery)->orderByDesc('created_at')->get();

        $mutations = [];

        foreach ($donations as $don) {
            $dateString = $don->created_at instanceof Carbon 
                ? $don->created_at->toIso8601String() 
                : ($don->created_at ? Carbon::parse($don->created_at)->toIso8601String() : now()->toIso8601String());

            $mutations[] = [
                'id' => 'IN-' . $don->id,
                'raw_id' => $don->id,
                'type' => 'inflow',
                'date' => $dateString,
                'code' => $don->donation_code ?: '#' . $don->id,
                'title' => $don->donor_name ?: 'Hamba Allah (Anonim)',
                'subtitle' => $don->payment_source ? ucfirst($don->payment_source) : 'Transfer',
                'program_id' => $don->program_id,
                'program_title' => $don->program?->title ?: 'Program Umum',
                'amount' => (float) $don->amount,
                'proof_path' => $don->manual_proof_path,
            ];
        }

        foreach ($allocations as $alloc) {
            $actorName = $alloc->donation?->donor_name 
                ?: ($alloc->user?->name ?: 'Penyaluran Program');

            $dateString = $alloc->created_at instanceof Carbon 
                ? $alloc->created_at->toIso8601String() 
                : ($alloc->created_at ? Carbon::parse($alloc->created_at)->toIso8601String() : now()->toIso8601String());

            $mutations[] = [
                'id' => 'OUT-' . $alloc->id,
                'raw_id' => $alloc->id,
                'type' => 'outflow',
                'date' => $dateString,
                'code' => 'ALC-' . str_pad((string) $alloc->id, 5, '0', STR_PAD_LEFT),
                'title' => $alloc->description ?: 'Penyaluran Manfaat',
                'subtitle' => $actorName,
                'program_id' => $alloc->program_id,
                'program_title' => $alloc->program?->title ?: ($alloc->donation?->program?->title ?: 'Program Umum'),
                'amount' => (float) $alloc->amount,
                'proof_path' => $alloc->proof_path,
            ];
        }

        // Sort descending by date
        $sortedMutations = collect($mutations)->sortByDesc('date')->values();

        return [
            'summary' => [
                'total_inflow' => $totalInflow,
                'total_inflow_count' => $totalInflowCount,
                'total_outflow' => $totalOutflow,
                'total_outflow_count' => $totalOutflowCount,
                'net_cash_flow' => $netCashFlow,
                'disbursement_ratio' => $disbursementRatio,
            ],
            'program_breakdowns' => $programBreakdowns,
            'mutations' => $sortedMutations,
            'filters' => [
                'date_from' => $dateFrom?->format('Y-m-d'),
                'date_to' => $dateTo?->format('Y-m-d'),
                'program_id' => $programId,
                'q' => $search,
            ],
        ];
    }
}
