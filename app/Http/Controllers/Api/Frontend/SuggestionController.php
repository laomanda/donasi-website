<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use App\Support\AdminBadgeNotifier;
use Illuminate\Http\Request;

class SuggestionController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => ['nullable', 'string', 'max:255'],
            'phone'        => ['required', 'string', 'max:30'],
            'category'     => ['required', 'string', 'max:100'],
            'message'      => ['required', 'string'],
            'is_anonymous' => ['boolean'],
        ]);

        if ($data['is_anonymous'] ?? false) {
            $data['name'] = 'Hamba Allah';
        }

        $suggestion = Suggestion::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($suggestion, 201);
    }
}
