<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Suggestion;
use App\Support\AdminBadgeNotifier;
use App\Http\Requests\Frontend\StoreSuggestionRequest;

class SuggestionController extends Controller
{
    public function store(StoreSuggestionRequest $request)
    {
        $data = $request->validated();

        if ($data['is_anonymous'] ?? false) {
            $data['name'] = 'Hamba Allah';
        }

        $suggestion = Suggestion::create($data);
        AdminBadgeNotifier::dispatchCountForAllAdmins();

        return response()->json($suggestion, 201);
    }
}
