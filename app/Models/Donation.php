<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'donation_code',
        'donor_name',
        'donor_email',
        'donor_phone',
        'amount',
        'is_anonymous',
        'payment_source',
        'payment_method',
        'payment_channel',
        'status',
        'midtrans_order_id',
        'midtrans_transaction_id',
        'midtrans_va_numbers',
        'midtrans_raw_response',
        'manual_proof_path',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'amount'                => 'decimal:2',
        'is_anonymous'          => 'boolean',
        'midtrans_va_numbers'   => 'array',
        'midtrans_raw_response' => 'array',
        'paid_at'               => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    // Donasi milik satu Program (nullable)
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES SEDERHANA
    |--------------------------------------------------------------------------
    */

    // Hanya donasi yang sudah paid
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    // Donasi pending (buat list validasi)
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
