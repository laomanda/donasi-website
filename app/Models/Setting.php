<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    /*
    |--------------------------------------------------------------------------
    | HELPER STATIC
    |--------------------------------------------------------------------------
    | Biar nanti di controller/service tinggal:
    | Setting::getValue('site_name');
    | Setting::setValue('site_name', 'DPF ZISWAF');
    |--------------------------------------------------------------------------
    */

    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        return $setting ? $setting->value : $default;
    }

    public static function setValue(string $key, $value): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}
