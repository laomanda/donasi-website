<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\PickupRequest;
use App\Models\Program;
use App\Models\WakafConsultation;
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
                'articles_total'     => \App\Models\Article::count(),
                'donations_paid'     => $totalDonations,
                'monthly_donations'  => $monthlyDonations,
                'pickup_pending'     => PickupRequest::where('status', 'baru')->count(),
                'pickup_success'     => PickupRequest::where('status', 'selesai')->count(),
                'consultation_new'   => WakafConsultation::where('status', 'baru')->count(),
                'consultation_replied' => WakafConsultation::where('status', 'dibalas')->count(),
                'bank_accounts_total' => \App\Models\BankAccount::count(),
                'banners_total'      => \App\Models\Banner::count(),
                'partners_total'     => \App\Models\Partner::count(),
                'organization_total' => \App\Models\OrganizationMember::count(),
                'suggestions_replied' => \App\Models\Suggestion::where('status', 'dibalas')->count(),
                'donations_confirmed_count' => \App\Models\Donation::where('status', 'paid')->count(),
                'users_total'        => \App\Models\User::count(),
            ],
            'recent_donations' => Donation::with('program')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(),
            'upcoming_pickups' => PickupRequest::whereIn('status', ['baru', 'dijadwalkan'])
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(),
            'urgent_consultations' => WakafConsultation::where('status', 'baru')
                ->orderBy('created_at', 'asc')
                ->limit(5)
                ->get(),
            'highlight_programs' => Program::highlight()->limit(5)->get(),
        ];
    }
}
