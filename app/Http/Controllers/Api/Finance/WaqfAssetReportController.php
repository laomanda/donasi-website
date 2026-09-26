<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\WaqfAssetReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WaqfAssetReportController extends Controller
{
    public function __construct(
        protected WaqfAssetReportService $assetReportService
    ) {}

    /**
     * Display the Waqf Asset Report (LRAW).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category_id'          => ['nullable', 'integer', 'exists:waqf_asset_categories,id'],
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'status'               => ['nullable', 'string', 'in:active,disposed,transferred'],
        ]);

        $categoryId = $request->filled('category_id') ? (int) $request->input('category_id') : null;
        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);
        $status = $request->input('status');

        $report = $this->assetReportService->getReport(
            $categoryId,
            $periodId,
            $status
        );

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }

    /**
     * Display the asset register array only.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'category_id'          => ['nullable', 'integer', 'exists:waqf_asset_categories,id'],
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'status'               => ['nullable', 'string', 'in:active,disposed,transferred'],
        ]);

        $categoryId = $request->filled('category_id') ? (int) $request->input('category_id') : null;
        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);
        $status = $request->input('status');

        $register = $this->assetReportService->getAssetRegister(
            $categoryId,
            $periodId,
            $status
        );

        return response()->json([
            'status' => 'success',
            'data'   => $register,
        ]);
    }

    /**
     * Display details of a specific waqf asset.
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'period_id'            => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
        ]);

        $periodId = $request->filled('period_id')
            ? (int) $request->input('period_id')
            : ($request->filled('accounting_period_id') ? (int) $request->input('accounting_period_id') : null);

        $detail = $this->assetReportService->getAssetDetail($id, $periodId);

        if (!$detail) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Asset not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $detail,
        ]);
    }
}
