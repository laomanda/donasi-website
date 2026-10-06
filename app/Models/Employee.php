<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employees';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_code',
        'slug',
        'name',
        'position',
        'division',
        'id_card_image',
        'employment_status',
        'display_order',
        'is_published',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_published'  => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'id_card_image_url',
        'public_url',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::deleting(function (Employee $employee) {
            if (!$employee->isForceDeleting() && $employee->display_order !== null) {
                $employee->display_order = null;
                $employee->saveQuietly();
            }
        });
    }

    /**
     * Scope a query to only include published employees.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope a query to only include active employees.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('employment_status', 'active');
    }

    /**
     * Scope a query to only include employees eligible for the public directory.
     * Rule: published + active + not soft deleted.
     */
    public function scopePublicDirectory(Builder $query): Builder
    {
        return $query->published()->active();
    }

    /**
     * Get the publicly accessible ID Card image URL.
     */
    public function getIdCardImageUrlAttribute(): ?string
    {
        if (empty($this->id_card_image)) {
            return null;
        }

        if (filter_var($this->id_card_image, FILTER_VALIDATE_URL)) {
            return $this->id_card_image;
        }

        return Storage::disk('public')->url($this->id_card_image);
    }

    /**
     * Get the public profile URL for QR and web visitors.
     * Computed dynamically without persisting to database.
     */
    public function getPublicUrlAttribute(): string
    {
        $frontendBase = rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url') ?? url('/'))), '/');

        return "{$frontendBase}/karyawan/{$this->slug}";
    }

    /**
     * Get the human-readable Indonesian employment status label.
     */
    public function getEmploymentStatusLabelAttribute(): string
    {
        return $this->employment_status === 'active' ? 'Aktif' : 'Tidak Aktif';
    }

    /**
     * Retrieve the model for a bound value with customized Indonesian 404 message.
     */
    public function resolveRouteBinding($value, $field = null): ?self
    {
        $model = parent::resolveRouteBinding($value, $field);

        if (!$model) {
            abort(response()->json(['message' => 'Karyawan tidak ditemukan.'], 404));
        }

        return $model;
    }
}
