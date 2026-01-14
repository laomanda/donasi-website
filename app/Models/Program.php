<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_en',
        'slug',
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
    ];

    // Pastikan slug unik otomatis jika belum ada
    public static function boot()
    {
        parent::boot();

        static::creating(function ($program) {
            if (empty($program->slug) && ! empty($program->title)) {
                $program->slug = Str::slug($program->title);
            }
        });

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

    /*
    |--------------------------------------------------------------------------
    | SCOPES SEDERHANA
    |--------------------------------------------------------------------------
    */

    // Hanya program yang aktif
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Program yang ditandai highlight
    public function scopeHighlight($query)
    {
        return $query->where('is_highlight', true);
    }
}
