<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_name',
        'module',
        'status',
        'imported_by',
    ];

    public function importer()
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function errors()
    {
        return $this->hasMany(ImportError::class, 'batch_id');
    }
}
