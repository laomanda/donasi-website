<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Allocation extends Model
{
    protected $fillable = [
        'user_id',
        'donation_id',
        'program_id',
        'amount',
        'description',
        'proof_path',
        'allocated_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'allocated_at' => 'date',
    ];

    public static function boot()
    {
        parent::boot();

        static::saved(function (Allocation $allocation) {
            $years = [];
            $date = $allocation->allocation_date ?? $allocation->created_at;
            if ($date) {
                $years[] = (int) \Carbon\Carbon::parse($date)->year;
            }
            if ($allocation->isDirty('allocation_date') && $allocation->getOriginal('allocation_date')) {
                $years[] = (int) \Carbon\Carbon::parse($allocation->getOriginal('allocation_date'))->year;
            }
            app(\App\Services\PublicFinanceCacheService::class)->invalidateYears($years);
        });

        static::deleted(function (Allocation $allocation) {
            $years = [];
            $date = $allocation->allocation_date ?? $allocation->created_at;
            if ($date) {
                $years[] = (int) \Carbon\Carbon::parse($date)->year;
            }
            app(\App\Services\PublicFinanceCacheService::class)->invalidateYears($years);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the associated journal entry.
     */
    public function journalEntry()
    {
        return $this->hasOne(JournalEntry::class, 'reference_id')
            ->where('reference_type', 'allocation');
    }

    /**
     * Check if allocation meets accounting criteria for journaling.
     */
    public function isValidForJournal(): bool
    {
        return app(\App\Services\AllocationJournalService::class)->isAllocationValid($this);
    }
}
