<?php

namespace App\Exports\Finance;

use App\Services\WaqfAssetReportService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class WaqfAssetsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected array $filters;
    protected string $sheetTitle;

    public function __construct(array $filters = [], string $title = 'LRAW')
    {
        $this->filters = $filters;
        $this->sheetTitle = $title;
    }

    public function collection(): Collection
    {
        $reportService = app(WaqfAssetReportService::class);
        $register = $reportService->getAssetRegister($this->filters);

        return collect($register);
    }

    public function headings(): array
    {
        return [
            'Kode Aset',
            'Nama Aset',
            'Kategori',
            'Wakif',
            'Tanggal Perolehan',
            'Nilai Perolehan',
            'Penyusutan',
            'Nilai Buku',
            'Lokasi',
            'Kondisi',
            'Status',
        ];
    }

    /**
     * @param array $item
     */
    public function map($item): array
    {
        return [
            $item['asset_code'],
            $item['asset_name'],
            $item['category'],
            $item['wakif'],
            $item['acquisition_date'] ?: '-',
            (float) $item['acquisition_value'],
            (float) $item['accumulated_depreciation'],
            (float) $item['book_value'],
            $item['location'] ?: '-',
            ucfirst((string) ($item['condition'] ?? 'Baik')),
            ucfirst((string) ($item['status'] ?? 'Active')),
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
