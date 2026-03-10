<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Support\Facades\Cache;

class BannerController extends Controller
{
    public function index()
    {
        $data = Cache::remember('frontend.banners', 600, function () {
            return Banner::orderBy('display_order')->get(['id', 'image_path', 'display_order']);
        });

        return response()->json($data);
    }
}
