<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePickupStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'           => ['required', 'in:baru,dijadwalkan,selesai,dibatalkan'],
            'assigned_officer' => ['nullable', 'string', 'max:255'],
            'notes'            => ['nullable', 'string'],
        ];
    }
}
