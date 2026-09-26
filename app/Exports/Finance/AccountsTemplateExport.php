<?php

namespace App\Exports\Finance;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AccountsTemplateExport implements FromArray, WithHeadings, WithTitle, ShouldAutoSize, WithStyles
{
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

    public function array(): array
    {
        return [
            // Sample guidance rows (contoh format tanpa data akun existing organisasi)
            [
                '1000-EXAMPLE',
                'Contoh Induk Aset (Level 1)',
                1,
                '',
                'asset',
                'debit',
                'Aset',
                'Aktif',
            ],
            [
                '1100-EXAMPLE',
                'Contoh Aset Lancar (Level 2)',
                2,
                '1000-EXAMPLE',
                'asset',
                'debit',
                'Aset Lancar',
                'Aktif',
            ],
            [
                '1110-EXAMPLE',
                'Contoh Kas & Setara Kas (Level 3)',
                3,
                '1100-EXAMPLE',
                'asset',
                'debit',
                'Kas',
                'Aktif',
            ],
            // Empty rows for user input
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ];
    }

    public function title(): string
    {
        return 'AD';
    }

    public function styles(Worksheet $sheet): array
    {
        // Freeze header at row 2
        $sheet->freezePane('A2');

        return [
            1 => [
                'font' => [
                    'bold'  => true,
                    'color' => ['argb' => 'FFFFFFFF'],
                    'size'  => 11,
                ],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF1F4E78'], // Navy Blue
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }
}
