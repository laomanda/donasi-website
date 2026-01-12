<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\PickupRequest;
use App\Models\Program;
use App\Models\ZiswafConsultation;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        return response()->json($this->buildData());
    }

    protected function buildData(): array
    {
        $totalDonations = Donation::where('status', 'paid')->sum('amount');
        $monthlyDonations = Donation::where('status', 'paid')
            ->whereBetween('paid_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('amount');

        return [
            'stats' => [
                'programs'           => Program::count(),
                'active_programs'    => Program::where('status', 'active')->count(),
                'donations_paid'     => $totalDonations,
                'monthly_donations'  => $monthlyDonations,
                'pickup_pending'     => PickupRequest::where('status', 'baru')->count(),
                'consultation_new'   => ZiswafConsultation::where('status', 'baru')->count(),
            ],
            'recent_donations' => Donation::with('program')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
            'highlight_programs' => Program::highlight()->limit(5)->get(),
        ];
    }
}
