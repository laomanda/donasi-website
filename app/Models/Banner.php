<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'media_type',
        'image_path',
        'video_path',
        'video_duration',
        'display_order',
        'status',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'video_duration' => 'integer',
    ];

    protected $appends = [
        'image_url',
        'video_url',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) return null;
        if (\Illuminate\Support\Str::startsWith($this->image_path, ['http://', 'https://'])) {
            return $this->image_path;
        }
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->image_path);
    }

    public function getVideoUrlAttribute(): ?string
    {
        if (!$this->video_path) return null;
        if (\Illuminate\Support\Str::startsWith($this->video_path, ['http://', 'https://'])) {
            return $this->video_path;
        }
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->video_path);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

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
