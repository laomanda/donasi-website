<?php

namespace App\Exports;

use App\Models\Allocation;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AllocationReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private readonly Collection $allocations)
    {
    }

    public function collection(): Collection
    {
        return $this->allocations;
    }

    public function headings(): array
    {
        return [
            'ID Penyaluran',
            'Tanggal Penyaluran',
            'Program Donasi',
            'Keperluan / Kegiatan',
            'Nominal Penyaluran (Rp)',
            'Tautan Bukti Dokumentasi',
            'Dibuat Pada',
        ];
    }

    /**
     * @param Allocation $alloc
     */
    public function map($alloc): array
    {
        $programTitle = $alloc->program?->title ?: ($alloc->donation?->program?->title ?: 'Dana Umum / Wakaf Terbuka');

        $proofUrl = $alloc->proof_path
            ? (str_starts_with($alloc->proof_path, 'http') ? $alloc->proof_path : asset('storage/' . $alloc->proof_path))
            : '-';

        return [
            '#' . $alloc->id,
            $alloc->allocated_at ? \Carbon\Carbon::parse($alloc->allocated_at)->format('Y-m-d H:i') : \Carbon\Carbon::parse($alloc->created_at)->format('Y-m-d H:i'),
            $programTitle,
            $alloc->description ?: 'Penyaluran dana program',
            (float) $alloc->amount,
            $proofUrl,
            $alloc->created_at ? \Carbon\Carbon::parse($alloc->created_at)->format('Y-m-d H:i') : '',
        ];
    }
}
