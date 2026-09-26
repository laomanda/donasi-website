<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'period_id',
        'title',
        'content',
    ];

    public function period()
    {
        return $this->belongsTo(AccountingPeriod::class, 'period_id');
    }
}
