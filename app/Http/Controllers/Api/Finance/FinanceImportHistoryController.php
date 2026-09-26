<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceImportHistoryController extends Controller
{
    /**
     * Get list of import batches (Import History).
     * GET /api/v1/finance/import/history
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Audit Log for viewing history
        if ($user) {
            AuditLog::create([
                'user_id'      => $user->id,
                'module'       => 'finance_import',
                'action'       => 'view_history',
                'reference_id' => null,
                'old_data'     => null,
                'new_data'     => ['timestamp' => now()->toIso8601String()],
            ]);
        }

        $batches = ImportBatch::with(['importer', 'errors'])
            ->orderBy('id', 'desc')
            ->get();

        $history = $batches->map(function (ImportBatch $batch) {
            $stats = $this->resolveBatchStats($batch);

            return [
                'id'           => $batch->id,
                'filename'     => $batch->file_name,
                'module'       => $batch->module,
                'status'       => $batch->status,
                'total_rows'   => $stats['total_rows'],
                'success_rows' => $stats['success_rows'],
                'failed_rows'  => $stats['failed_rows'],
                'user'         => $batch->importer?->name ?? 'Admin Finance',
                'created_at'   => $batch->created_at?->format('Y-m-d'),
            ];
        });

        return response()->json($history);
    }

    /**
     * Get details and errors of a specific import batch.
     * GET /api/v1/finance/import/history/{id}
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $batch = ImportBatch::with(['importer', 'errors'])->findOrFail($id);
        $stats = $this->resolveBatchStats($batch);

        $errors = $batch->errors->map(function ($err) {
            return [
                'row'     => (int) $err->row_number,
                'message' => (string) $err->error_message,
                'data'    => '',
            ];
        })->values();

        return response()->json([
            'batch' => [
                'filename'     => $batch->file_name,
                'status'       => $batch->status,
                'total_rows'   => $stats['total_rows'],
                'success_rows' => $stats['success_rows'],
                'failed_rows'  => $stats['failed_rows'],
            ],
            'errors' => $errors,
        ]);
    }

    /**
     * Resolve batch row counts from AuditLog or fallback calculation.
     */
    protected function resolveBatchStats(ImportBatch $batch): array
    {
        $audit = AuditLog::where('reference_id', $batch->id)
            ->where('module', 'finance_import')
            ->whereIn('action', ['import_accounts', 'confirm_import'])
            ->latest()
            ->first();

        $newData = $audit?->new_data ?? [];

        $totalRows = (int) ($newData['total_rows'] ?? 0);
        $successRows = (int) ($newData['success_rows'] ?? 0);
        $failedRows = (int) ($newData['failed_rows'] ?? $batch->errors->count());

        if ($totalRows === 0 && $batch->status === 'completed') {
            $totalRows = $successRows;
        } elseif ($totalRows === 0 && $batch->status === 'failed') {
            $totalRows = $failedRows;
        }

        return [
            'total_rows'   => $totalRows,
            'success_rows' => $successRows,
            'failed_rows'  => $failedRows,
        ];
    }
}
