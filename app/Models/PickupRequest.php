<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PickupRequest extends Model
{
    use HasFactory;

    protected $table = 'pickup_requests';

    protected $fillable = [
        'donor_name',
        'donor_phone',
        'address_full',
        'city',
        'district',
        'zakat_type',
        'estimation',
        'preferred_time',
        'status',
        'assigned_officer',
        'notes',
    ];

    protected $casts = [
        // kalau nanti format waktu diganti datetime, tinggal ubah casts di sini
    ];

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    // Permintaan baru
    public function scopeBaru($query)
    {
        return $query->where('status', 'baru');
    }
}
