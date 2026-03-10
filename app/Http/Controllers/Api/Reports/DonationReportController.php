<?php

namespace App\Http\Controllers\Api\Reports;

use App\Exports\DonationReportExport;
use App\Http\Controllers\Controller;
use App\Services\DonationReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class DonationReportController extends Controller
{
    private DonationReportService $reportService;

    public function __construct(DonationReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index(Request $request)
    {
        $query = $this->reportService->buildQuery($request);
        $summary = $this->reportService->buildSummary($query);

        if ($request->boolean('all')) {
            $items = $query->orderByDesc('created_at')->get();

            return response()->json([
                'data' => $items,
                'total' => $items->count(),
                'summary' => $summary,
            ]);
        }

        $perPage = $request->integer('per_page', 20);
        $donations = $query->orderByDesc('created_at')->paginate($perPage);

        // Transform the Paginator Collection to append the accessor
        $donations->getCollection()->transform(function ($donation) {
            $donation->append('donor_qualification');
            return $donation;
        });

        $payload = $donations->toArray();
        $payload['summary'] = $summary;

        return response()->json($payload);
    }

    public function export(Request $request)
    {
        $format = strtolower($request->string('format', 'pdf')->trim()->toString());
        $query = $this->reportService->buildQuery($request);
        $summary = $this->reportService->buildSummary($query);
        $donations = $query->orderByDesc('created_at')->get();

        $timestamp = now()->format('Ymd_His');

        if (in_array($format, ['xlsx', 'excel'], true)) {
            return Excel::download(
                new DonationReportExport($donations),
                "donation-report-{$timestamp}.xlsx"
            );
        }

        if ($format === 'pdf') {
            $filters = $this->normalizeFilters($request);
            $pdf = Pdf::loadView('reports.donations', [
                'donations' => $donations,
                'summary' => $summary,
                'filters' => $filters,
                'generatedAt' => now(),
            ])->setPaper('a4', 'landscape');

            return $pdf->download("donation-report-{$timestamp}.pdf");
        }

        return response()->json(['message' => 'Format export tidak didukung.'], 400);
    }

    private function normalizeFilters(Request $request): array
    {
        $source = strtolower($request->string('payment_source')->trim()->toString());
        $status = strtolower($request->string('status')->trim()->toString());

        return [
            'payment_source' => $source,
            'payment_source_label' => $this->formatSourceLabel($source),
            'status' => $status,
            'status_label' => $this->formatStatusLabel($status),
            'date_from' => $request->string('date_from')->trim()->toString(),
            'date_to' => $request->string('date_to')->trim()->toString(),
            'q' => $request->string('q')->trim()->toString(),
            'qualification' => $request->string('qualification')->trim()->toString(),
            'qualification_label' => ucfirst($request->string('qualification')->trim()->toString() ?: 'Semua'),
        ];
    }

    private function formatSourceLabel(string $source): string
    {
        return match ($source) {
            'midtrans' => 'Midtrans',
            'manual' => 'Manual',
            default => 'Semua',
        };
    }

    private function formatStatusLabel(string $status): string
    {
        return match ($status) {
            'paid' => 'Lunas',
            'pending' => 'Menunggu',
            'failed' => 'Gagal',
            'expired' => 'Kedaluwarsa',
            'cancelled' => 'Dibatalkan',
            default => 'Semua',
        };
    }
}
