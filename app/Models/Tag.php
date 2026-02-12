<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = [
        'name',
        'url',
        'is_active',
        'sort_order',
        'open_in_new_tab',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'open_in_new_tab' => 'boolean',
    ];
}
