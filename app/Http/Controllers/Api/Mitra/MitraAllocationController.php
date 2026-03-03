<?php

namespace App\Http\Controllers\Api\Mitra;

use App\Http\Controllers\Controller;
use App\Models\Allocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class MitraAllocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Allocation::with('program')
            ->where('user_id', $user->id);

        if ($request->has('q') && $request->q) {
            $q = $request->q;
            $query->where(function ($query) use ($q) {
                $query->where('description', 'like', '%' . $q . '%')
                    ->orWhereHas('program', function ($query) use ($q) {
                        $query->where('title', 'like', '%' . $q . '%');
                    });
            });
        }
        
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $allocations = $query->latest()
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'status' => 'success',
            'data' => $allocations
        ]);
    }

    public function downloadPdf(Request $request)
    {
        $user = Auth::user();

        $query = Allocation::with('program')
            ->where('user_id', $user->id);

        if ($request->has('q') && $request->q) {
            $q = $request->q;
            $query->where(function ($query) use ($q) {
                $query->where('description', 'like', '%' . $q . '%')
                    ->orWhereHas('program', function ($query) use ($q) {
                        $query->where('title', 'like', '%' . $q . '%');
                    });
            });
        }
        
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $allocations = $query->latest()->get();

        $pdf = Pdf::loadView('pdf.mitra_allocations', [
            'allocations' => $allocations,
            'user' => $user,
            'date_from' => $request->date_from,
            'date_to' => $request->date_to
        ]);

        return $pdf->download('laporan-alokasi-dana.pdf');
    }
}
