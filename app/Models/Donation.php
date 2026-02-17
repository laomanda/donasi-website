<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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

    public function user()
    {
        return $this->belongsTo(User::class);
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

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    protected static $donorStatsCache = [];

    public function getDonorQualificationAttribute(): string
    {
        // Kualifikasi hanya berdasarkan Nomor Telepon
        // Jika tidak ada nomor telepon, dianggap Anonim (meskipun ada email)
        $key = $this->donor_phone;

        if (! $key) {
            return 'Anonim';
        }

        if (! isset(self::$donorStatsCache[$key])) {
            // Hitung donasi sukses berdasarkan nomor telepon yang sama
            $count = self::where('status', 'paid')
                ->where('donor_phone', $key)
                ->count();
            
            self::$donorStatsCache[$key] = $count;
        }

        $count = self::$donorStatsCache[$key];

        if ($count <= 1) {
            return 'Donatur Baru';
        } elseif ($count > 5) {
            return 'Donatur Lama';
        }

        return 'Donatur Tetap';
    }

    public static function clearDonorStatsCache()
    {
        self::$donorStatsCache = [];
    }
}
