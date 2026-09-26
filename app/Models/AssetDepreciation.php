<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $asset_id
 * @property int $period_id
 * @property float $depreciation_expense
 * @property float $accumulated_depreciation
 * @property float $book_value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
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
