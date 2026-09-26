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
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

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
        return $this->hasMany(FinancialNote::class, 'period_id');
    }
}
