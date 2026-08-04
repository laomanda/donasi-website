<?php

namespace App\Http\Controllers\Api\Frontend;

use App\Http\Controllers\Controller;
use App\Services\SocialMediaService;

class SocialMediaController extends Controller
{
    public function __invoke(SocialMediaService $socialMedia)
    {
        return response()->json($socialMedia->landingFeed());
    }
}
