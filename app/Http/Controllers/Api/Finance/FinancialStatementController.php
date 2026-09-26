<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\FinancialStatementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialStatementController extends Controller
{
    public function __construct(
        protected FinancialStatementService $financialStatementService
    ) {}

    /**
     * Display the Balance Sheet (Laporan Posisi Keuangan - LP).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function balanceSheet(Request $request): JsonResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $report = $this->financialStatementService->getBalanceSheet(
            $periodId,
            $startDate,
            $endDate
        );

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }

    /**
     * Display the Activity Statement (Laporan Aktivitas - LA).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function activityStatement(Request $request): JsonResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $report = $this->financialStatementService->getActivityStatement(
            $periodId,
            $startDate,
            $endDate
        );

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }
}
