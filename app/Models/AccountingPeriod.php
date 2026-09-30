<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property string $status
 * @property bool $is_closed
 * @property \Illuminate\Support\Carbon|null $closed_at
 * @property int|null $closed_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class AccountingPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'status',
        'is_closed',
        'closed_at',
        'closed_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_closed' => 'boolean',
        'closed_at' => 'datetime',
    ];

    protected $appends = [
        'period_name',
    ];

    protected static function booted(): void
    {
        static::saving(function (AccountingPeriod $period) {
            // Enforce canonical state consistency before writing to DB
            if ($period->is_closed || strtolower((string) ($period->attributes['status'] ?? '')) === 'closed') {
                $period->attributes['is_closed'] = 1;
                $period->attributes['status'] = 'closed';
            } else {
                $period->attributes['is_closed'] = 0;
                $period->attributes['status'] = 'open';
            }
        });

        static::saved(function (AccountingPeriod $period) {
            $years = [];
            if ($period->start_date) {
                $years[] = (int) \Carbon\Carbon::parse($period->start_date)->year;
            }
            if ($period->end_date) {
                $years[] = (int) \Carbon\Carbon::parse($period->end_date)->year;
            }
            app(\App\Services\PublicFinanceCacheService::class)->invalidateYears(array_unique($years));
        });
    }

    public function getPeriodNameAttribute(): string
    {
        return (string) ($this->attributes['name'] ?? '');
    }

    public function setPeriodNameAttribute($value): void
    {
        $this->attributes['name'] = $value;
    }

    public function getPeriodTypeAttribute(): string
    {
        return 'yearly';
    }

    public function getStatusAttribute(): string
    {
        if (! empty($this->attributes['is_closed'])) {
            return 'closed';
        }

        return strtolower((string) ($this->attributes['status'] ?? 'open'));
    }

    public function getIsClosedAttribute(): bool
    {
        return ! empty($this->attributes['is_closed']) || strtolower((string) ($this->attributes['status'] ?? '')) === 'closed';
    }

    public function setIsClosedAttribute($value): void
    {
        $closed = (bool) $value;
        $this->attributes['is_closed'] = $closed ? 1 : 0;
        $this->attributes['status'] = $closed ? 'closed' : 'open';
    }

    public function setStatusAttribute($value): void
    {
        $status = strtolower((string) $value);
        $closed = ($status === 'closed');
        $this->attributes['status'] = $closed ? 'closed' : 'open';
        $this->attributes['is_closed'] = $closed ? 1 : 0;
    }

    public function isOpen(): bool
    {
        return ! $this->is_closed && $this->status === 'open';
    }

    public function isClosed(): bool
    {
        return $this->is_closed || $this->status === 'closed';
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class, 'accounting_period_id');
    }

    public function assetDepreciations()
    {
        return $this->hasMany(AssetDepreciation::class, 'period_id');
    }

    public function financialNotes()
    {
        return $this->hasMany(FinancialNote::class, 'accounting_period_id');
    }
}
