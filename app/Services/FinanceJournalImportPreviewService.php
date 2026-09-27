<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class FinanceJournalImportPreviewService
{
    public function __construct(
        protected FinanceJournalImportService $importService
    ) {}

    /**
     * Preview and validate Journal Entries Excel file without inserting into database.
     *
     * @param UploadedFile $file
     * @param User|null $user
     * @return array
     */
    public function previewJournalEntries(UploadedFile $file, ?User $user = null): array
    {
        $user = $user ?? Auth::user();

        // 1. Read Excel Sheet JU
        $rows = $this->importService->readJournalSheet($file);

        if ($rows->isEmpty()) {
            $errors = [
                ['row' => 1, 'message' => 'File Excel kosong atau sheet JU tidak memiliki data transaksi.']
            ];

            return [
                'status' => 'failed',
                'data'   => [
                    'total_rows'      => 0,
                    'total_journals'  => 0,
                    'valid_journals'  => 0,
                    'failed_journals' => 1,
                    'errors'          => $errors,
                    'batch_token'     => null,
                    'preview_token'   => null,
                ],
            ];
        }

        // 2. Parse & Validate
        $parsed = $this->importService->parseAndValidateRows($rows);

        $vouchers = $parsed['vouchers'];
        $errors = $parsed['errors'];
        $totalRows = $parsed['total_rows'];
        $totalJournals = $parsed['total_journals'];
        $validJournalsCount = count($vouchers);
        $failedJournalsCount = max(0, $totalJournals - $validJournalsCount);

        // 3. Cache temporary file reference for confirmation step
        $token = (string) Str::uuid();
        $tempDir = storage_path('app/temp_imports');
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0755, true);
        }
        $tempFilePath = $tempDir . '/' . $token . '.xlsx';
        @copy($file->getRealPath(), $tempFilePath);

        // 4. Audit Log for preview action
        if ($user) {
            AuditLog::create([
                'user_id'      => $user->id,
                'module'       => 'finance_import',
                'action'       => 'preview_journal_import',
                'reference_id' => null,
                'old_data'     => null,
                'new_data'     => [
                    'file_name'       => $file->getClientOriginalName(),
                    'total_rows'      => $totalRows,
                    'total_journals'  => $totalJournals,
                    'valid_journals'  => $validJournalsCount,
                    'failed_journals' => $failedJournalsCount,
                    'batch_token'     => $token,
                ],
            ]);
        }

        $isSuccess = empty($errors);

        return [
            'status' => $isSuccess ? 'success' : 'failed',
            'data'   => [
                'total_rows'      => $totalRows,
                'total_journals'  => $totalJournals,
                'valid_journals'  => $validJournalsCount,
                'failed_journals' => $failedJournalsCount,
                'errors'          => $errors,
                'batch_token'     => $token,
                'preview_token'   => $token,
            ],
        ];
    }
}
