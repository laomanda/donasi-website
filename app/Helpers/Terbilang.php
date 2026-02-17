<?php

namespace App\Helpers;

class Terbilang
{
    public static function make($value)
    {
        $value = abs($value);
        $huruf = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
        $temp = "";

        if ($value < 12) {
            $temp = " " . $huruf[$value];
        } else if ($value < 20) {
            $temp = self::make($value - 10) . " belas";
        } else if ($value < 100) {
            $temp = self::make($value / 10) . " puluh" . self::make($value % 10);
        } else if ($value < 200) {
            $temp = " seratus" . self::make($value - 100);
        } else if ($value < 1000) {
            $temp = self::make($value / 100) . " ratus" . self::make($value % 100);
        } else if ($value < 2000) {
            $temp = " seribu" . self::make($value - 1000);
        } else if ($value < 1000000) {
            $temp = self::make($value / 1000) . " ribu" . self::make($value % 1000);
        } else if ($value < 1000000000) {
            $temp = self::make($value / 1000000) . " juta" . self::make($value % 1000000);
        } else if ($value < 1000000000000) {
            $temp = self::make($value / 1000000000) . " milyar" . self::make(fmod($value, 1000000000));
        } else if ($value < 1000000000000000) {
            $temp = self::make($value / 1000000000000) . " trilyun" . self::make(fmod($value, 1000000000000));
        }

        return ucwords(trim($temp));
    }
}
