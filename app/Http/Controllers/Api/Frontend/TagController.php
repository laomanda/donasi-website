<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Support\Facades\Cache;

class TagController extends Controller
{
    public function index()
    {
        $tags = Cache::remember('frontend.tags', 600, function () {
            return Tag::where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->get();
        });
            
        return response()->json($tags);
    }
}
