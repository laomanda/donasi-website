<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PrayerTimesService;
use App\Http\Requests\Frontend\PrayerTimesRequest;

class PrayerTimesController extends Controller
{
    public function __construct(private PrayerTimesService $service)
    {
    }

    public function index(PrayerTimesRequest $request)
    {
        $validated = $request->validated();

        $city = trim($validated['city']);
        $country = trim($validated['country']);
        $method = (int) ($validated['method'] ?? 20);

        $data = $this->service->getTimings($city, $country, $method);

        return response()->json($data);
    }
}
