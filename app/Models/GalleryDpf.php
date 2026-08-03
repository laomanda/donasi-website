<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GalleryDpf extends Model
{
    use HasFactory;

    protected $table = 'gallery_dpf';

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
