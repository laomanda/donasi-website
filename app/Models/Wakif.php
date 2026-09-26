<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wakif extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'type',
    ];

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function waqfAssets()
    {
        return $this->hasMany(WaqfAsset::class);
    }
}
