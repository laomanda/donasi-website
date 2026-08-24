<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CashFlowReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private readonly Collection $mutations)
    {
    }

    public function collection(): Collection
    {
        return $this->mutations;
    }

    public function headings(): array
    {
        return [
            'ID / Ref',
            'Tipe Mutasi',
            'Tanggal & Waktu',
            'Kode Transaksi',
            'Keterangan / Donatur',
            'Detail Sumber / Mitra',
            'Program Terkait',
            'Arus Kas Masuk (Inflow Rp)',
            'Arus Kas Keluar (Outflow Rp)',
        ];
    }

    public function map($item): array
    {
        $isInflow = ($item['type'] ?? '') === 'inflow';
        $amount = (float) ($item['amount'] ?? 0);

        return [
            $item['id'] ?? '-',
            $isInflow ? 'Pemasukan (Donasi)' : 'Pengeluaran (Penyaluran)',
            isset($item['date']) ? date('Y-m-d H:i', strtotime($item['date'])) : '-',
            $item['code'] ?? '-',
            $item['title'] ?? '-',
            $item['subtitle'] ?? '-',
            $item['program_title'] ?? '-',
            $isInflow ? $amount : 0,
            !$isInflow ? $amount : 0,
        ];
    }
}
