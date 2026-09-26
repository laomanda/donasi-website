<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportError extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'row_number',
        'error_message',
    ];

    protected $casts = [
        'row_number' => 'integer',
    ];

    public function batch()
    {
        return $this->belongsTo(ImportBatch::class, 'batch_id');
    }
}
