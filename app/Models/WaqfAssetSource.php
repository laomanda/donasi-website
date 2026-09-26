<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaqfAssetSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'source_type',
        'amount',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function asset()
    {
        return $this->belongsTo(WaqfAsset::class, 'asset_id');
    }
}
