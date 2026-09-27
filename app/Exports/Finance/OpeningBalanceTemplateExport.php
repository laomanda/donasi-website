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

class OpeningBalanceTemplateExport implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    public function headings(): array
    {
        return [
            'Kode Akun',
            'Nama Akun',
            'Saldo Normal',
            'Saldo Awal',
        ];
    }

    public function array(): array
    {
        return [
            [
                '1112',
                'Bank BSI Rekening Wakaf',
                'Debit',
                100000000,
            ],
            [
                '3110',
                'Aset Neto Terikat Permanen (Pokok Wakaf Abadi)',
                'Credit',
                100000000,
            ],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ];
    }

    public function title(): string
    {
        return 'OPENING BALANCE';
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->freezePane('A2');

        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => 'FFFFFFFF'],
                    'size' => 11,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF1F4E78'], // Navy Blue
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }
}
