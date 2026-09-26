<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\GeneralLedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeneralLedgerController extends Controller
{
    public function __construct(
        protected GeneralLedgerService $generalLedgerService
    ) {}

    /**
     * Display the General Ledger report based on posted journals.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_id'           => ['nullable', 'integer', 'exists:accounts,id'],
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'start_date'           => ['nullable', 'date'],
            'end_date'             => ['nullable', 'date', 'after_or_equal:start_date'],
            'include_zero_balance' => ['nullable', 'boolean'],
        ]);

        $accountId = $request->filled('account_id') ? (int) $request->input('account_id') : null;
        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $includeZeroBalance = $request->boolean('include_zero_balance', false);

        $ledger = $this->generalLedgerService->getLedger(
            $accountId,
            $periodId,
            $startDate,
            $endDate,
            $includeZeroBalance
        );

        return response()->json([
            'status' => 'success',
            'data'   => $ledger,
        ]);
    }
}
