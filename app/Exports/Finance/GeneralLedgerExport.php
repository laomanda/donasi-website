<?php

namespace App\Exports\Finance;

use App\Services\GeneralLedgerService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GeneralLedgerExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected array $filters;
    protected string $sheetTitle;

    public function __construct(array $filters = [], string $title = 'Buku Besar')
    {
        $this->filters = $filters;
        $this->sheetTitle = $title;
    }

    public function collection(): Collection
    {
        $glService = app(GeneralLedgerService::class);
        $data = $glService->getLedger($this->filters);

        $rows = new Collection();
        $startDate = $data['start_date'] ?? '-';

        foreach ($data['accounts'] as $account) {
            $code = $account['code'];
            $name = $account['name'];
            $normalBalance = strtolower((string) $account['normal_balance']);
            $openingBalance = (float) $account['opening_balance'];

            // Saldo Awal row
            $openingDebit = ($normalBalance === 'debit' && $openingBalance > 0) ? $openingBalance : 0.0;
            $openingCredit = ($normalBalance === 'credit' && $openingBalance > 0) ? $openingBalance : 0.0;

            $rows->push([
                'account_code'   => $code,
                'account_name'   => $name,
                'date'           => $startDate,
                'journal_number' => 'SALDO-AWAL',
                'description'    => 'Saldo Awal',
                'debit'          => $openingDebit,
                'credit'         => $openingCredit,
                'balance'        => $openingBalance,
            ]);

            // Transactions
            foreach ($account['transactions'] as $tx) {
                $rows->push([
                    'account_code'   => $code,
                    'account_name'   => $name,
                    'date'           => $tx['transaction_date'] ?: '-',
                    'journal_number' => $tx['journal_number'],
                    'description'    => $tx['description'] ?: '-',
                    'debit'          => (float) $tx['debit'],
                    'credit'         => (float) $tx['credit'],
                    'balance'        => (float) $tx['running_balance'],
                ]);
            }
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Kode Akun',
            'Nama Akun',
            'Tanggal',
            'Nomor Jurnal',
            'Keterangan',
            'Debit',
            'Kredit',
            'Saldo',
        ];
    }

    /**
     * @param array $row
     */
    public function map($row): array
    {
        return [
            $row['account_code'],
            $row['account_name'],
            $row['date'],
            $row['journal_number'],
            $row['description'],
            $row['debit'],
            $row['credit'],
            $row['balance'],
        ];
    }

    public function title(): string
    {
        return $this->sheetTitle;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
