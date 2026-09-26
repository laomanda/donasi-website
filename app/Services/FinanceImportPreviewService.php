<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class FinanceImportPreviewService
{
    public function __construct(
        protected FinanceImportService $importService
    ) {}

    /**
     * Preview and validate Chart of Accounts Excel file without inserting into database.
     *
     * @param UploadedFile $file
     * @param User|null $user
     * @return array
     */
    public function previewAccounts(UploadedFile $file, ?User $user = null): array
    {
        $user = $user ?? auth()->user();

        // 1. Read Excel
        $rows = $this->importService->readAccountsSheet($file);

        if ($rows->isEmpty()) {
            $errors = [
                ['row' => 1, 'message' => 'File Excel kosong atau tidak memiliki data akun.']
            ];

            return [
                'status' => 'failed',
                'data'   => [
                    'total_rows'    => 0,
                    'valid_rows'    => 0,
                    'failed_rows'   => 1,
                    'errors'        => $errors,
                    'batch_token'   => null,
                    'preview_token' => null,
                ],
            ];
        }

        // 2 & 3. Validate header and rows (uniqueness in DB, uniqueness in file, parent hierarchy)
        $validation = $this->importService->validateRows($rows);

        $validRowsCount = count($validation['valid_rows']);
        $errors = $validation['errors'];
        $failedRowsCount = count(array_unique(array_column($errors, 'row')));
        $totalRows = $validRowsCount + $failedRowsCount;

        // 4. Cache temporary file reference for confirmation step
        $token = (string) Str::uuid();
        $tempDir = storage_path('app/temp_imports');
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0755, true);
        }
        $tempFilePath = $tempDir . '/' . $token . '.xlsx';
        @copy($file->getRealPath(), $tempFilePath);

        // 5. Audit Log for preview action
        if ($user) {
            AuditLog::create([
                'user_id'      => $user->id,
                'module'       => 'finance_import',
                'action'       => 'preview_accounts',
                'reference_id' => null,
                'old_data'     => null,
                'new_data'     => [
                    'file_name'   => $file->getClientOriginalName(),
                    'total_rows'  => $totalRows,
                    'valid_rows'  => $validRowsCount,
                    'failed_rows' => $failedRowsCount,
                    'batch_token' => $token,
                ],
            ]);
        }

        $isSuccess = empty($errors);

        return [
            'status' => $isSuccess ? 'success' : 'failed',
            'data'   => [
                'total_rows'    => $totalRows,
                'valid_rows'    => $validRowsCount,
                'failed_rows'   => $failedRowsCount,
                'errors'        => $errors,
                'batch_token'   => $token,
                'preview_token' => $token,
            ],
        ];
    }
}
