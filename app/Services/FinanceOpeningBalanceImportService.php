<?php

namespace App\Services;

use App\Imports\Finance\OpeningBalanceImport;
use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Models\ImportError;
use App\Models\JournalEntry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;

class FinanceOpeningBalanceImportService
{
    public function __construct(
        protected JournalService $journalService
    ) {}

    /**
     * Import Opening Balance from Excel file and post as single journal entry.
     */
    public function importOpeningBalance(UploadedFile $file, int $accountingPeriodId, ?User $user = null): array
    {
        $user = $user ?? Auth::user() ?? User::query()->first();
        if (! $user) {
            throw new \RuntimeException('Pengguna (User) tidak ditemukan untuk menjalankan import.');
        }

        $fileName = $file->getClientOriginalName() ?: 'opening_balance.xlsx';

        // 1. Period check & duplicate check before creating batch
        $period = AccountingPeriod::find($accountingPeriodId);
        if (! $period || strtolower((string) $period->status) !== 'open') {
            return $this->buildFailureResponse(
                null,
                $user,
                $fileName,
                [['row' => 0, 'message' => 'Accounting period is closed or invalid']]
            );
        }

        // Duplicate check: opening balance only once per period
        $duplicateExists = JournalEntry::where('reference_type', 'opening_balance')
            ->where('accounting_period_id', $period->id)
            ->where('status', '!=', 'void')
            ->exists();

        if ($duplicateExists) {
            return $this->buildFailureResponse(
                null,
                $user,
                $fileName,
                [['row' => 0, 'message' => 'Opening balance already exists for this accounting period']]
            );
        }

        // 2. Create ImportBatch
        $batch = ImportBatch::create([
            'file_name' => $fileName,
            'module' => 'opening_balance',
            'status' => 'processing',
            'imported_by' => $user->id,
        ]);

        try {
            // 3. Read sheet
            $rows = $this->readOpeningBalanceSheet($file);

            if ($rows->isEmpty()) {
                return $this->handleFailedImport($batch, $user, [
                    ['row' => 1, 'message' => 'File Excel kosong atau sheet OPENING BALANCE tidak memiliki data.'],
                ]);
            }

            // 4. Validate rows, accounts, normal balance, and balance equilibrium
            $validation = $this->validateRows($rows, $period);

            if (! empty($validation['errors'])) {
                return $this->handleFailedImport($batch, $user, $validation['errors']);
            }

            $validRows = $validation['valid_rows'];
            $totalDebit = $validation['total_debit'];
            $totalCredit = $validation['total_credit'];
            $totalRows = count($validRows);

            // 5. Database transaction: create draft journal and post it via JournalService
            DB::beginTransaction();

            $journalLines = [];
            foreach ($validRows as $item) {
                $journalLines[] = [
                    'account_id' => $item['account_id'],
                    'debit' => $item['debit'],
                    'credit' => $item['credit'],
                    'description' => "Saldo Awal - {$item['code']} {$item['name']}",
                ];
            }

            $transactionDate = $period->start_date
                ? Carbon::parse($period->start_date)->toDateString()
                : now()->toDateString();

            $journalPayload = [
                'accounting_period_id' => $period->id,
                'transaction_date' => $transactionDate,
                'description' => "Opening Balance {$period->name}",
                'reference_type' => 'opening_balance',
                'reference_id' => $batch->id,
                'status' => 'draft',
                'journal_lines' => $journalLines,
            ];

            // Create draft journal via JournalService
            $journal = $this->journalService->createJournal($journalPayload, $user);

            // Post journal via JournalService
            $posted = $this->journalService->postJournal($journal, $user);

            DB::commit();

            // 6. Update batch status to completed
            $batch->update([
                'status' => 'completed',
            ]);

            // 7. Audit log confirm
            AuditLog::create([
                'user_id' => $user->id,
                'module' => 'finance_import',
                'action' => 'confirm_opening_balance',
                'reference_id' => $batch->id,
                'old_data' => null,
                'new_data' => [
                    'batch_id' => $batch->id,
                    'journal_entry_id' => $posted->id,
                    'journal_number' => $posted->journal_number,
                    'accounting_period_id' => $period->id,
                    'total_rows' => $totalRows,
                    'total_debit' => $totalDebit,
                    'total_credit' => $totalCredit,
                ],
            ]);

            return [
                'status' => 'success',
                'message' => 'Opening balance berhasil diimpor dan diposting ke jurnal.',
                'data' => [
                    'batch_id' => $batch->id,
                    'journal_entry_id' => $posted->id,
                    'journal_number' => $posted->journal_number,
                    'total_rows' => $totalRows,
                    'total_debit' => $totalDebit,
                    'total_credit' => $totalCredit,
                ],
            ];
        } catch (\Throwable $e) {
            DB::rollBack();

            return $this->handleFailedImport($batch, $user, [
                ['row' => 0, 'message' => $e->getMessage()],
            ]);
        }
    }

    /**
     * Read the OPENING BALANCE worksheet from the uploaded file.
     */
    public function readOpeningBalanceSheet(UploadedFile $file): Collection
    {
        $filePath = $file->getRealPath();
        /** @var \PhpOffice\PhpSpreadsheet\Reader\Xlsx $reader */
        $reader = IOFactory::createReaderForFile($filePath);
        $sheetNames = method_exists($reader, 'listWorksheetNames')
            ? $reader->listWorksheetNames($filePath)
            : [];

        $targetSheetIndex = 0;
        foreach ($sheetNames as $idx => $name) {
            $normalizedName = strtoupper(trim($name));
            if (in_array($normalizedName, ['OPENING BALANCE', 'SALDO AWAL', 'OPENING_BALANCE', 'SALDO_AWAL'], true)) {
                $targetSheetIndex = $idx;
                break;
            }
        }

        $sheets = Excel::toCollection(new OpeningBalanceImport, $file);

        return $sheets->get($targetSheetIndex, new Collection);
    }

    /**
     * Validate rows for opening balance.
     */
    public function validateRows(Collection $rows, AccountingPeriod $period): array
    {
        $errors = [];
        $validRows = [];
        $totalDebit = 0.0;
        $totalCredit = 0.0;

        // Preload accounts to avoid N+1 queries
        $accounts = Account::where('is_active', true)->get()->keyBy('code');

        $rowNumber = 1; // Row 1 is header

        foreach ($rows as $row) {
            $rowNumber++;

            // Handle empty rows
            $filteredValues = array_filter($row->toArray(), fn ($v) => $v !== null && trim((string) $v) !== '');
            if (empty($filteredValues)) {
                continue;
            }

            // Extract row columns with flexible header names
            $code = trim((string) ($row['kode_akun'] ?? $row['kode'] ?? $row['account_code'] ?? ''));
            $name = trim((string) ($row['nama_akun'] ?? $row['nama'] ?? $row['account_name'] ?? ''));
            $normalBalanceRaw = strtolower(trim((string) ($row['saldo_normal'] ?? $row['normal_balance'] ?? $row['posisi'] ?? '')));
            $amountRaw = $row['saldo_awal'] ?? $row['nominal'] ?? $row['saldo'] ?? $row['amount'] ?? null;

            // 1. Account code check
            if ($code === '') {
                $errors[] = [
                    'row' => $rowNumber,
                    'message' => "Row {$rowNumber}: Account code not found",
                ];

                continue;
            }

            if (! isset($accounts[$code])) {
                $errors[] = [
                    'row' => $rowNumber,
                    'message' => "Row {$rowNumber}: Account code not found: {$code}",
                ];

                continue;
            }

            $account = $accounts[$code];

            // 2. Saldo awal check (must be numeric and > 0)
            if ($amountRaw === null || $amountRaw === '' || ! is_numeric(str_replace([',', ' '], '', (string) $amountRaw))) {
                $errors[] = [
                    'row' => $rowNumber,
                    'message' => "Row {$rowNumber}: Saldo Awal must be greater than zero",
                ];

                continue;
            }

            $amount = (float) str_replace([',', ' '], '', (string) $amountRaw);

            if ($amount <= 0) {
                $errors[] = [
                    'row' => $rowNumber,
                    'message' => "Row {$rowNumber}: Saldo Awal must be greater than zero",
                ];

                continue;
            }

            // 3. Normal balance check
            $normalBalance = null;
            if (str_starts_with($normalBalanceRaw, 'deb') || $normalBalanceRaw === 'd') {
                $normalBalance = 'debit';
            } elseif (str_starts_with($normalBalanceRaw, 'kre') || str_starts_with($normalBalanceRaw, 'cre') || $normalBalanceRaw === 'k' || $normalBalanceRaw === 'c') {
                $normalBalance = 'credit';
            }

            if (! $normalBalance || $normalBalance !== strtolower((string) $account->normal_balance)) {
                $errors[] = [
                    'row' => $rowNumber,
                    'message' => "Row {$rowNumber}: Normal balance mismatch for account {$code}. Expected {$account->normal_balance}, got {$normalBalanceRaw}",
                ];

                continue;
            }

            // Calculate debit and credit
            $debit = $normalBalance === 'debit' ? $amount : 0.0;
            $credit = $normalBalance === 'credit' ? $amount : 0.0;

            $totalDebit += $debit;
            $totalCredit += $credit;

            $validRows[] = [
                'row' => $rowNumber,
                'account_id' => $account->id,
                'code' => $account->code,
                'name' => $account->name,
                'normal_balance' => $normalBalance,
                'amount' => $amount,
                'debit' => $debit,
                'credit' => $credit,
            ];
        }

        // 4. Equilibrium / balance check: Total Debit must equal Total Credit
        if (empty($errors)) {
            if (count($validRows) === 0) {
                $errors[] = [
                    'row' => 1,
                    'message' => 'Tidak ada baris data saldo awal yang dapat diproses.',
                ];
            } elseif (abs($totalDebit - $totalCredit) > 0.001) {
                $errors[] = [
                    'row' => 0,
                    'message' => 'Opening balance is not balanced. Total Debit: '.number_format($totalDebit, 2, ',', '.').', Total Credit: '.number_format($totalCredit, 2, ',', '.'),
                ];
            }
        }

        return [
            'valid_rows' => $validRows,
            'errors' => $errors,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'total_rows' => count($validRows) + count($errors),
        ];
    }

    /**
     * Handle failed import with ImportBatch, ImportError, and AuditLog recording.
     */
    protected function handleFailedImport(ImportBatch $batch, User $user, array $errors): array
    {
        $batch->update([
            'status' => 'failed',
        ]);

        foreach ($errors as $err) {
            ImportError::create([
                'batch_id' => $batch->id,
                'row_number' => $err['row'] ?? 0,
                'error_message' => $err['message'] ?? 'Validasi gagal',
            ]);
        }

        AuditLog::create([
            'user_id' => $user->id,
            'module' => 'finance_import',
            'action' => 'opening_balance_import_failed',
            'reference_id' => $batch->id,
            'old_data' => null,
            'new_data' => [
                'batch_id' => $batch->id,
                'file_name' => $batch->file_name,
                'total_errors' => count($errors),
                'errors' => array_slice($errors, 0, 10),
            ],
        ]);

        return [
            'status' => 'failed',
            'message' => 'Validasi saldo awal gagal.',
            'errors' => $errors,
            'data' => [
                'batch_id' => $batch->id,
                'total_errors' => count($errors),
                'errors' => $errors,
            ],
        ];
    }

    /**
     * Build failure response for pre-batch validation errors (e.g. closed period, duplicate).
     */
    protected function buildFailureResponse(?ImportBatch $batch, User $user, string $fileName, array $errors): array
    {
        // Record failed batch so it's always traceable
        $batch = $batch ?? ImportBatch::create([
            'file_name' => $fileName,
            'module' => 'opening_balance',
            'status' => 'failed',
            'imported_by' => $user->id,
        ]);

        foreach ($errors as $err) {
            ImportError::create([
                'batch_id' => $batch->id,
                'row_number' => $err['row'] ?? 0,
                'error_message' => $err['message'] ?? 'Validasi gagal',
            ]);
        }

        AuditLog::create([
            'user_id' => $user->id,
            'module' => 'finance_import',
            'action' => 'opening_balance_import_failed',
            'reference_id' => $batch->id,
            'old_data' => null,
            'new_data' => [
                'batch_id' => $batch->id,
                'file_name' => $fileName,
                'total_errors' => count($errors),
                'errors' => $errors,
            ],
        ]);

        return [
            'status' => 'failed',
            'message' => $errors[0]['message'] ?? 'Validasi saldo awal gagal.',
            'errors' => $errors,
            'data' => [
                'batch_id' => $batch->id,
                'total_errors' => count($errors),
                'errors' => $errors,
            ],
        ];
    }
}
