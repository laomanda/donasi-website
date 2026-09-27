<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\FinanceReconciliationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceReconciliationController extends Controller
{
    public function __construct(
        protected FinanceReconciliationService $reconciliationService
    ) {}

    /**
     * Run full finance reconciliation and return detailed check report.
     * GET /api/v1/finance/reconciliation
     */
    public function index(Request $request): JsonResponse
    {
        $periodId = $request->query('period_id', $request->query('accounting_period_id'));
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $result = $this->reconciliationService->reconcile(
            $periodId ? (int) $periodId : null,
            $startDate,
            $endDate
        );

        return response()->json($result, 200);
    }

    /**
     * Return high-level summary of finance reconciliation.
     * GET /api/v1/finance/reconciliation/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $periodId = $request->query('period_id', $request->query('accounting_period_id'));
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $result = $this->reconciliationService->summary(
            $periodId ? (int) $periodId : null,
            $startDate,
            $endDate
        );

        return response()->json($result, 200);
    }
}
