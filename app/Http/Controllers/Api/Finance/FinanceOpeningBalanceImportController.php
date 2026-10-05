<?php

namespace App\Http\Controllers\Api\Finance;

use App\Exports\Finance\OpeningBalanceTemplateExport;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Rules\FinanceExcelFileRule;
use App\Services\FinanceOpeningBalanceImportService;
use App\Services\FinanceOpeningBalancePreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FinanceOpeningBalanceImportController extends Controller
{
    public function __construct(
        protected FinanceOpeningBalanceImportService $importService,
        protected FinanceOpeningBalancePreviewService $previewService
    ) {}

    /**
     * Download official Opening Balance Excel template.
     * GET /api/v1/finance/import/opening-balance/template
     */
    public function template(Request $request): BinaryFileResponse
    {
        $user = $request->user();

        if ($user) {
            AuditLog::create([
                'user_id' => $user->id,
                'module' => 'finance_import',
                'action' => 'template_download',
                'reference_id' => null,
                'old_data' => null,
                'new_data' => ['template_name' => 'template_saldo_awal.xlsx'],
            ]);
        }

        return Excel::download(new OpeningBalanceTemplateExport, 'template_saldo_awal.xlsx');
    }

    /**
     * Preview and validate Opening Balance Excel before committing to database.
     * POST /api/v1/finance/import/opening-balance/preview
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['bail', 'required', 'file', 'max:15360', new FinanceExcelFileRule()],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
        ], [
            'file.required' => 'File Excel wajib diunggah.',
            'file.max' => 'Ukuran file melebihi batas maksimum 15 MB.',
        ]);

        $periodId = (int) ($request->input('accounting_period_id') ?: $request->input('period_id'));
        if (! $periodId) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Accounting period ID wajib disertakan.',
            ], 422);
        }

        $file = $request->file('file');
        $user = $request->user();

        $result = $this->previewService->previewOpeningBalance($file, $periodId, $user);

        $statusCode = ($result['status'] ?? '') === 'success' ? 200 : 422;

        return response()->json($result, $statusCode);
    }

    /**
     * Confirm and execute opening balance import into database as a posted journal.
     * POST /api/v1/finance/import/opening-balance/confirm
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['bail', 'nullable', 'file', 'max:15360', new FinanceExcelFileRule()],
            'batch_token' => ['nullable', 'string'],
            'accounting_period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
            'period_id' => ['nullable', 'integer', 'exists:accounting_periods,id'],
        ], [
            'file.max' => 'Ukuran file melebihi batas maksimum 15 MB.',
        ]);

        $periodId = (int) ($request->input('accounting_period_id') ?: $request->input('period_id'));
        if (! $periodId) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Accounting period ID wajib disertakan.',
            ], 422);
        }

        $user = $request->user();
        $file = null;

        if ($request->filled('batch_token')) {
            $batchToken = basename($request->input('batch_token'));
            $tempPath = storage_path('app/temp_imports/'.$batchToken.'.xlsx');

            if (! file_exists($tempPath)) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Token preview import tidak valid atau telah kadaluarsa.',
                ], 422);
            }

            $file = new UploadedFile(
                $tempPath,
                'opening_balance.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                null,
                true
            );
        } elseif ($request->hasFile('file')) {
            $file = $request->file('file');
        } else {
            return response()->json([
                'status' => 'failed',
                'message' => 'Harap sertakan batch_token hasil preview atau file Excel untuk konfirmasi import saldo awal.',
            ], 422);
        }

        try {
            $result = $this->importService->importOpeningBalance($file, $periodId, $user);

            $statusCode = ($result['status'] ?? '') === 'success' ? 200 : 422;

            return response()->json($result, $statusCode);
        } finally {
            if (isset($tempPath) && file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }
    }

    /**
     * List historical opening balance import batches.
     * GET /api/v1/finance/import/opening-balance/history
     */
    public function history(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 100);

        $batches = ImportBatch::where('module', 'opening_balance')
            ->with(['importer:id,name,email'])
            ->withCount('errors')
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $batches,
        ]);
    }

    /**
     * Show detail of a single opening balance import batch with its errors and journal entry.
     * GET /api/v1/finance/import/opening-balance/history/{id}
     */
    public function showHistory(int $id): JsonResponse
    {
        $batch = ImportBatch::where('module', 'opening_balance')
            ->with(['importer:id,name,email', 'errors'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $batch,
        ]);
    }
}
