<?php

namespace App\Exports\Finance;

use App\Services\TrialBalanceService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TrialBalanceExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected array $filters;
    protected string $sheetTitle;

    public function __construct(array $filters = [], string $title = 'NS-TB')
    {
        $this->filters = $filters;
        $this->sheetTitle = $title;
    }

    public function collection(): Collection
    {
        $tbService = app(TrialBalanceService::class);
        $data = $tbService->getTrialBalance($this->filters);

        $rows = new Collection();

        foreach ($data['accounts'] as $acc) {
            $rows->push([
                'account_code' => $acc['code'],
                'account_name' => $acc['name'],
                'account_type' => ucfirst((string) $acc['account_type']),
                'debit'        => (float) $acc['total_debit'],
                'credit'       => (float) $acc['total_credit'],
                'balance'      => (float) $acc['ending_balance'],
            ]);
        }

        // Summary row
        $rows->push([
            'account_code' => 'TOTAL',
            'account_name' => 'Total Neraca Saldo',
            'account_type' => '',
            'debit'        => (float) ($data['grand_total_debit_balance'] ?? $data['grand_total_debit_turnover'] ?? 0),
            'credit'       => (float) ($data['grand_total_credit_balance'] ?? $data['grand_total_credit_turnover'] ?? 0),
            'balance'      => '',
        ]);

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Kode Akun',
            'Nama Akun',
            'Jenis Akun',
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
            $row['account_type'],
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
        $lastRow = $sheet->getHighestRow();

        return [
            1 => ['font' => ['bold' => true]],
            $lastRow => ['font' => ['bold' => true]],
        ];
    }
}
