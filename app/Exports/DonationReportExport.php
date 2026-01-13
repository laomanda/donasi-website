<?php

namespace App\Exports;

use App\Models\Donation;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DonationReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private readonly Collection $donations)
    {
    }

    public function collection(): Collection
    {
        return $this->donations;
    }

    public function headings(): array
    {
        return [
            'Kode Donasi',
            'Donatur',
            'Email',
            'Telepon',
            'Program',
            'Sumber',
            'Metode',
            'Channel',
            'Status',
            'Nominal',
            'Paid At',
            'Created At',
        ];
    }

    /**
     * @param Donation $donation
     */
    public function map($donation): array
    {
        return [
            $donation->donation_code ?: sprintf('#%s', $donation->id),
            $donation->donor_name ?: 'Anonim',
            $donation->donor_email ?: '',
            $donation->donor_phone ?: '',
            $donation->program?->title ?: 'Tanpa program',
            $donation->payment_source ?: '-',
            $donation->payment_method ?: '-',
            $donation->payment_channel ?: '-',
            $donation->status ?: '-',
            (float) $donation->amount,
            $donation->paid_at?->format('Y-m-d H:i') ?: '',
            $donation->created_at?->format('Y-m-d H:i') ?: '',
        ];
    }
}
