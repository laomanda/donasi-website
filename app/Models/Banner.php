<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'image_path',
        'display_order',
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];

    protected static function booted()
    {
        static::saved(function ($banner) {
            self::clearBannersCache();
        });

        static::deleted(function ($banner) {
            self::clearBannersCache();
        });
    }

    private static function clearBannersCache()
    {
        \Illuminate\Support\Facades\Cache::forget('frontend.banners');
        \Illuminate\Support\Facades\Cache::forget('frontend.home');
    }
}
