<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZiswafConsultation extends Model
{
    use HasFactory;

    protected $table = 'ziswaf_consultations';

    protected $fillable = [
        'name',
        'phone',
        'email',
        'topic',
        'message',
        'status',
        'admin_notes',
    ];

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeBaru($query)
    {
        return $query->where('status', 'baru');
    }

    public function scopeDibalas($query)
    {
        return $query->where('status', 'dibalas');
    }
}
