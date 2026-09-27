<?php

namespace App\Services;

use App\Imports\Finance\JournalEntriesImport;
use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\AuditLog;
use App\Models\ImportBatch;
use App\Models\ImportError;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class FinanceJournalImportService
{
    public function __construct(
        protected JournalService $journalService,
        protected AccountingPeriodService $periodService
    ) {}

    /**
     * Import General Journal entries (JU) from Excel file.
     */
    public function importJournalEntries(UploadedFile $file, ?User $user = null): array
    {
        $user = $user ?? Auth::user() ?? User::query()->first();
        if (! $user) {
            throw new \RuntimeException('Pengguna (User) tidak ditemukan untuk menjalankan import jurnal.');
        }

        $fileName = $file->getClientOriginalName() ?: 'journal_entries.xlsx';

        // 1. Create ImportBatch
        $batch = ImportBatch::create([
            'file_name' => $fileName,
            'module' => 'journal_entries',
            'status' => 'processing',
            'imported_by' => $user->id,
        ]);

        try {
            // 2. Read Excel Sheet JU
            $rows = $this->readJournalSheet($file);

            if ($rows->isEmpty()) {
                return $this->handleFailedImport($batch, $user, [
                    ['row' => 1, 'message' => 'File Excel kosong atau sheet JU tidak memiliki data transaksi.'],
                ]);
            }

            // 3, 4, 5, 6. Group by journal_number & validate
            $parsed = $this->parseAndValidateRows($rows);

            if (! empty($parsed['errors'])) {
                return $this->handleFailedImport($batch, $user, $parsed['errors']);
            }

            $vouchers = $parsed['vouchers'];
            $totalRows = $parsed['total_rows'];
            $totalJournals = count($vouchers);

            // 7, 8, 9. Database Transaction & Call JournalService
            DB::beginTransaction();

            foreach ($vouchers as $voucher) {
                // Build payload
                $payload = [
                    'journal_number' => $voucher['journal_number'],
                    'transaction_date' => $voucher['transaction_date'],
                    'description' => $voucher['description'],
                    'program_id' => $voucher['program_id'],
                    'accounting_period_id' => $voucher['accounting_period_id'],
                    'reference_type' => 'import',
                    'reference_id' => $batch->id,
                    'status' => 'draft',
                    'journal_lines' => $voucher['lines'],
                ];

                // 8. Call JournalService->createJournal (creates draft)
                $journal = $this->journalService->createJournal($payload, $user);

                // 9. Call JournalService->postJournal (posts to posted)
                $this->journalService->postJournal($journal, $user);
            }

            DB::commit();

            // Update batch status
            $batch->update(['status' => 'completed']);

            // 10. Create AuditLog
            AuditLog::create([
                'user_id' => $user->id,
                'module' => 'finance_import',
                'action' => 'confirm_journal_import',
                'reference_id' => $batch->id,
                'old_data' => null,
                'new_data' => [
                    'file_name' => $fileName,
                    'status' => 'completed',
                    'total_rows' => $totalRows,
                    'total_journals' => $totalJournals,
                    'success_rows' => $totalRows,
                    'failed_rows' => 0,
                ],
            ]);

            return [
                'status' => 'success',
                'batch_id' => $batch->id,
                'total_rows' => $totalRows,
                'total_journals' => $totalJournals,
                'success_rows' => $totalRows,
                'failed_rows' => 0,
            ];
        } catch (\Throwable $e) {
            DB::rollBack();

            return $this->handleFailedImport($batch, $user, [
                ['row' => 0, 'message' => $e->getMessage()],
            ]);
        }
    }

    /**
     * Read the JU worksheet from the uploaded file.
     */
    public function readJournalSheet(UploadedFile $file): Collection
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
            if (in_array($normalizedName, ['JU', 'JURNAL UMUM', 'JOURNAL'], true)) {
                $targetSheetIndex = $idx;
                break;
            }
        }

        $sheets = Excel::toCollection(new JournalEntriesImport, $file);

        return $sheets->get($targetSheetIndex, new Collection);
    }

    /**
     * Parse and validate collection of rows into vouchers.
     */
    public function parseAndValidateRows(Collection $rows): array
    {
        $errors = [];

        if ($rows->isEmpty()) {
            return [
                'vouchers' => [],
                'errors' => [['row' => 1, 'message' => 'Sheet JU kosong.']],
                'total_rows' => 0,
            ];
        }

        // Validate Header
        $firstRow = $rows->first();
        if ($firstRow instanceof Collection) {
            $firstRow = $firstRow->toArray();
        }
        $headerKeys = array_keys((array) $firstRow);

        $hasJournalNum = $this->hasMatchingKey($headerKeys, ['nomor_jurnal', 'no_jurnal', 'journal_number', 'no_voucher']);
        $hasDate = $this->hasMatchingKey($headerKeys, ['tanggal', 'date', 'tgl', 'transaction_date']);
        $hasCode = $this->hasMatchingKey($headerKeys, ['kode_akun', 'kode', 'code', 'account_code']);
        $hasDebit = $this->hasMatchingKey($headerKeys, ['debit', 'debet']);
        $hasCredit = $this->hasMatchingKey($headerKeys, ['kredit', 'credit']);

        if (! $hasJournalNum || ! $hasDate || ! $hasCode || ! $hasDebit || ! $hasCredit) {
            return [
                'vouchers' => [],
                'errors' => [
                    [
                        'row' => 1,
                        'message' => 'Format header Excel tidak sesuai. Kolom wajib: Nomor Jurnal, Tanggal, Kode Akun, Debit, Kredit.',
                    ],
                ],
                'total_rows' => 0,
            ];
        }

        // Pass 1: Collect non-empty rows and group by journal number
        $vouchersRaw = [];
        $allAccountCodes = [];
        $totalNonEmptyRows = 0;
        $excelRowNumber = 2; // Row 1 is header

        foreach ($rows as $item) {
            $row = $item instanceof Collection ? $item->toArray() : (array) $item;

            if ($this->isEmptyRow($row)) {
                $excelRowNumber++;

                continue;
            }

            $totalNonEmptyRows++;
            $rawJournalNumber = $this->extractValue($row, ['nomor_jurnal', 'no_jurnal', 'journal_number', 'no_voucher']);
            $journalNumber = $rawJournalNumber !== null ? trim((string) $rawJournalNumber) : '';

            if ($journalNumber === '') {
                $errors[] = [
                    'row' => $excelRowNumber,
                    'message' => 'Nomor Jurnal wajib diisi.',
                    'journal_number' => null,
                ];
                $excelRowNumber++;

                continue;
            }

            $rawCode = $this->extractValue($row, ['kode_akun', 'kode', 'code', 'account_code']);
            $code = $rawCode !== null ? trim((string) $rawCode) : '';
            if ($code !== '') {
                $allAccountCodes[] = $code;
            }

            if (! isset($vouchersRaw[$journalNumber])) {
                $vouchersRaw[$journalNumber] = [];
            }

            $vouchersRaw[$journalNumber][] = [
                'excel_row' => $excelRowNumber,
                'raw' => $row,
            ];

            $excelRowNumber++;
        }

        // Preload DB accounts
        $accounts = Account::whereIn('code', array_unique($allAccountCodes))->get()->keyBy('code');

        // Preload DB programs
        $allPrograms = Program::all();

        // Preload DB accounting periods
        $openPeriods = AccountingPeriod::where('status', 'open')->get();
        $closedPeriods = AccountingPeriod::where('status', 'closed')->get();

        // Pass 2: Validate each voucher group
        $validatedVouchers = [];

        foreach ($vouchersRaw as $journalNumber => $rowsInVoucher) {
            $firstRowData = $rowsInVoucher[0]['raw'];
            $firstRowNum = $rowsInVoucher[0]['excel_row'];
            $voucherHasError = false;

            // 1. Check duplicate journal number in DB
            if (DB::table('journal_entries')->where('journal_number', $journalNumber)->exists()) {
                $errors[] = [
                    'row' => $firstRowNum,
                    'message' => "Duplicate journal number: {$journalNumber} already exists in database.",
                    'journal_number' => $journalNumber,
                ];
                $voucherHasError = true;
            }

            // 2. Minimum 2 lines
            if (count($rowsInVoucher) < 2) {
                $errors[] = [
                    'row' => $firstRowNum,
                    'message' => "Jurnal {$journalNumber} minimal harus memiliki 2 baris (Debit & Kredit).",
                    'journal_number' => $journalNumber,
                ];
                $voucherHasError = true;
            }

            // 3. Resolve & validate date
            $rawDate = $this->extractValue($firstRowData, ['tanggal', 'date', 'tgl', 'transaction_date']);
            $parsedDate = $this->parseDate($rawDate);

            if (! $parsedDate) {
                $errors[] = [
                    'row' => $firstRowNum,
                    'message' => "Format tanggal tidak valid pada jurnal {$journalNumber}.",
                    'journal_number' => $journalNumber,
                ];
                $voucherHasError = true;
            }

            // 4. Validate accounting period
            $assignedPeriodId = null;
            if ($parsedDate) {
                try {
                    $resolvedPeriod = $this->periodService->resolvePeriodByDate($parsedDate);
                    $this->periodService->ensurePeriodOpen($resolvedPeriod);
                    $assignedPeriodId = $resolvedPeriod->id;
                } catch (\Throwable $e) {
                    $errMessage = $e->getMessage();
                    if (str_contains(strtolower($errMessage), 'closed')) {
                        $errMessage = 'Accounting period is closed';
                    } elseif (str_contains(strtolower($errMessage), 'not found')) {
                        $errMessage = 'Accounting period not found for transaction date';
                    }
                    $errors[] = [
                        'row' => $firstRowNum,
                        'message' => $errMessage,
                        'journal_number' => $journalNumber,
                    ];
                    $voucherHasError = true;
                }
            }

            // 5. Resolve program
            $rawProgram = $this->extractValue($firstRowData, ['program', 'nama_program', 'program_name']);
            $resolvedProgramId = null;
            if ($rawProgram !== null && trim((string) $rawProgram) !== '') {
                $progName = trim((string) $rawProgram);
                $foundProg = $allPrograms->first(function ($p) use ($progName) {
                    return strcasecmp($p->title, $progName) === 0 || stripos($p->title, $progName) !== false;
                });
                $resolvedProgramId = $foundProg?->id;
            }

            // 6. Validate lines (account, debit, credit)
            $voucherLines = [];
            $totalDebit = 0.0;
            $totalCredit = 0.0;

            foreach ($rowsInVoucher as $r) {
                $rNum = $r['excel_row'];
                $rData = $r['raw'];

                $codeVal = $this->extractValue($rData, ['kode_akun', 'kode', 'code', 'account_code']);
                $code = $codeVal !== null ? trim((string) $codeVal) : '';

                if ($code === '') {
                    $errors[] = [
                        'row' => $rNum,
                        'message' => "Kode akun wajib diisi pada baris jurnal {$journalNumber}.",
                        'journal_number' => $journalNumber,
                    ];
                    $voucherHasError = true;

                    continue;
                }

                $account = $accounts->get($code);
                if (! $account) {
                    $errors[] = [
                        'row' => $rNum,
                        'message' => "Account code not found: {$code}",
                        'journal_number' => $journalNumber,
                    ];
                    $voucherHasError = true;

                    continue;
                }

                $debit = $this->parseAmount($this->extractValue($rData, ['debit', 'debet']));
                $credit = $this->parseAmount($this->extractValue($rData, ['kredit', 'credit']));

                if ($debit < 0 || $credit < 0) {
                    $errors[] = [
                        'row' => $rNum,
                        'message' => "Nilai debit atau kredit tidak boleh negatif pada jurnal {$journalNumber}.",
                        'journal_number' => $journalNumber,
                    ];
                    $voucherHasError = true;
                } elseif ($debit > 0 && $credit > 0) {
                    $errors[] = [
                        'row' => $rNum,
                        'message' => "Baris pada jurnal {$journalNumber} hanya boleh memiliki Debit ATAU Kredit, tidak boleh keduanya.",
                        'journal_number' => $journalNumber,
                    ];
                    $voucherHasError = true;
                } elseif ($debit == 0.0 && $credit == 0.0) {
                    $errors[] = [
                        'row' => $rNum,
                        'message' => "Baris pada jurnal {$journalNumber} harus memiliki nilai Debit atau Kredit lebih dari 0.",
                        'journal_number' => $journalNumber,
                    ];
                    $voucherHasError = true;
                }

                $totalDebit += $debit;
                $totalCredit += $credit;

                $lineDesc = $this->extractValue($rData, ['keterangan', 'deskripsi', 'description', 'memo', 'catatan']);

                $voucherLines[] = [
                    'account_id' => $account->id,
                    'debit' => $debit,
                    'credit' => $credit,
                    'description' => $lineDesc ? trim((string) $lineDesc) : null,
                ];
            }

            // 7. Validate debit credit balance
            if (abs($totalDebit - $totalCredit) > 0.001) {
                $errors[] = [
                    'row' => $firstRowNum,
                    'message' => "Journal is not balanced on {$journalNumber}. Total Debit (".number_format($totalDebit, 2).') != Total Credit ('.number_format($totalCredit, 2).').',
                    'journal_number' => $journalNumber,
                ];
                $voucherHasError = true;
            } elseif ($totalDebit <= 0.0) {
                $errors[] = [
                    'row' => $firstRowNum,
                    'message' => "Total nilai transaksi pada jurnal {$journalNumber} harus lebih besar dari 0.",
                    'journal_number' => $journalNumber,
                ];
                $voucherHasError = true;
            }

            if (! $voucherHasError) {
                $voucherDesc = $this->extractValue($firstRowData, ['keterangan', 'deskripsi', 'description', 'memo']) ?: "Import Jurnal {$journalNumber}";

                $validatedVouchers[] = [
                    'journal_number' => $journalNumber,
                    'transaction_date' => $parsedDate,
                    'description' => trim((string) $voucherDesc),
                    'program_id' => $resolvedProgramId,
                    'accounting_period_id' => $assignedPeriodId,
                    'lines' => $voucherLines,
                ];
            }
        }

        return [
            'vouchers' => $validatedVouchers,
            'errors' => $errors,
            'total_rows' => $totalNonEmptyRows,
            'total_journals' => count($vouchersRaw),
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
                'batch_id' => $batch->id,
                'row_number' => (int) ($err['row'] ?? 0),
                'error_message' => (string) ($err['message'] ?? 'Unknown error'),
            ]);
        }

        AuditLog::create([
            'user_id' => $user->id,
            'module' => 'finance_import',
            'action' => 'journal_import_failed',
            'reference_id' => $batch->id,
            'old_data' => null,
            'new_data' => [
                'file_name' => $batch->file_name,
                'status' => 'failed',
                'failed_rows' => count($errors),
                'errors' => $errors,
            ],
        ]);

        return [
            'status' => 'failed',
            'batch_id' => $batch->id,
            'errors' => $errors,
        ];
    }

    /**
     * Parse date value from Excel.
     */
    public function parseDate($value): ?string
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }

        if (is_numeric($value)) {
            try {
                return Carbon::instance(ExcelDate::excelToDateTimeObject((float) $value))->format('Y-m-d');
            } catch (\Throwable $e) {
                return null;
            }
        }

        try {
            return Carbon::parse(trim((string) $value))->format('Y-m-d');
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Parse amount to float.
     */
    public function parseAmount($value): float
    {
        if ($value === null || $value === '') {
            return 0.0;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        $clean = trim((string) $value);
        // Remove currency prefix like "Rp"
        $clean = preg_replace('/^[A-Za-z\s\$\.]+/u', '', $clean);

        // Check if Indonesian format e.g. 10.000.000,00
        if (preg_match('/^[\d\.]+(,\d+)?$/', $clean)) {
            $clean = str_replace('.', '', $clean);
            $clean = str_replace(',', '.', $clean);
        } else {
            $clean = str_replace(',', '', $clean);
        }

        return is_numeric($clean) ? (float) $clean : 0.0;
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
