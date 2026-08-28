<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @method bool|null delete()
 */
class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_en',
        'slug',
        'slug_en',
        'category',
        'category_en',
        'short_description',
        'short_description_en',
        'description',
        'description_en',
        'benefits',
        'benefits_en',
        'target_amount',
        'collected_amount',
        'thumbnail_path',
        'banner_path',
        'program_images',
        'is_highlight',
        'status',
        'deadline_days',
        'published_at',
    ];

    protected $casts = [
        'target_amount'    => 'decimal:2',
        'collected_amount' => 'decimal:2',
        'is_highlight'     => 'boolean',
        'deadline_days'    => 'integer',
        'published_at'     => 'date',
        'program_images'   => 'array',
    ];

    // Pastikan slug unik otomatis jika belum ada
    public static function boot()
    {
        parent::boot();

        static::creating(function ($program) {
            if (empty($program->slug) && ! empty($program->title)) {
                $program->slug = Str::slug($program->title);
            }
            if (empty($program->slug_en) && ! empty($program->title_en)) {
                $program->slug_en = Str::slug($program->title_en);
            }
        });

        static::updating(function ($program) {
            if (empty($program->slug) && ! empty($program->title)) {
                $program->slug = Str::slug($program->title);
            }
            if (empty($program->slug_en) && ! empty($program->title_en)) {
                $program->slug_en = Str::slug($program->title_en);
            }
        });

        static::saved(function ($program) {
            self::clearProgramsCache($program);
        });

        static::deleted(function ($program) {
            self::clearProgramsCache($program);
        });
    }

    public static function clearProgramsCache(?Program $program = null)
    {
        try {
            \Illuminate\Support\Facades\Cache::flush();
        } catch (\Throwable $e) {
            // ignore
        }
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    // 1 Program punya banyak Donasi (1-to-many)
    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function savedByUsers()
    {
        return $this->morphMany(SavedItem::class, 'saveable');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES SEDERHANA
    |--------------------------------------------------------------------------
    */

    // Hanya program yang aktif
    public function scopeActive(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', '=', 'active');
    }

    // Program yang ditandai highlight
    public function scopeHighlight(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_highlight', '=', true);
    }
}
