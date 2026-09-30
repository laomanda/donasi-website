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
 * @property string|null $economic_use
 * @property float|null $productive_percentage
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\WaqfAssetCategory|null $category
 * @property-read \App\Models\Wakif|null $wakif
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\WaqfAssetSource> $sources
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AssetDepreciation> $depreciations
 * @method \Illuminate\Database\Eloquent\Relations\HasMany depreciations()
 * @method \Illuminate\Database\Eloquent\Relations\HasMany sources()
 * @method \Illuminate\Database\Eloquent\Relations\BelongsTo category()
 * @method \Illuminate\Database\Eloquent\Relations\BelongsTo wakif()
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
        'economic_use',
        'productive_percentage',
    ];

    protected $casts = [
        'acquisition_date'      => 'date',
        'quantity'              => 'decimal:2',
        'useful_life_month'     => 'integer',
        'acquisition_value'     => 'decimal:2',
        'current_value'         => 'decimal:2',
        'productive_percentage' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::saved(function (WaqfAsset $asset) {
            app(\App\Services\PublicFinanceCacheService::class)->invalidateAll();
        });

        static::deleted(function (WaqfAsset $asset) {
            app(\App\Services\PublicFinanceCacheService::class)->invalidateAll();
        });
    }

    /**
     * Validation rules for waqf asset creation/updating.
     */
    public static function validationRules(array $data = [], bool $isUpdate = false): array
    {
        return [
            'economic_use'          => [$isUpdate ? 'sometimes' : 'required', 'string', 'in:productive,social,mixed'],
            'productive_percentage' => [
                'nullable',
                'numeric',
                'required_if:economic_use,mixed',
                function ($attribute, $value, $fail) use ($data) {
                    $economicUse = $data['economic_use'] ?? request()->input('economic_use');
                    if ($economicUse === 'mixed') {
                        $val = (float) $value;
                        if ($val <= 0 || $val >= 100) {
                            $fail('Persentase produktif untuk aset campuran harus antara 0.01% dan 99.99%.');
                        }
                    }
                },
            ],
        ];
    }

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
