<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    /**
     * Display a listing of chart of accounts.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q'            => ['nullable', 'string', 'max:100'],
            'account_type' => ['nullable', 'string', Rule::in(['asset', 'liability', 'net_asset', 'revenue', 'expense'])],
            'is_active'    => ['nullable'],
            'level'        => ['nullable', 'integer', 'min:1'],
            'parent_id'    => ['nullable', 'integer'],
            'per_page'     => ['nullable', 'integer', 'min:1', 'max:500'],
            'all'          => ['nullable'],
            'tree'         => ['nullable'],
        ]);

        $query = Account::with(['parent:id,code,name,account_type'])
            ->withCount(['children', 'journalEntryLines'])
            ->orderBy('code', 'asc');

        if ($request->filled('q')) {
            $q = trim((string) $request->input('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('code', 'like', "%{$q}%")
                    ->orWhere('name', 'like', "%{$q}%");
            });
        }

        if ($request->filled('account_type')) {
            $query->where('account_type', $request->input('account_type'));
        }

        if ($request->has('is_active') && $request->input('is_active') !== '' && $request->input('is_active') !== null) {
            $isActive = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isActive !== null) {
                $query->where('is_active', $isActive);
            }
        }

        if ($request->filled('level')) {
            $query->where('level', (int) $request->input('level'));
        }

        if ($request->filled('parent_id')) {
            $query->where('parent_id', (int) $request->input('parent_id'));
        }

        // Summary counts across all accounts
        $summary = [
            'total'      => Account::count(),
            'active'     => Account::where('is_active', true)->count(),
            'inactive'   => Account::where('is_active', false)->count(),
            'asset'      => Account::where('account_type', 'asset')->count(),
            'liability'  => Account::where('account_type', 'liability')->count(),
            'net_asset'  => Account::where('account_type', 'net_asset')->count(),
            'revenue'    => Account::where('account_type', 'revenue')->count(),
            'expense'    => Account::where('account_type', 'expense')->count(),
        ];

        // If tree structure is requested, return top-level accounts with nested children
        if ($request->boolean('tree')) {
            $accounts = Account::with(['children' => function ($childQuery) {
                $childQuery->with('children')->withCount(['children', 'journalEntryLines'])->orderBy('code', 'asc');
            }])
                ->withCount(['children', 'journalEntryLines'])
                ->whereNull('parent_id')
                ->orderBy('code', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $accounts,
                'summary' => $summary,
            ]);
        }

        // Check if all accounts requested without pagination
        if ($request->boolean('all') || $request->input('per_page') === 'all') {
            $accounts = $query->get();
            return response()->json([
                'success' => true,
                'data'    => $accounts,
                'summary' => $summary,
            ]);
        }

        $perPage = min(max((int) $request->input('per_page', 50), 1), 500);
        $accounts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $accounts,
            'summary' => $summary,
        ]);
    }

    /**
     * Display a specific account details.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $account = Account::with([
            'parent:id,code,name,account_type,level',
            'children' => function ($q) {
                $q->withCount(['children', 'journalEntryLines'])->orderBy('code', 'asc');
            },
        ])
            ->withCount(['children', 'journalEntryLines'])
            ->find($id);

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $account,
        ]);
    }

    /**
     * Store a newly created account.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'            => ['required', 'string', 'max:50', 'unique:accounts,code'],
            'name'            => ['required', 'string', 'max:255'],
            'account_type'    => ['required', 'string', Rule::in(['asset', 'liability', 'net_asset', 'revenue', 'expense'])],
            'normal_balance'  => ['required', 'string', Rule::in(['debit', 'credit'])],
            'parent_id'       => ['nullable', 'integer', 'exists:accounts,id'],
            'report_category' => ['nullable', 'string', 'max:255'],
            'is_active'       => ['nullable', 'boolean'],
        ]);

        $level = 1;
        if (!empty($validated['parent_id'])) {
            $parent = Account::find($validated['parent_id']);
            if ($parent) {
                $level = $parent->level + 1;
            }
        }

        $account = Account::create([
            'code'            => trim($validated['code']),
            'name'            => trim($validated['name']),
            'account_type'    => $validated['account_type'],
            'normal_balance'  => $validated['normal_balance'],
            'parent_id'       => $validated['parent_id'] ?? null,
            'level'           => $level,
            'report_category' => $validated['report_category'] ?? null,
            'is_active'       => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil ditambahkan.',
            'data'    => $account->fresh(['parent:id,code,name,account_type']),
        ], 201);
    }

    /**
     * Update the specified account.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $account = Account::find($id);

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'code'            => ['required', 'string', 'max:50', Rule::unique('accounts', 'code')->ignore($id)],
            'name'            => ['required', 'string', 'max:255'],
            'account_type'    => ['required', 'string', Rule::in(['asset', 'liability', 'net_asset', 'revenue', 'expense'])],
            'normal_balance'  => ['required', 'string', Rule::in(['debit', 'credit'])],
            'parent_id'       => ['nullable', 'integer', 'exists:accounts,id', "not_in:{$id}"],
            'report_category' => ['nullable', 'string', 'max:255'],
            'is_active'       => ['nullable', 'boolean'],
        ]);

        // Accounting Integrity Protection:
        // If account has journal lines, prevent changing account_type or normal_balance
        $hasTransactions = $account->journalEntryLines()->exists();
        if ($hasTransactions) {
            if ($account->account_type !== $validated['account_type']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jenis akun tidak dapat diubah karena akun ini sudah memiliki transaksi jurnal.',
                ], 422);
            }
            if ($account->normal_balance !== $validated['normal_balance']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo normal tidak dapat diubah karena akun ini sudah memiliki transaksi jurnal.',
                ], 422);
            }
        }

        // Circular parent check: parent cannot be one of its own descendants
        if (!empty($validated['parent_id'])) {
            $descendantIds = $this->getAllDescendantIds($account);
            if (in_array((int) $validated['parent_id'], $descendantIds, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun induk tidak boleh merupakan sub-akun (turunan) dari akun ini.',
                ], 422);
            }
        }

        // Determine level
        $level = 1;
        if (!empty($validated['parent_id'])) {
            $parent = Account::find($validated['parent_id']);
            if ($parent) {
                $level = $parent->level + 1;
            }
        }

        $account->update([
            'code'            => trim($validated['code']),
            'name'            => trim($validated['name']),
            'account_type'    => $validated['account_type'],
            'normal_balance'  => $validated['normal_balance'],
            'parent_id'       => $validated['parent_id'] ?? null,
            'level'           => $level,
            'report_category' => $validated['report_category'] ?? null,
            'is_active'       => $validated['is_active'] ?? $account->is_active,
        ]);

        // If level changed, update descendants' levels recursively
        $this->updateDescendantsLevel($account);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil diperbarui.',
            'data'    => $account->fresh(['parent:id,code,name,account_type']),
        ]);
    }

    /**
     * Remove the specified account from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $account = Account::find($id);

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak ditemukan.',
            ], 404);
        }

        // Integrity Protection: Cannot delete if it has journal transactions
        if ($account->journalEntryLines()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak dapat dihapus karena sudah memiliki catatan transaksi jurnal. Anda dapat menonaktifkannya.',
            ], 422);
        }

        // Integrity Protection: Cannot delete if it has child accounts
        if ($account->children()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak dapat dihapus karena masih memiliki sub-akun (child accounts). Harap hapus atau pindahkan sub-akun terlebih dahulu.',
            ], 422);
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dihapus.',
        ]);
    }

    /**
     * Recursively fetch all descendant IDs for cycle detection.
     */
    protected function getAllDescendantIds(Account $account): array
    {
        $ids = [];
        $children = Account::where('parent_id', $account->id)->get();
        foreach ($children as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $this->getAllDescendantIds($child));
        }
        return $ids;
    }

    /**
     * Recursively update descendants level when parent level changes.
     */
    protected function updateDescendantsLevel(Account $account): void
    {
        $children = Account::where('parent_id', $account->id)->get();
        foreach ($children as $child) {
            $child->level = $account->level + 1;
            $child->save();
            $this->updateDescendantsLevel($child);
        }
    }
}
