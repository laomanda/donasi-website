<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MitraProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'nama_mitra',
        'title_id',
        'title_en',
        'description_id',
        'description_en',
        'whatsapp_number',
        'status',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id')->orderBy('sort_order');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
