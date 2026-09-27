<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntryLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_entry_id',
        'account_id',
        'debit',
        'credit',
        'description',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::updating(function (JournalEntryLine $line) {
            $journal = $line->journalEntry;
            if ($journal && $journal->status === 'posted') {
                throw new \DomainException('Posted journal is immutable');
            }
        });

        static::deleting(function (JournalEntryLine $line) {
            $journal = $line->journalEntry;
            if ($journal && $journal->status === 'posted') {
                throw new \DomainException('Posted journal is immutable');
            }
        });
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class, 'journal_entry_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
}
