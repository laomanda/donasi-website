<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Tag;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();
            
        return response()->json($tags);
    }
}
