<?php

namespace App\Exports\Finance;

use App\Services\FinancialNoteService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class FinancialNotesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected array $filters;
    protected string $sheetTitle;

    public function __construct(array $filters = [], string $title = 'CLK')
    {
        $this->filters = $filters;
        $this->sheetTitle = $title;
    }

    public function collection(): Collection
    {
        $noteService = app(FinancialNoteService::class);
        $notes = $noteService->getNotes($this->filters);

        return collect($notes);
    }

    public function headings(): array
    {
        return [
            'Kategori',
            'Judul',
            'Isi Catatan',
            'Status',
            'Periode',
        ];
    }

    /**
     * @param array $note
     */
    public function map($note): array
    {
        $periodLabel = $note['period_name']
            ?: ($note['accounting_period_id'] ? 'Periode #' . $note['accounting_period_id'] : 'Semua Periode');

        return [
            $note['category_label'] ?? $note['category'],
            $note['title'],
            $note['content'],
            ucfirst((string) $note['status']),
            $periodLabel,
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
