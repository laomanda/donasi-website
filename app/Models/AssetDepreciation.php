<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetDepreciation extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'period_id',
        'depreciation_expense',
        'accumulated_depreciation',
        'book_value',
    ];

    protected $casts = [
        'depreciation_expense'     => 'decimal:2',
        'accumulated_depreciation' => 'decimal:2',
        'book_value'               => 'decimal:2',
    ];

    public function asset()
    {
        return $this->belongsTo(WaqfAsset::class, 'asset_id');
    }

    public function period()
    {
        return $this->belongsTo(AccountingPeriod::class, 'period_id');
    }
}
