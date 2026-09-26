<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
