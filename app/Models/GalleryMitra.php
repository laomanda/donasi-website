<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GalleryMitra extends Model
{
    use HasFactory;

    protected $table = 'gallery_mitra';

    protected $fillable = [
        'image',
        'caption_id',
        'caption_en',
        'status',
    ];

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
