<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $accounting_period_id
 * @property string $title
 * @property string $category
 * @property string $content
 * @property int $sort_order
 * @property string $status
 * @property int|null $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property-read AccountingPeriod|null $accountingPeriod
 * @property-read AccountingPeriod|null $period
 * @property-read User|null $creator
 */
class FinancialNote extends Model
{
    use HasFactory;

    public const CATEGORY_ACCOUNTING_POLICY = 'accounting_policy';
    public const CATEGORY_ASSET_NOTE         = 'asset_note';
    public const CATEGORY_REVENUE_NOTE       = 'revenue_note';
    public const CATEGORY_EXPENSE_NOTE       = 'expense_note';
    public const CATEGORY_WAQF_NOTE          = 'waqf_note';
    public const CATEGORY_GENERAL_NOTE        = 'general_note';

    public const CATEGORIES = [
        self::CATEGORY_ACCOUNTING_POLICY => 'Kebijakan Akuntansi',
        self::CATEGORY_ASSET_NOTE         => 'Catatan Aset Wakaf & Lancar',
        self::CATEGORY_REVENUE_NOTE       => 'Catatan Penerimaan / Pendapatan',
        self::CATEGORY_EXPENSE_NOTE       => 'Catatan Beban & Penyaluran',
        self::CATEGORY_WAQF_NOTE          => 'Catatan Pengelolaan Wakaf',
        self::CATEGORY_GENERAL_NOTE        => 'Catatan Umum & Lain-Lain',
    ];

    public const STATUS_DRAFT     = 'draft';
    public const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'accounting_period_id',
        'period_id',
        'title',
        'category',
        'content',
        'sort_order',
        'status',
        'created_by',
    ];

    protected $casts = [
        'accounting_period_id' => 'integer',
        'sort_order'           => 'integer',
        'status'               => 'string',
    ];

    /**
     * Mutator to allow period_id attribute seamlessly.
     */
    public function setPeriodIdAttribute($value): void
    {
        $this->attributes['accounting_period_id'] = $value;
    }

    /**
     * Accessor to allow period_id attribute seamlessly.
     */
    public function getPeriodIdAttribute(): ?int
    {
        return $this->accounting_period_id;
    }

    public function accountingPeriod(): BelongsTo
    {
        return $this->belongsTo(AccountingPeriod::class, 'accounting_period_id');
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(AccountingPeriod::class, 'accounting_period_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForPeriod($query, ?int $periodId)
    {
        if ($periodId) {
            return $query->where('accounting_period_id', $periodId);
        }
        return $query;
    }

    public function scopeCategory($query, ?string $category)
    {
        if ($category) {
            return $query->where('category', $category);
        }
        return $query;
    }

    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }
}
