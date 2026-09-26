<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
