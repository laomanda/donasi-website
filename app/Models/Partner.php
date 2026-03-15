<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_en',
        'logo_path',
        'url',
        'description',
        'description_en',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order'     => 'integer',
    ];

    protected static function booted()
    {
        static::saved(function ($partner) {
            \Illuminate\Support\Facades\Cache::forget('frontend.home');
        });

        static::deleted(function ($partner) {
            \Illuminate\Support\Facades\Cache::forget('frontend.home');
        });
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('order');
    }
}
