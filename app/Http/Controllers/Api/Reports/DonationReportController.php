<?php

namespace App\Http\Controllers\Api\Reports;

use App\Exports\DonationReportExport;
use App\Http\Controllers\Controller;
use App\Models\Donation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class DonationReportController extends Controller
{
    public function index(Request $request)
    {
        $query = $this->buildQuery($request);
        $summary = $this->buildSummary($query);

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

        $payload = $donations->toArray();
        $payload['summary'] = $summary;

        return response()->json($payload);
    }

    public function export(Request $request)
    {
        $format = strtolower($request->string('format', 'pdf')->trim()->toString());
        $query = $this->buildQuery($request);
        $summary = $this->buildSummary($query);
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

    private function buildQuery(Request $request): Builder
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
            $query->where(function (Builder $builder) use ($search) {
                $builder->where('donation_code', 'like', "%{$search}%")
                    ->orWhere('donor_name', 'like', "%{$search}%")
                    ->orWhere('donor_email', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    private function buildSummary(Builder $base): array
    {
        $totalCount = (clone $base)->count();
        $totalAmount = (float) (clone $base)->sum('amount');

        $manualBase = (clone $base)->where('payment_source', 'manual');
        $manualCount = (clone $manualBase)->count();
        $manualAmount = (float) (clone $manualBase)->sum('amount');

        $midtransBase = (clone $base)->where('payment_source', 'midtrans');
        $midtransCount = (clone $midtransBase)->count();
        $midtransAmount = (float) (clone $midtransBase)->sum('amount');

        return [
            'total_count' => $totalCount,
            'total_amount' => $totalAmount,
            'manual_count' => $manualCount,
            'manual_amount' => $manualAmount,
            'midtrans_count' => $midtransCount,
            'midtrans_amount' => $midtransAmount,
        ];
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
