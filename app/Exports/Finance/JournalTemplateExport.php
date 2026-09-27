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

class JournalTemplateExport implements FromArray, WithHeadings, WithTitle, ShouldAutoSize, WithStyles
{
    public function headings(): array
    {
        return [
            'Nomor Jurnal',
            'Tanggal',
            'Kode Akun',
            'Nama Akun',
            'Keterangan',
            'Program',
            'Debit',
            'Kredit',
        ];
    }

    public function array(): array
    {
        return [
            // Sample balanced journal voucher JU-0001
            [
                'JU-0001',
                '2026-01-01',
                '1112',
                'Bank BSI - Rekening Wakaf',
                'Penerimaan Wakaf Uang Abadi',
                'Program Pendidikan',
                10000000,
                0,
            ],
            [
                'JU-0001',
                '2026-01-01',
                '4110',
                'Penerimaan Wakaf Uang - Abadi',
                'Penerimaan Wakaf Uang Abadi',
                'Program Pendidikan',
                0,
                10000000,
            ],
            // Empty template rows for user input
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ];
    }

    public function title(): string
    {
        return 'JU';
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
