<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $accounting_period_id
 * @property string $journal_number
 * @property \Illuminate\Support\Carbon|null $transaction_date
 * @property string|null $reference_type
 * @property int|null $reference_id
 * @property int|null $program_id
 * @property string|null $description
 * @property string $status
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'accounting_period_id',
        'journal_number',
        'transaction_date',
        'reference_type',
        'reference_id',
        'program_id',
        'description',
        'status',
        'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date',
    ];

    public function accountingPeriod()
    {
        return $this->belongsTo(AccountingPeriod::class, 'accounting_period_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lines()
    {
        return $this->hasMany(JournalEntryLine::class, 'journal_entry_id');
    }

    public function getTotalDebitAttribute(): float
    {
        return (float) $this->lines->sum('debit');
    }

    public function getTotalCreditAttribute(): float
    {
        return (float) $this->lines->sum('credit');
    }

    public function getIsBalancedAttribute(): bool
    {
        return abs($this->total_debit - $this->total_credit) < 0.001;
    }
}
