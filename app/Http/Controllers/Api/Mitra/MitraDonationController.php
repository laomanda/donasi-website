<?php

namespace App\Http\Controllers\Api\Mitra;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MitraDonationController extends Controller
{
    /**
     * Display a listing of donations associated with the logged-in Mitra.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Donation::with('program')
            ->where('user_id', $user->id);

        // Filter by Status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search by Program Name
        if ($request->has('q') && $request->q) {
            $search = $request->q;
            $query->whereHas('program', function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%');
            });
        }

        // Filter by Date Range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $donations = $query->latest()
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'status' => 'success',
            'data' => $donations
        ]);
    }

    /**
     * Export donation list to PDF.
     */
    public function exportPdf(Request $request)
    {
        if ($request->has('lang')) {
            \App::setLocale($request->lang);
        }
        
        $user = Auth::user();
        $query = Donation::with('program')
            ->where('user_id', $user->id);

        // Filter by Search (Program Name)
        if ($request->has('q') && $request->q) {
            $search = $request->q;
            $query->whereHas('program', function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%');
            });
        }

        // Filter by Date Range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $donations = $query->latest()->get();

        $summary = [
            'total_count' => $donations->count(),
            'total_amount' => $donations->sum('amount'),
            'manual_count' => $donations->where('payment_source', 'manual')->count(),
            'manual_amount' => $donations->where('payment_source', 'manual')->sum('amount'),
            'midtrans_count' => $donations->where('payment_source', 'midtrans')->count(),
            'midtrans_amount' => $donations->where('payment_source', 'midtrans')->sum('amount'),
        ];

        $filters = [
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
            'q' => $request->q,
            'status_label' => 'Semua',
            'payment_source_label' => 'Semua',
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.donations', [
            'donations' => $donations,
            'summary' => $summary,
            'filters' => $filters,
            'generatedAt' => now(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download("laporan-donasi-mitra-" . now()->format('YmdHis') . ".pdf");
    }

    /**
     * Export donation invoice to PDF.
     */
    public function export(int $id, Request $request)
    {
        if ($request->has('lang')) {
            \App::setLocale($request->lang);
        }

        $user = Auth::user();

        $donation = Donation::with('program')
            ->where('user_id', $user->id)
            ->where('status', 'paid')
            ->findOrFail($id);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.donation_invoice', [
            'donation' => $donation,
        ])->setPaper('a5', 'portrait');

        return $pdf->download("invoice-{$donation->donation_code}.pdf");
    }
}
