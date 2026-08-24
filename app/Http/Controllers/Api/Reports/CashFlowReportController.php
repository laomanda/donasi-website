<?php

namespace App\Http\Controllers\Api\Reports;

use App\Exports\CashFlowReportExport;
use App\Http\Controllers\Controller;
use App\Services\CashFlowReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class CashFlowReportController extends Controller
{
    public function __construct(private readonly CashFlowReportService $service)
    {
    }

    public function index(Request $request)
    {
        $data = $this->service->getCashFlowData($request);

        // Pagination on mutations for frontend table view
        $perPage = $request->integer('per_page', 20);
        $page = $request->integer('page', 1);
        $mutations = $data['mutations'];

        $totalMutations = $mutations->count();
        $pagedMutations = $mutations->forPage($page, $perPage)->values();

        return response()->json([
            'summary' => $data['summary'],
            'program_breakdowns' => $data['program_breakdowns'],
            'data' => $pagedMutations,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $totalMutations,
            'last_page' => (int) ceil($totalMutations / max(1, $perPage)),
            'filters' => $data['filters'],
        ]);
    }

    public function export(Request $request)
    {
        $format = strtolower($request->string('format', 'pdf')->trim()->toString());
        $data = $this->service->getCashFlowData($request);
        $timestamp = now()->format('Ymd_His');

        if (in_array($format, ['xlsx', 'excel'], true)) {
            return Excel::download(
                new CashFlowReportExport($data['mutations']),
                "laporan-arus-kas-dpf-{$timestamp}.xlsx"
            );
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.cash_flow', [
                'summary' => $data['summary'],
                'programBreakdowns' => $data['program_breakdowns'],
                'mutations' => $data['mutations'],
                'filters' => $data['filters'],
                'generatedAt' => now(),
            ])->setPaper('a4', 'landscape');

            return $pdf->download("laporan-arus-kas-dpf-{$timestamp}.pdf");
        }

        return response()->json(['message' => 'Format export tidak didukung.'], 400);
    }
}
