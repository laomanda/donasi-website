<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\TrialBalanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrialBalanceController extends Controller
{
    public function __construct(
        protected TrialBalanceService $trialBalanceService
    ) {}

    /**
     * Display the Trial Balance report based on posted journals.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
            'include_zero_balance' => ['nullable', 'boolean'],
        ]);

        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $includeZeroBalance = $request->boolean('include_zero_balance', false);

        $trialBalance = $this->trialBalanceService->getTrialBalance(
            $periodId,
            $startDate,
            $endDate,
            $includeZeroBalance
        );

        return response()->json([
            'status' => 'success',
            'data'   => $trialBalance,
        ]);
    }
}
