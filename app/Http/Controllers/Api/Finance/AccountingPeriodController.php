<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\AccountingPeriodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AccountingPeriodController extends Controller
{
    public function __construct(
        protected AccountingPeriodService $periodService
    ) {}

    /**
     * Display a listing of accounting periods.
     * GET /api/v1/finance/accounting-periods
     */
    public function index(Request $request): JsonResponse
    {
        $periods = $this->periodService->listPeriods();

        return response()->json([
            'status' => 'success',
            'data' => $periods,
        ]);
    }

    /**
     * Display the specified accounting period with metrics.
     * GET /api/v1/finance/accounting-periods/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $data = $this->periodService->getPeriodDetail($id);

            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Accounting period not found',
                'errors' => $e->errors(),
            ], 404);
        }
    }

    /**
     * Close an accounting period.
     * POST /api/v1/finance/accounting-periods/{id}/close
     */
    public function close(int $id, Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || (! $user->hasAnyRole(['keuangan', 'superadmin']) && ! $user->hasAnyPermission(['keuangan', 'superadmin']))) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Unauthorized. Only keuangan or superadmin can close accounting period.',
                'errors' => ['Unauthorized. Only keuangan or superadmin can close accounting period.'],
            ], 403);
        }

        try {
            $period = $this->periodService->closePeriod($id, $request->user());

            return response()->json([
                'status' => 'success',
                'message' => 'Accounting period closed successfully',
                'data' => [
                    'period_id' => $period->id,
                    'status' => 'closed',
                    'closed_at' => $period->closed_at ? $period->closed_at->toIso8601String() : null,
                    'closed_by' => $period->closed_by,
                ],
            ]);
        } catch (ValidationException $e) {
            $flatErrors = [];
            foreach ($e->errors() as $messages) {
                foreach ($messages as $msg) {
                    $flatErrors[] = $msg;
                }
            }

            return response()->json([
                'status' => 'failed',
                'message' => 'Accounting period cannot be closed',
                'errors' => $flatErrors,
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Accounting period cannot be closed',
                'errors' => [$e->getMessage()],
            ], 422);
        }
    }
}
