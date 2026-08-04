<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Models\GalleryMitra;
use Illuminate\Http\Request;

class GalleryMitraController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 24);

        return response()->json(
            GalleryMitra::published()
                ->latest('created_at')
                ->paginate($perPage)
        );
    }
}
