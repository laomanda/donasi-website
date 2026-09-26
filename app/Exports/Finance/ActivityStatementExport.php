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

class ActivityStatementExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected array $filters;
    protected string $sheetTitle;
    protected array $boldRows = [1];

    public function __construct(array $filters = [], string $title = 'LA')
    {
        $this->filters = $filters;
        $this->sheetTitle = $title;
    }

    public function collection(): Collection
    {
        $fsService = app(FinancialStatementService::class);
        $data = $fsService->getActivityStatement($this->filters);

        $rows = new Collection();
        $rowIndex = 2; // Row 1 is header

        // 1. Section Penerimaan
        $rows->push(['code' => 'PENERIMAAN', 'name' => '', 'amount' => '']);
        $this->boldRows[] = $rowIndex++;

        foreach ($data['revenues'] as $rev) {
            $rows->push([
                'code'   => $rev['code'],
                'name'   => $rev['name'],
                'amount' => (float) $rev['amount'],
            ]);
            $rowIndex++;
        }

        $rows->push(['code' => 'TOTAL PENERIMAAN', 'name' => '', 'amount' => (float) $data['total_revenues']]);
        $this->boldRows[] = $rowIndex++;

        // Blank separator
        $rows->push(['code' => '', 'name' => '', 'amount' => '']);
        $rowIndex++;

        // 2. Section Beban
        $rows->push(['code' => 'BEBAN DAN PENYALURAN', 'name' => '', 'amount' => '']);
        $this->boldRows[] = $rowIndex++;

        foreach ($data['expenses'] as $exp) {
            $rows->push([
                'code'   => $exp['code'],
                'name'   => $exp['name'],
                'amount' => (float) $exp['amount'],
            ]);
            $rowIndex++;
        }

        $rows->push(['code' => 'TOTAL BEBAN DAN PENYALURAN', 'name' => '', 'amount' => (float) $data['total_expenses']]);
        $this->boldRows[] = $rowIndex++;

        // Blank separator
        $rows->push(['code' => '', 'name' => '', 'amount' => '']);
        $rowIndex++;

        // 3. Section Surplus / Defisit
        $rows->push(['code' => 'SURPLUS / (DEFISIT)', 'name' => '', 'amount' => (float) $data['surplus_deficit']]);
        $this->boldRows[] = $rowIndex++;

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Kode Akun',
            'Nama Akun / Uraian',
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
