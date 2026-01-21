<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $table = 'bank_accounts';

    protected $fillable = [
        'bank_name',
        'account_number',
        'account_name',
        'is_visible_public',
        'order',
        'image_path',
        'category',
        'type',
    ];

    protected $casts = [
        'is_visible_public' => 'boolean',
        'order'             => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeVisible($query)
    {
        return $query->where('is_visible_public', true)->orderBy('order');
    }
}
