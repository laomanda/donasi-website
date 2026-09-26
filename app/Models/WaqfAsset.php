<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $asset_code
 * @property string $asset_name
 * @property int $category_id
 * @property int|null $wakif_id
 * @property \Illuminate\Support\Carbon|null $acquisition_date
 * @property float $quantity
 * @property int $useful_life_month
 * @property float $acquisition_value
 * @property float $current_value
 * @property string|null $location
 * @property string $condition
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class WaqfAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_code',
        'asset_name',
        'category_id',
        'wakif_id',
        'acquisition_date',
        'quantity',
        'useful_life_month',
        'acquisition_value',
        'current_value',
        'location',
        'condition',
        'status',
    ];

    protected $casts = [
        'acquisition_date'  => 'date',
        'quantity'          => 'decimal:2',
        'useful_life_month' => 'integer',
        'acquisition_value' => 'decimal:2',
        'current_value'     => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(WaqfAssetCategory::class, 'category_id');
    }

    public function wakif()
    {
        return $this->belongsTo(Wakif::class, 'wakif_id');
    }

    public function sources()
    {
        return $this->hasMany(WaqfAssetSource::class, 'asset_id');
    }

    public function depreciations()
    {
        return $this->hasMany(AssetDepreciation::class, 'asset_id');
    }
}
