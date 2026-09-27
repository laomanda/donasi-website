<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class FinanceOpeningBalancePreviewService
{
    public function __construct(
        protected FinanceOpeningBalanceImportService $importService
    ) {}

    /**
     * Preview and validate Opening Balance Excel file without inserting into database.
     */
    public function previewOpeningBalance(UploadedFile $file, int $accountingPeriodId, ?User $user = null): array
    {
        $user = $user ?? Auth::user();

        // 1. Period check
        $period = AccountingPeriod::find($accountingPeriodId);
        if (! $period || strtolower((string) $period->status) !== 'open') {
            return [
                'status' => 'failed',
                'data' => [
                    'total_rows' => 0,
                    'valid_rows' => 0,
                    'failed_rows' => 1,
                    'total_debit' => 0,
                    'total_credit' => 0,
                    'errors' => [
                        ['row' => 0, 'message' => 'Accounting period is closed or invalid'],
                    ],
                    'batch_token' => null,
                    'preview_token' => null,
                ],
            ];
        }

        // 2. Duplicate check
        $duplicateExists = JournalEntry::where('reference_type', 'opening_balance')
            ->where('accounting_period_id', $period->id)
            ->where('status', '!=', 'void')
            ->exists();

        if ($duplicateExists) {
            return [
                'status' => 'failed',
                'data' => [
                    'total_rows' => 0,
                    'valid_rows' => 0,
                    'failed_rows' => 1,
                    'total_debit' => 0,
                    'total_credit' => 0,
                    'errors' => [
                        ['row' => 0, 'message' => 'Opening balance already exists for this accounting period'],
                    ],
                    'batch_token' => null,
                    'preview_token' => null,
                ],
            ];
        }

        // 3. Read sheet
        $rows = $this->importService->readOpeningBalanceSheet($file);

        if ($rows->isEmpty()) {
            return [
                'status' => 'failed',
                'data' => [
                    'total_rows' => 0,
                    'valid_rows' => 0,
                    'failed_rows' => 1,
                    'total_debit' => 0,
                    'total_credit' => 0,
                    'errors' => [
                        ['row' => 1, 'message' => 'File Excel kosong atau sheet OPENING BALANCE tidak memiliki data.'],
                    ],
                    'batch_token' => null,
                    'preview_token' => null,
                ],
            ];
        }

        // 4. Validate rows
        $validation = $this->importService->validateRows($rows, $period);

        $validRows = $validation['valid_rows'];
        $errors = $validation['errors'];
        $totalDebit = $validation['total_debit'];
        $totalCredit = $validation['total_credit'];
        $totalRows = count($validRows) + count($errors);
        $validRowsCount = count($validRows);
        $failedRowsCount = count($errors);

        // 5. Store temporary file copy for seamless confirm step
        $token = (string) Str::uuid();
        $tempDir = storage_path('app/temp_imports');
        if (! is_dir($tempDir)) {
            @mkdir($tempDir, 0755, true);
        }
        $tempFilePath = $tempDir.'/'.$token.'.xlsx';
        @copy($file->getRealPath(), $tempFilePath);

        // 6. Audit Log
        if ($user) {
            AuditLog::create([
                'user_id' => $user->id,
                'module' => 'finance_import',
                'action' => 'preview_opening_balance',
                'reference_id' => null,
                'old_data' => null,
                'new_data' => [
                    'file_name' => $file->getClientOriginalName(),
                    'accounting_period_id' => $period->id,
                    'total_rows' => $totalRows,
                    'valid_rows' => $validRowsCount,
                    'failed_rows' => $failedRowsCount,
                    'total_debit' => $totalDebit,
                    'total_credit' => $totalCredit,
                    'batch_token' => $token,
                ],
            ]);
        }

        $isSuccess = empty($errors);

        return [
            'status' => $isSuccess ? 'success' : 'failed',
            'data' => [
                'total_rows' => $totalRows,
                'valid_rows' => $validRowsCount,
                'failed_rows' => $failedRowsCount,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'errors' => $errors,
                'batch_token' => $token,
                'preview_token' => $token,
            ],
        ];
    }
}
