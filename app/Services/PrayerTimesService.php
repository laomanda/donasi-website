<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PrayerTimesService
{
    /**
     * Ambil jadwal sholat dari AlAdhan, cache harian per kota+country+method.
     */
    public function getTimings(string $city, string $country, int $method = 20): array
    {
        $normalizedCity = trim($city);
        $normalizedCountry = trim($country);
        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');
        $cacheKey = sprintf(
            'prayer_times:%s:%s:%s:%s',
            Str::slug($normalizedCity, '-'),
            Str::upper($normalizedCountry),
            $method,
            $today
        );

        return Cache::remember($cacheKey, $this->secondsUntilEndOfDay(), function () use ($normalizedCity, $normalizedCountry, $method) {
            $baseUrl = rtrim(config('services.aladhan.base_url', 'https://api.aladhan.com/v1'), '/');

            try {
                $response = Http::timeout(5)->get("{$baseUrl}/timingsByCity", [
                    'city'    => $normalizedCity,
                    'country' => $normalizedCountry,
                    'method'  => $method,
                ]);

                if (! $response->ok() || ! data_get($response->json(), 'data.timings')) {
                    throw new \Exception('Failed to fetch from AlAdhan');
                }

                $data = $response->json('data');
            } catch (\Throwable $th) {
                // Return default/empty if API fails to avoid breaking the UI
                return [
                    'city'     => $normalizedCity,
                    'country'  => $normalizedCountry,
                    'method'   => $method,
                    'timezone' => 'Asia/Jakarta',
                    'date'     => Carbon::now()->format('d-m-Y'),
                    'timings'  => [
                        'Subuh'   => '--:--',
                        'Dzuhur'  => '--:--',
                        'Ashar'   => '--:--',
                        'Maghrib' => '--:--',
                        'Isya'    => '--:--',
                    ],
                ];
            }

            $timezone = $data['meta']['timezone'] ?? 'Asia/Jakarta';
            $date = $data['date']['gregorian']['date'] ?? Carbon::now($timezone)->format('Y-m-d');

            $map = [
                'Fajr'    => 'Subuh',
                'Dhuhr'   => 'Dzuhur',
                'Asr'     => 'Ashar',
                'Maghrib' => 'Maghrib',
                'Isha'    => 'Isya',
            ];

            $timings = [];
            foreach ($map as $apiKey => $label) {
                $raw = (string) data_get($data, "timings.{$apiKey}", '');
                $timings[$label] = $this->sanitizeTime($raw);
            }

            return [
                'city'     => $normalizedCity,
                'country'  => $normalizedCountry,
                'method'   => $method,
                'timezone' => $timezone,
                'date'     => $date,
                'timings'  => $timings,
            ];
        });
    }

    private function sanitizeTime(string $value): string
    {
        // Hilangkan offset (+07) dan karakter non-digit/non-colon, normalisasi ke HH:MM
        $clean = trim(preg_replace('/[^0-9:]/', '', $value));
        if (! Str::contains($clean, ':')) {
            return $clean ?: '--:--';
        }
        [$h, $m] = array_pad(explode(':', $clean), 2, '00');
        return sprintf('%02d:%02d', (int) $h, (int) $m);
    }

    private function secondsUntilEndOfDay(): int
    {
        $now = Carbon::now('Asia/Jakarta');
        return $now->copy()->endOfDay()->diffInSeconds($now);
    }
}
