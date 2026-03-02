<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizationMember extends Model
{
    use HasFactory;

    protected $table = 'organization_members';

    protected $fillable = [
        'name',
        'position_title',
        'position_title_en',
        'group',
        'group_en',
        'photo_path',
        'email',
        'phone',
        'show_contact',
        'order',
        'is_active',
    ];

    protected $casts = [
        'show_contact' => 'boolean',
        'is_active'    => 'boolean',
        'order'        => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('group')->orderBy('order');
    }
}
