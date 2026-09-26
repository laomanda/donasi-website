<?php

namespace App\Exports\Finance;

use App\Models\AccountingPeriod;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class JournalEntriesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected array $filters;
    protected string $sheetTitle;

    public function __construct(array $filters = [], string $title = 'Jurnal Umum')
    {
        $this->filters = $filters;
        $this->sheetTitle = $title;
    }

    public function collection(): Collection
    {
        $periodId = $this->filters['period_id'] ?? $this->filters['accounting_period_id'] ?? null;
        $startDate = $this->filters['start_date'] ?? null;
        $endDate = $this->filters['end_date'] ?? null;

        if ($periodId && (!$startDate || !$endDate)) {
            $period = AccountingPeriod::find($periodId);
            if ($period) {
                $startDate = $startDate ?: ($period->start_date ? Carbon::parse($period->start_date)->toDateString() : null);
                $endDate = $endDate ?: ($period->end_date ? Carbon::parse($period->end_date)->toDateString() : null);
            }
        }

        // CRITICAL: Only posted journals are included in finance reports! Draft and void are excluded.
        $query = JournalEntry::with(['lines.account', 'program'])
            ->where('status', 'posted');

        if ($periodId) {
            $query->where('accounting_period_id', $periodId);
        }

        if ($startDate) {
            $query->where('transaction_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('transaction_date', '<=', $endDate);
        }

        $entries = $query->orderBy('transaction_date', 'asc')
            ->orderBy('journal_number', 'asc')
            ->get();

        // Flatten entries to line rows for general journal sheet
        $rows = new Collection();

        foreach ($entries as $entry) {
            $date = $entry->transaction_date ? Carbon::parse($entry->transaction_date)->format('Y-m-d') : '';
            $programTitle = $entry->program?->title ?? '-';
            $reference = $entry->reference_type ? $entry->reference_type . ' #' . $entry->reference_id : '-';

            foreach ($entry->lines as $line) {
                $rows->push([
                    'journal_number' => $entry->journal_number,
                    'date'           => $date,
                    'reference'      => $reference,
                    'program'        => $programTitle,
                    'description'    => $line->description ?: ($entry->description ?: '-'),
                    'account_code'   => $line->account?->code ?? '-',
                    'account_name'   => $line->account?->name ?? '-',
                    'debit'          => (float) $line->debit,
                    'credit'         => (float) $line->credit,
                    'status'         => ucfirst((string) $entry->status),
                ]);
            }
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Nomor Jurnal',
            'Tanggal',
            'Referensi',
            'Program',
            'Keterangan',
            'Kode Akun',
            'Nama Akun',
            'Debit',
            'Kredit',
            'Status',
        ];
    }

    /**
     * @param array $row
     */
    public function map($row): array
    {
        return [
            $row['journal_number'],
            $row['date'],
            $row['reference'],
            $row['program'],
            $row['description'],
            $row['account_code'],
            $row['account_name'],
            $row['debit'],
            $row['credit'],
            $row['status'],
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
