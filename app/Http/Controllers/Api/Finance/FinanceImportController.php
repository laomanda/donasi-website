<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\FinanceImportPreviewService;
use App\Services\FinanceImportService;
use App\Services\FinanceImportTemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FinanceImportController extends Controller
{
    public function __construct(
        protected FinanceImportService $importService,
        protected FinanceImportPreviewService $previewService,
        protected FinanceImportTemplateService $templateService
    ) {}

    /**
     * Download official Chart of Accounts (AD) Excel template.
     * GET /api/v1/finance/import/accounts/template
     */
    public function template(Request $request): BinaryFileResponse
    {
        return $this->templateService->generateAccountsTemplate($request->user());
    }

    /**
     * Preview and validate Excel before committing to database.
     * POST /api/v1/finance/import/accounts/preview
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls',
                'max:10240',
            ],
        ]);

        $file = $request->file('file');
        $user = $request->user();

        $result = $this->previewService->previewAccounts($file, $user);

        $statusCode = ($result['status'] ?? '') === 'success' ? 200 : 422;

        return response()->json($result, $statusCode);
    }

    /**
     * Confirm and execute import into database.
     * POST /api/v1/finance/import/accounts/confirm
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'batch_token' => ['nullable', 'string'],
            'file'        => ['nullable', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

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
                'accounts.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                null,
                true
            );
        } elseif ($request->hasFile('file')) {
            $file = $request->file('file');
        } else {
            return response()->json([
                'status'  => 'failed',
                'message' => 'Harap sertakan batch_token hasil preview atau file Excel untuk konfirmasi import.',
            ], 422);
        }

        try {
            $result = $this->importService->importAccounts($file, $user);

            // Record audit log action: confirm_import
            if ($user && isset($result['batch_id'])) {
                AuditLog::create([
                    'user_id'      => $user->id,
                    'module'       => 'finance_import',
                    'action'       => 'confirm_import',
                    'reference_id' => $result['batch_id'],
                    'old_data'     => null,
                    'new_data'     => [
                        'status'       => $result['status'],
                        'total_rows'   => $result['total_rows'] ?? 0,
                        'success_rows' => $result['success_rows'] ?? 0,
                        'failed_rows'  => $result['failed_rows'] ?? count($result['errors'] ?? []),
                    ],
                ]);
            }

            $statusCode = ($result['status'] ?? '') === 'success' ? 200 : 422;

            return response()->json($result, $statusCode);
        } finally {
            if ($tempPath && file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }
    }

    /**
     * Direct import (existing endpoint for backward compatibility).
     * POST /api/v1/finance/import/accounts
     */
    public function accounts(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls',
                'max:10240',
            ],
        ]);

        $file = $request->file('file');
        $user = $request->user();

        $result = $this->importService->importAccounts($file, $user);

        $statusCode = ($result['status'] ?? '') === 'success' ? 200 : 422;

        return response()->json($result, $statusCode);
    }
}
