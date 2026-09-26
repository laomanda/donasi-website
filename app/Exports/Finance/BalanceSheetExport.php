<?php

namespace App\Exports\Finance;

use App\Services\FinancialStatementService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BalanceSheetExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected array $filters;
    protected string $sheetTitle;
    protected array $boldRows = [1];

    public function __construct(array $filters = [], string $title = 'LP')
    {
        $this->filters = $filters;
        $this->sheetTitle = $title;
    }

    public function collection(): Collection
    {
        $fsService = app(FinancialStatementService::class);
        $data = $fsService->getBalanceSheet($this->filters);

        $rows = new Collection();
        $rowIndex = 2; // Row 1 is header

        // 1. Section ASET
        $rows->push(['code' => 'ASET', 'name' => '', 'amount' => '']);
        $this->boldRows[] = $rowIndex++;

        foreach ($data['assets'] as $asset) {
            $rows->push([
                'code'   => $asset['code'],
                'name'   => $asset['name'],
                'amount' => (float) $asset['balance'],
            ]);
            $rowIndex++;
        }

        $rows->push(['code' => 'TOTAL ASET', 'name' => '', 'amount' => (float) $data['total_assets']]);
        $this->boldRows[] = $rowIndex++;

        // Blank separator
        $rows->push(['code' => '', 'name' => '', 'amount' => '']);
        $rowIndex++;

        // 2. Section LIABILITAS
        $rows->push(['code' => 'LIABILITAS', 'name' => '', 'amount' => '']);
        $this->boldRows[] = $rowIndex++;

        foreach ($data['liabilities'] as $liab) {
            $rows->push([
                'code'   => $liab['code'],
                'name'   => $liab['name'],
                'amount' => (float) $liab['balance'],
            ]);
            $rowIndex++;
        }

        $rows->push(['code' => 'TOTAL LIABILITAS', 'name' => '', 'amount' => (float) $data['total_liabilities']]);
        $this->boldRows[] = $rowIndex++;

        // Blank separator
        $rows->push(['code' => '', 'name' => '', 'amount' => '']);
        $rowIndex++;

        // 3. Section ASET NETO
        $rows->push(['code' => 'ASET NETO', 'name' => '', 'amount' => '']);
        $this->boldRows[] = $rowIndex++;

        foreach ($data['net_assets'] as $netAsset) {
            $rows->push([
                'code'   => $netAsset['code'],
                'name'   => $netAsset['name'],
                'amount' => (float) $netAsset['balance'],
            ]);
            $rowIndex++;
        }

        $rows->push(['code' => 'TOTAL ASET NETO', 'name' => '', 'amount' => (float) $data['total_net_assets']]);
        $this->boldRows[] = $rowIndex++;

        // Blank separator
        $rows->push(['code' => '', 'name' => '', 'amount' => '']);
        $rowIndex++;

        // 4. Balance Check
        $totalLiabAndNet = (float) ($data['total_liabilities'] + $data['total_net_assets']);
        $rows->push(['code' => 'TOTAL LIABILITAS & ASET NETO', 'name' => '', 'amount' => $totalLiabAndNet]);
        $this->boldRows[] = $rowIndex++;

        $balanceStatus = $data['is_balanced'] ? 'SEIMBANG (BALANCED)' : 'TIDAK SEIMBANG';
        $rows->push(['code' => 'BALANCE CHECK STATUS', 'name' => '', 'amount' => $balanceStatus]);
        $this->boldRows[] = $rowIndex++;

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Kode Akun',
            'Nama Akun / Deskripsi',
            'Nominal (Rp)',
        ];
    }

    /**
     * @param array $row
     */
    public function map($row): array
    {
        return [
            $row['code'],
            $row['name'],
            $row['amount'],
        ];
    }

    public function title(): string
    {
        return $this->sheetTitle;
    }

    public function styles(Worksheet $sheet): array
    {
        $styles = [];
        foreach ($this->boldRows as $row) {
            $styles[$row] = ['font' => ['bold' => true]];
        }
        return $styles;
    }
}
