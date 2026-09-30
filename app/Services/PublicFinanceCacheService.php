<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\JournalEntry;
use App\Models\WaqfAsset;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PublicFinanceCacheService
{
    public const ALL_TIME_KEY = 'frontend.home';
    public const CACHED_YEARS_SET_KEY = 'frontend.home.cached_years';
    public const DONATION_SUMMARY_KEY = 'frontend_donation_summary';

    /**
     * Resolve cache key for public home payload.
     */
    public function getCacheKey(?int $year = null): string
    {
        return $year ? "frontend.home.year_{$year}" : self::ALL_TIME_KEY;
    }

    /**
     * Cache or retrieve public home payload while recording active year keys.
     *
     * @template T
     * @param int|null $year
     * @param int $ttlSeconds
     * @param \Closure(): T $callback
     * @return T
     */
    public function remember(?int $year, int $ttlSeconds, \Closure $callback)
    {
        $cacheKey = $this->getCacheKey($year);

        if ($year) {
            $this->recordCachedYear($year);
        }

        return Cache::remember($cacheKey, $ttlSeconds, $callback);
    }

    /**
     * Record a year in the tracked cached years set.
     */
    protected function recordCachedYear(int $year): void
    {
        try {
            $cachedYears = Cache::get(self::CACHED_YEARS_SET_KEY, []);
            if (! is_array($cachedYears)) {
                $cachedYears = [];
            }
            if (! in_array($year, $cachedYears, true)) {
                $cachedYears[] = $year;
                Cache::forever(self::CACHED_YEARS_SET_KEY, $cachedYears);
            }
        } catch (\Throwable) {
            // Non-critical tracking fallback
        }
    }

    /**
     * Invalidate all-time cache and a specific year's cache.
     */
    public function invalidateYear(?int $year): void
    {
        $this->executeAfterCommit(function () use ($year) {
            Cache::forget(self::ALL_TIME_KEY);
            Cache::forget(self::DONATION_SUMMARY_KEY);

            if ($year) {
                Cache::forget($this->getCacheKey($year));
            }
        });
    }

    /**
     * Invalidate all-time cache and multiple specified years' caches.
     *
     * @param array<int|null> $years
     */
    public function invalidateYears(array $years): void
    {
        $cleanYears = array_filter(array_map(fn ($y) => $y ? (int) $y : null, $years));

        $this->executeAfterCommit(function () use ($cleanYears) {
            Cache::forget(self::ALL_TIME_KEY);
            Cache::forget(self::DONATION_SUMMARY_KEY);

            foreach ($cleanYears as $yr) {
                Cache::forget($this->getCacheKey($yr));
            }
        });
    }

    /**
     * Invalidate cache for all known years and all-time.
     */
    public function invalidateAll(): void
    {
        $this->executeAfterCommit(function () {
            Cache::forget(self::ALL_TIME_KEY);
            Cache::forget(self::DONATION_SUMMARY_KEY);

            // Collect all possible cached years
            $years = [];

            // 1. From active tracking set
            $tracked = Cache::get(self::CACHED_YEARS_SET_KEY, []);
            if (is_array($tracked)) {
                $years = array_merge($years, $tracked);
            }

            // 2. Standard recent / current year window
            $currentYear = (int) date('Y');
            for ($y = 2020; $y <= $currentYear + 2; $y++) {
                $years[] = $y;
            }

            // 3. Database distinct years if tables exist
            try {
                $dbYears = JournalEntry::query()
                    ->selectRaw('DISTINCT YEAR(transaction_date) as yr')
                    ->pluck('yr')
                    ->filter()
                    ->map(fn ($y) => (int) $y)
                    ->toArray();
                $years = array_merge($years, $dbYears);
            } catch (\Throwable) {
            }

            try {
                $periodYears = AccountingPeriod::query()
                    ->selectRaw('DISTINCT YEAR(start_date) as yr')
                    ->pluck('yr')
                    ->filter()
                    ->map(fn ($y) => (int) $y)
                    ->toArray();
                $years = array_merge($years, $periodYears);
            } catch (\Throwable) {
            }

            $uniqueYears = array_unique(array_filter($years));
            foreach ($uniqueYears as $yr) {
                Cache::forget($this->getCacheKey((int) $yr));
            }

            // Reset tracked set
            Cache::forget(self::CACHED_YEARS_SET_KEY);
        });
    }

    /**
     * Invalidate cache for a journal entry.
     */
    public function invalidateForJournal(JournalEntry $journal): void
    {
        $years = [];

        if ($journal->transaction_date) {
            $years[] = (int) Carbon::parse($journal->transaction_date)->year;
        }

        if ($journal->isDirty('transaction_date') && $journal->getOriginal('transaction_date')) {
            $years[] = (int) Carbon::parse($journal->getOriginal('transaction_date'))->year;
        }

        $this->invalidateYears($years);
    }

    /**
     * Flag to force immediate execution (useful in testing).
     */
    public static bool $forceImmediate = false;

    /**
     * Execute callback after active DB transaction commits, or immediately if outside transaction.
     */
    protected function executeAfterCommit(callable $callback): void
    {
        if (self::$forceImmediate || (app()->runningUnitTests() && DB::transactionLevel() === 1)) {
            $callback();
            return;
        }

        if (DB::transactionLevel() > 0) {
            DB::afterCommit($callback);
        } else {
            $callback();
        }
    }
}
