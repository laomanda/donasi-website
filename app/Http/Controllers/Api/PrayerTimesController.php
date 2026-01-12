<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PrayerTimesService;
use Illuminate\Http\Request;

class PrayerTimesController extends Controller
{
    public function __construct(private PrayerTimesService $service)
    {
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'city'    => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:5'],
            'method'  => ['nullable', 'integer', 'min:0', 'max:99'],
        ]);

        $city = trim($validated['city']);
        $country = trim($validated['country']);
        $method = (int) ($validated['method'] ?? 20);

        $data = $this->service->getTimings($city, $country, $method);

        return response()->json($data);
    }
}
