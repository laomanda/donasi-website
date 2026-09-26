<?php

namespace App\Exports\Finance;

use App\Models\Account;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AccountsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle, WithStyles
{
    protected array $filters;
    protected string $sheetTitle;

    public function __construct(array $filters = [], string $title = 'Daftar Akun')
    {
        $this->filters = $filters;
        $this->sheetTitle = $title;
    }

    public function collection(): Collection
    {
        $query = Account::with('parent')->orderBy('code', 'asc');

        if (isset($this->filters['is_active'])) {
            $query->where('is_active', (bool) $this->filters['is_active']);
        }

        if (!empty($this->filters['account_type'])) {
            $query->where('account_type', $this->filters['account_type']);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Kode Akun',
            'Nama Akun',
            'Level',
            'Parent Akun',
            'Jenis Akun',
            'Saldo Normal',
            'Kategori Laporan',
            'Status',
        ];
    }

    /**
     * @param Account $account
     */
    public function map($account): array
    {
        $parentLabel = $account->parent
            ? $account->parent->code . ' - ' . $account->parent->name
            : '-';

        return [
            $account->code,
            $account->name,
            $account->level,
            $parentLabel,
            ucfirst((string) $account->account_type),
            ucfirst((string) $account->normal_balance),
            $account->report_category ?: '-',
            $account->is_active ? 'Aktif' : 'Nonaktif',
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
