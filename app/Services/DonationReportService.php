<?php

namespace App\Services;

use App\Models\Donation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DonationReportService
{
    public function buildQuery(Request $request): Builder
    {
        $query = Donation::query()->with('program');

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        $source = $request->string('payment_source')->trim()->toString();
        if ($source !== '') {
            $query->where('payment_source', $source);
        }

        if ($dateFrom = $request->date('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->date('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where('donor_name', 'like', "%{$search}%");
        }

        $qualification = $request->string('qualification')->trim()->toString();
        if ($qualification !== '') {
            if ($qualification === 'anonim') {
                $query->whereNull('donor_phone')->orWhere('donor_phone', '');
            } else {
                $query->whereNotNull('donor_phone')->where('donor_phone', '!=', '');

                $phones = Donation::select('donor_phone')
                    ->whereNotNull('donor_phone')
                    ->where('donor_phone', '!=', '')
                    ->where('status', 'paid')
                    ->groupBy('donor_phone');

                if ($qualification === 'baru') {
                    $phones->havingRaw('COUNT(id) <= 1');
                } elseif ($qualification === 'tetap') {
                    $phones->havingRaw('COUNT(id) > 1 AND COUNT(id) <= 5');
                } elseif ($qualification === 'lama') {
                    $phones->havingRaw('COUNT(id) > 5');
                }
                
                $query->whereIn('donor_phone', $phones);
            }
        }

        return $query;
    }

    public function buildSummary(Builder $base): array
    {
        // Force stats to only count PAID donations
        $paidBase = (clone $base)->where('status', 'paid');

        $totalCount = (clone $paidBase)->count();
        $totalAmount = (float) (clone $paidBase)->sum('amount');

        $manualBase = (clone $paidBase)->where('payment_source', 'manual');
        $manualCount = (clone $manualBase)->count();
        $manualAmount = (float) (clone $manualBase)->sum('amount');

        $midtransBase = (clone $paidBase)->where('payment_source', 'midtrans');
        $midtransCount = (clone $midtransBase)->count();
        $midtransAmount = (float) (clone $midtransBase)->sum('amount');

        // Top Donor
        $topDonor = (clone $base)
            ->selectRaw('donor_name, SUM(amount) as total_amount, COUNT(id) as donation_count')
            ->where('status', 'paid')
            ->whereNotNull('donor_name')
            ->groupBy('donor_name')
            ->orderByDesc('total_amount')
            ->first();

        // Top Program
        $topProgramData = (clone $base)
            ->selectRaw('program_id, SUM(amount) as total_amount, COUNT(id) as donation_count')
            ->where('status', 'paid')
            ->whereNotNull('program_id')
            ->groupBy('program_id')
            ->orderByDesc('total_amount')
            ->with('program:id,title')
            ->first();
            
        $topProgram = null;
        if ($topProgramData && $topProgramData->program) {
            $topProgram = [
                'program_title' => $topProgramData->program->title,
                'total_amount' => (float) $topProgramData->total_amount,
                'donation_count' => (int) $topProgramData->donation_count
            ];
        }

        return [
            'total_count' => $totalCount,
            'total_amount' => $totalAmount,
            'manual_count' => $manualCount,
            'manual_amount' => $manualAmount,
            'midtrans_count' => $midtransCount,
            'midtrans_amount' => $midtransAmount,
            'top_donor' => $topDonor ? [
                'donor_name' => $topDonor->donor_name,
                'total_amount' => (float) $topDonor->total_amount,
                'donation_count' => (int) $topDonor->donation_count
            ] : null,
            'top_program' => $topProgram,
        ];
    }
}
