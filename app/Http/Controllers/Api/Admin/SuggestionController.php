<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use App\Support\AdminBadgeNotifier;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\UpdateSuggestionStatusRequest;

class SuggestionController extends Controller
{
    /**
     * Display a listing of suggestions.
     */
    public function index(Request $request)
    {
        if ($request->user()->hasRole('superadmin')) {
            return response()->json([
                'data' => [],
                'total' => 0,
                'message' => 'Superadmin access to suggestions is restricted.'
            ]);
        }

        $query = Suggestion::query();

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('message', 'like', "%{$q}%")
                      ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $perPage = $request->input('per_page', 20);
        $suggestions = $query->latest()->paginate($perPage);

        return response()->json($suggestions);
    }

    /**
     * Display the specified suggestion.
     */
    public function show(Suggestion $suggestion)
    {
        if (request()->user()->hasRole('superadmin')) {
            return response()->json(['message' => 'Forbidden'], 200);
        }
        return response()->json($suggestion);
    }

    /**
     * Remove the specified suggestion from storage.
     */
    public function destroy(Suggestion $suggestion)
    {
        if (request()->user()->hasRole('superadmin')) {
            return response()->json(['message' => 'Forbidden'], 200);
        }
        $suggestion->delete();
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json([
            'message' => 'Saran berhasil dihapus.',
        ]);
    }

    /**
     * Update the status of the specified suggestion.
     */
    public function updateStatus(UpdateSuggestionStatusRequest $request, Suggestion $suggestion)
    {
        if ($request->user()->hasRole('superadmin')) {
            return response()->json(['message' => 'Forbidden'], 200);
        }

        $suggestion->update(['status' => $request->validated('status')]);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($suggestion->refresh());
    }
}
