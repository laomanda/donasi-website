<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Banner;

class BannerController extends Controller
{
    public function index()
    {
        return response()->json(
            Banner::orderBy('display_order')->get(['id', 'image_path', 'display_order'])
        );
    }
}
