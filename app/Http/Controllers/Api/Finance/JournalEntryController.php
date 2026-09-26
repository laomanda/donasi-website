<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreJournalRequest;
use App\Models\JournalEntry;
use App\Services\JournalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JournalEntryController extends Controller
{
    public function __construct(
        protected JournalService $journalService
    ) {}

    /**
     * Display a listing of journal entries.
     */
    public function index(Request $request): JsonResponse
    {
        $query = JournalEntry::with(['lines.account', 'program:id,title', 'accountingPeriod:id,name', 'creator:id,name'])
            ->latest('transaction_date')
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('period_id')) {
            $query->where('accounting_period_id', $request->query('period_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->query('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->query('date_to'));
        }

        if ($request->filled('q')) {
            $q = trim((string) $request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('journal_number', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $journals = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $journals,
        ]);
    }

    /**
     * Display the specified journal entry.
     */
    public function show(int $id): JsonResponse
    {
        $journal = JournalEntry::with(['lines.account', 'program', 'accountingPeriod', 'creator:id,name,email'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $journal,
        ]);
    }

    /**
     * Store a newly created journal entry in storage.
     */
    public function store(StoreJournalRequest $request): JsonResponse
    {
        $journal = $this->journalService->createJournal(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Jurnal berhasil dibuat (status: ' . $journal->status . ').',
            'data'    => $journal,
        ], 201);
    }

    /**
     * Post a draft journal entry.
     */
    public function post(int $id, Request $request): JsonResponse
    {
        $journal = $this->journalService->postJournal($id, $request->user());

        return response()->json([
            'success' => true,
            'message' => "Jurnal {$journal->journal_number} berhasil di-posting.",
            'data'    => $journal,
        ]);
    }

    /**
     * Void a journal entry.
     */
    public function void(int $id, Request $request): JsonResponse
    {
        $reason = (string) $request->input('reason', '');
        $journal = $this->journalService->voidJournal($id, $reason, $request->user());

        return response()->json([
            'success' => true,
            'message' => "Jurnal {$journal->journal_number} berhasil dibatalkan (void).",
            'data'    => $journal,
        ]);
    }

    /**
     * Reverse a posted journal entry.
     */
    public function reverse(int $id, Request $request): JsonResponse
    {
        $reason = (string) $request->input('reason', '');
        $reversal = $this->journalService->reverseJournal($id, $reason, $request->user());

        return response()->json([
            'success' => true,
            'message' => "Jurnal pembalik {$reversal->journal_number} berhasil dibuat.",
            'data'    => $reversal,
        ], 201);
    }
}
