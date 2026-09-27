<?php

namespace App\Http\Controllers\Api\Finance;

use App\Exports\Finance\JournalTemplateExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\JournalImportRequest;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Services\FinanceJournalImportPreviewService;
use App\Services\FinanceJournalImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FinanceJournalImportController extends Controller
{
    public function __construct(
        protected FinanceJournalImportService $importService,
        protected FinanceJournalImportPreviewService $previewService
    ) {}

    /**
     * Download official Journal Umum (JU) Excel template.
     * GET /api/v1/finance/import/journals/template
     */
    public function template(Request $request): BinaryFileResponse
    {
        $user = $request->user();

        if ($user) {
            AuditLog::create([
                'user_id'      => $user->id,
                'module'       => 'finance_import',
                'action'       => 'template_download',
                'reference_id' => null,
                'old_data'     => null,
                'new_data'     => ['template_name' => 'template_jurnal_umum.xlsx'],
            ]);
        }

        return Excel::download(new JournalTemplateExport(), 'template_jurnal_umum.xlsx');
    }

    /**
     * Preview and validate Journal Umum Excel before committing to database.
     * POST /api/v1/finance/import/journals/preview
     */
    public function preview(JournalImportRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $user = $request->user();

        $result = $this->previewService->previewJournalEntries($file, $user);

        $statusCode = ($result['status'] ?? '') === 'success' ? 200 : 422;

        return response()->json($result, $statusCode);
    }

    /**
     * Confirm and execute journal import into database.
     * POST /api/v1/finance/import/journals/confirm
     */
    public function confirm(JournalImportRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = null;
        $tempPath = null;

        if ($request->filled('batch_token')) {
            $batchToken = basename($request->input('batch_token'));
            $tempPath = storage_path('app/temp_imports/' . $batchToken . '.xlsx');

            if (!file_exists($tempPath)) {
                return response()->json([
                    'status'  => 'failed',
                    'message' => 'Token preview import tidak valid atau telah kadaluarsa.',
                ], 422);
            }

            $file = new UploadedFile(
                $tempPath,
                'journal_entries.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                null,
                true
            );
        } elseif ($request->hasFile('file')) {
            $file = $request->file('file');
        } else {
            return response()->json([
                'status'  => 'failed',
                'message' => 'Harap sertakan batch_token hasil preview atau file Excel untuk konfirmasi import jurnal.',
            ], 422);
        }

        try {
            $result = $this->importService->importJournalEntries($file, $user);

            $statusCode = ($result['status'] ?? '') === 'success' ? 200 : 422;

            return response()->json($result, $statusCode);
        } finally {
            if ($tempPath && file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }
    }

    /**
     * Get list of journal import batches (Import History).
     * GET /api/v1/finance/import/journals/history
     */
    public function history(Request $request): JsonResponse
    {
        $batches = ImportBatch::where('module', 'journal_entries')
            ->with(['importer', 'errors'])
            ->orderBy('id', 'desc')
            ->get();

        $history = $batches->map(function (ImportBatch $batch) {
            $stats = $this->resolveBatchStats($batch);

            return [
                'id'             => $batch->id,
                'filename'       => $batch->file_name,
                'module'         => $batch->module,
                'status'         => $batch->status,
                'total_rows'     => $stats['total_rows'],
                'total_journals' => $stats['total_journals'],
                'success_rows'   => $stats['success_rows'],
                'failed_rows'    => $stats['failed_rows'],
                'user'           => $batch->importer?->name ?? 'Admin Finance',
                'created_at'     => $batch->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($history);
    }

    /**
     * Get details and errors of a specific journal import batch.
     * GET /api/v1/finance/import/journals/history/{id}
     */
    public function showHistory(int $id, Request $request): JsonResponse
    {
        $batch = ImportBatch::where('module', 'journal_entries')
            ->with(['importer', 'errors'])
            ->findOrFail($id);

        $stats = $this->resolveBatchStats($batch);

        $errors = $batch->errors->map(function ($err) {
            return [
                'row'     => (int) $err->row_number,
                'message' => (string) $err->error_message,
            ];
        })->values();

        return response()->json([
            'batch' => [
                'id'             => $batch->id,
                'filename'       => $batch->file_name,
                'status'         => $batch->status,
                'total_rows'     => $stats['total_rows'],
                'total_journals' => $stats['total_journals'],
                'success_rows'   => $stats['success_rows'],
                'failed_rows'    => $stats['failed_rows'],
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
            ->whereIn('action', ['confirm_journal_import', 'journal_import_failed'])
            ->latest()
            ->first();

        $newData = $audit?->new_data ?? [];

        $totalRows = (int) ($newData['total_rows'] ?? 0);
        $totalJournals = (int) ($newData['total_journals'] ?? 0);
        $successRows = (int) ($newData['success_rows'] ?? 0);
        $failedRows = (int) ($newData['failed_rows'] ?? $batch->errors->count());

        if ($totalRows === 0 && $batch->status === 'completed') {
            $totalRows = $successRows;
        } elseif ($totalRows === 0 && $batch->status === 'failed') {
            $totalRows = $failedRows;
        }

        return [
            'total_rows'     => $totalRows,
            'total_journals' => $totalJournals,
            'success_rows'   => $successRows,
            'failed_rows'    => $failedRows,
        ];
    }
}
