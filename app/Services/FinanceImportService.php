<?php

namespace App\Services;

use App\Imports\Finance\AccountsImport;
use App\Models\Account;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Models\ImportError;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;

class FinanceImportService
{
    /**
     * Allowed account types.
     */
    protected const ALLOWED_ACCOUNT_TYPES = [
        'asset',
        'liability',
        'net_asset',
        'revenue',
        'expense',
    ];

    /**
     * Allowed normal balance.
     */
    protected const ALLOWED_NORMAL_BALANCES = [
        'debit',
        'credit',
    ];

    /**
     * Import Chart of Accounts (AD) from Excel file.
     *
     * @param UploadedFile $file
     * @param User|null $user
     * @return array
     */
    public function importAccounts(UploadedFile $file, ?User $user = null): array
    {
        $user = $user ?? auth()->user() ?? User::first();
        if (!$user) {
            throw new \RuntimeException('Pengguna (User) tidak ditemukan untuk menjalankan import.');
        }

        $fileName = $file->getClientOriginalName() ?: 'accounts.xlsx';

        // 1. Create Import Batch
        $batch = ImportBatch::create([
            'file_name'   => $fileName,
            'module'      => 'accounts',
            'status'      => 'processing',
            'imported_by' => $user->id,
        ]);

        try {
            // 2. Read Excel Sheet
            $rows = $this->readAccountsSheet($file);

            if ($rows->isEmpty()) {
                return $this->handleFailedImport($batch, $user, [
                    ['row' => 1, 'message' => 'File Excel tidak memiliki data akun untuk diimpor.']
                ]);
            }

            // 3 & 4. Validate header and rows
            $validation = $this->validateRows($rows);

            if (!empty($validation['errors'])) {
                return $this->handleFailedImport($batch, $user, $validation['errors']);
            }

            $validRows = $validation['valid_rows'];

            // 5 & 6. Resolve hierarchy & Insert accounts inside database transaction
            DB::beginTransaction();

            $codeToIdMap = Account::pluck('id', 'code')->toArray();
            $pendingRows = $validRows;
            $maxPasses = 15;
            $pass = 0;

            while (!empty($pendingRows) && $pass < $maxPasses) {
                $insertedInThisPass = 0;
                $remaining = [];

                foreach ($pendingRows as $row) {
                    $parentCode = $row['parent_code'];

                    // Ready to insert if no parent, or parent already resolved in map
                    if ($parentCode === null || isset($codeToIdMap[$parentCode])) {
                        $parentId = $parentCode !== null ? $codeToIdMap[$parentCode] : null;

                        // CRITICAL: NEVER overwrite or updateOrCreate, only insert new accounts!
                        $account = Account::create([
                            'code'            => $row['code'],
                            'name'            => $row['name'],
                            'account_type'    => $row['account_type'],
                            'parent_id'       => $parentId,
                            'level'           => $row['level'],
                            'normal_balance'  => $row['normal_balance'],
                            'report_category' => $row['report_category'],
                            'is_active'       => $row['is_active'],
                        ]);

                        $codeToIdMap[$row['code']] = $account->id;
                        $insertedInThisPass++;
                    } else {
                        $remaining[] = $row;
                    }
                }

                if ($insertedInThisPass === 0 && !empty($remaining)) {
                    throw new \RuntimeException(
                        'Gagal menyusun hierarki akun. Terdapat referensi parent yang tidak dapat diselesaikan atau terjadi referensi melingkar (circular).'
                    );
                }

                $pendingRows = $remaining;
                $pass++;
            }

            DB::commit();

            // 7. Update batch status to completed
            $batch->update(['status' => 'completed']);

            $totalRows = count($validRows);

            // 8. Audit Log
            AuditLog::create([
                'user_id'      => $user->id,
                'module'       => 'finance_import',
                'action'       => 'import_accounts',
                'reference_id' => $batch->id,
                'old_data'     => null,
                'new_data'     => [
                    'file_name'    => $fileName,
                    'status'       => 'completed',
                    'total_rows'   => $totalRows,
                    'success_rows' => $totalRows,
                    'failed_rows'  => 0,
                ],
            ]);

            return [
                'status'       => 'success',
                'batch_id'     => $batch->id,
                'total_rows'   => $totalRows,
                'success_rows' => $totalRows,
                'failed_rows'  => 0,
            ];
        } catch (\Throwable $e) {
            DB::rollBack();

            return $this->handleFailedImport($batch, $user, [
                ['row' => 0, 'message' => $e->getMessage()]
            ]);
        }
    }

    /**
     * Read the AD or target accounts sheet from the uploaded file.
     */
    public function readAccountsSheet(UploadedFile $file): Collection
    {
        $filePath = $file->getRealPath();

        // Detect worksheet names
        $reader = IOFactory::createReaderForFile($filePath);
        $sheetNames = $reader->listWorksheetNames($filePath);

        $targetSheetIndex = 0;
        foreach ($sheetNames as $idx => $name) {
            $normalizedName = strtoupper(trim($name));
            if (in_array($normalizedName, ['AD', 'DAFTAR AKUN', 'CHART OF ACCOUNTS'], true)) {
                $targetSheetIndex = $idx;
                break;
            }
        }

        $sheets = Excel::toCollection(new AccountsImport(), $file);

        return $sheets->get($targetSheetIndex, new Collection());
    }

    /**
     * Validate the header and row data of the accounts sheet.
     */
    public function validateRows(Collection $rows): array
    {
        $errors = [];
        $validRows = [];
        $seenCodesInFile = [];

        // Check if there is any row at all
        if ($rows->isEmpty()) {
            return [
                'valid_rows' => [],
                'errors'     => [['row' => 1, 'message' => 'Sheet Excel kosong.']],
            ];
        }

        // Validate Header (inspect the first row keys)
        $firstRow = $rows->first();
        if ($firstRow instanceof Collection) {
            $firstRow = $firstRow->toArray();
        }

        $headerKeys = array_keys((array) $firstRow);

        $hasCode = $this->hasMatchingKey($headerKeys, ['kode_akun', 'kode', 'code', 'kode_account']);
        $hasName = $this->hasMatchingKey($headerKeys, ['nama_akun', 'nama', 'name', 'account_name']);
        $hasType = $this->hasMatchingKey($headerKeys, ['jenis_akun', 'jenis', 'account_type', 'tipe_akun']);
        $hasNormal = $this->hasMatchingKey($headerKeys, ['saldo_normal', 'normal_balance', 'saldo']);

        if (!$hasCode || !$hasName || !$hasType || !$hasNormal) {
            return [
                'valid_rows' => [],
                'errors'     => [
                    [
                        'row'     => 1,
                        'message' => 'Format header Excel tidak sesuai. Kolom wajib: Kode Akun, Nama Akun, Jenis Akun, Saldo Normal.'
                    ]
                ],
            ];
        }

        // Pass 1: Collect all raw codes in the file for parent validation
        $allFileCodes = [];
        foreach ($rows as $item) {
            $itemArr = $item instanceof Collection ? $item->toArray() : (array) $item;
            $codeVal = $this->extractValue($itemArr, ['kode_akun', 'kode', 'code']);
            if ($codeVal !== null && trim((string) $codeVal) !== '') {
                $allFileCodes[] = trim((string) $codeVal);
            }
        }

        // Pre-load all existing codes in DB to minimize queries
        $existingDbCodes = Account::pluck('code')->all();

        // Pass 2: Validate each row
        $excelRowNumber = 2; // Row 1 is header, data starts at row 2

        foreach ($rows as $item) {
            $row = $item instanceof Collection ? $item->toArray() : (array) $item;

            // Skip completely empty rows
            if ($this->isEmptyRow($row)) {
                $excelRowNumber++;
                continue;
            }

            $rawCode = $this->extractValue($row, ['kode_akun', 'kode', 'code']);
            $rawName = $this->extractValue($row, ['nama_akun', 'nama', 'name']);
            $rawLevel = $this->extractValue($row, ['level']);
            $rawParent = $this->extractValue($row, ['parent_akun', 'parent', 'parent_code']);
            $rawType = $this->extractValue($row, ['jenis_akun', 'jenis', 'account_type', 'tipe_akun']);
            $rawNormal = $this->extractValue($row, ['saldo_normal', 'normal_balance', 'saldo']);
            $rawCategory = $this->extractValue($row, ['kategori_laporan', 'report_category', 'kategori']);
            $rawStatus = $this->extractValue($row, ['status', 'is_active']);

            $code = $rawCode !== null ? trim((string) $rawCode) : '';
            $name = $rawName !== null ? trim((string) $rawName) : '';

            $hasRowError = false;

            // 1. Validate Code
            if ($code === '') {
                $errors[] = [
                    'row'     => $excelRowNumber,
                    'message' => 'Kode Akun wajib diisi.',
                ];
                $hasRowError = true;
            } elseif (in_array($code, $existingDbCodes, true)) {
                $errors[] = [
                    'row'     => $excelRowNumber,
                    'message' => "Account code already exists: {$code}",
                ];
                $hasRowError = true;
            } elseif (in_array($code, $seenCodesInFile, true)) {
                $errors[] = [
                    'row'     => $excelRowNumber,
                    'message' => "Duplicate account code in file: {$code}",
                ];
                $hasRowError = true;
            } else {
                $seenCodesInFile[] = $code;
            }

            // 2. Validate Name
            if ($name === '') {
                $errors[] = [
                    'row'     => $excelRowNumber,
                    'message' => 'Nama Akun wajib diisi.',
                ];
                $hasRowError = true;
            }

            // 3. Validate Account Type
            $accountType = strtolower(trim(str_replace([' ', '-'], '_', (string) $rawType)));
            if (!in_array($accountType, self::ALLOWED_ACCOUNT_TYPES, true)) {
                $errors[] = [
                    'row'     => $excelRowNumber,
                    'message' => "Invalid account type: '{$rawType}'. Allowed types: asset, liability, net_asset, revenue, expense.",
                ];
                $hasRowError = true;
            }

            // 4. Validate Normal Balance
            $normalBalance = strtolower(trim((string) $rawNormal));
            if (!in_array($normalBalance, self::ALLOWED_NORMAL_BALANCES, true)) {
                $errors[] = [
                    'row'     => $excelRowNumber,
                    'message' => "Invalid normal balance: '{$rawNormal}'. Allowed values: debit, credit.",
                ];
                $hasRowError = true;
            }

            // 5. Parse Parent Code
            $parentCode = $this->parseParentCode($rawParent, array_merge($existingDbCodes, $allFileCodes));
            if ($parentCode !== null) {
                if ($parentCode === $code) {
                    $errors[] = [
                        'row'     => $excelRowNumber,
                        'message' => 'Parent akun tidak boleh sama dengan kode akun sendiri.',
                    ];
                    $hasRowError = true;
                } elseif (!in_array($parentCode, $existingDbCodes, true) && !in_array($parentCode, $allFileCodes, true)) {
                    $errors[] = [
                        'row'     => $excelRowNumber,
                        'message' => "Parent account [{$parentCode}] not found in database or file.",
                    ];
                    $hasRowError = true;
                }
            }

            // 6. Parse Level
            $level = is_numeric($rawLevel) && (int) $rawLevel > 0 ? (int) $rawLevel : 1;

            // 7. Parse Status
            $isActive = true;
            if ($rawStatus !== null && trim((string) $rawStatus) !== '') {
                $statusStr = strtolower(trim((string) $rawStatus));
                if (in_array($statusStr, ['nonaktif', 'inactive', '0', 'false', 'tidak aktif', 'off'], true)) {
                    $isActive = false;
                }
            }

            // 8. Report Category
            $reportCategory = $rawCategory !== null && trim((string) $rawCategory) !== ''
                ? trim((string) $rawCategory)
                : null;

            if (!$hasRowError) {
                $validRows[] = [
                    'excel_row'       => $excelRowNumber,
                    'code'            => $code,
                    'name'            => $name,
                    'account_type'    => $accountType,
                    'parent_code'     => $parentCode,
                    'level'           => $level,
                    'normal_balance'  => $normalBalance,
                    'report_category' => $reportCategory,
                    'is_active'       => $isActive,
                ];
            }

            $excelRowNumber++;
        }

        return [
            'valid_rows' => $validRows,
            'errors'     => $errors,
        ];
    }

    /**
     * Handle failed import: update batch, record import_errors, create audit log, and return response.
     */
    protected function handleFailedImport(ImportBatch $batch, User $user, array $errors): array
    {
        $batch->update(['status' => 'failed']);

        foreach ($errors as $err) {
            ImportError::create([
                'batch_id'      => $batch->id,
                'row_number'    => (int) ($err['row'] ?? 0),
                'error_message' => (string) ($err['message'] ?? 'Unknown error'),
            ]);
        }

        AuditLog::create([
            'user_id'      => $user->id,
            'module'       => 'finance_import',
            'action'       => 'import_accounts',
            'reference_id' => $batch->id,
            'old_data'     => null,
            'new_data'     => [
                'file_name'   => $batch->file_name,
                'status'      => 'failed',
                'failed_rows' => count($errors),
                'errors'      => $errors,
            ],
        ]);

        return [
            'status'   => 'failed',
            'batch_id' => $batch->id,
            'errors'   => $errors,
        ];
    }

    /**
     * Extract parent code from raw string (e.g., '1100 - Kas' -> '1100').
     */
    protected function parseParentCode($raw, array $knownCodes = []): ?string
    {
        if ($raw === null) {
            return null;
        }

        $str = trim((string) $raw);
        if ($str === '' || $str === '-' || strtolower($str) === 'null') {
            return null;
        }

        // If the exact string matches a known code (even with hyphens), return it directly
        if (!empty($knownCodes) && in_array($str, $knownCodes, true)) {
            return $str;
        }

        // If formatted as "CODE - Account Name", extract CODE
        if (str_contains($str, ' - ')) {
            $parts = explode(' - ', $str, 2);
            $code = trim($parts[0]);
            return $code !== '' && $code !== '-' ? $code : null;
        }

        return $str;
    }

    /**
     * Check if any candidate key exists in array keys.
     */
    protected function hasMatchingKey(array $keys, array $candidates): bool
    {
        foreach ($candidates as $cand) {
            if (in_array($cand, $keys, true)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extract value from row using candidate keys.
     */
    protected function extractValue(array $row, array $candidates)
    {
        foreach ($candidates as $cand) {
            if (array_key_exists($cand, $row)) {
                return $row[$cand];
            }
        }
        return null;
    }

    /**
     * Check if a row is completely empty.
     */
    protected function isEmptyRow(array $row): bool
    {
        foreach ($row as $val) {
            if ($val !== null && trim((string) $val) !== '') {
                return false;
            }
        }
        return true;
    }
}
