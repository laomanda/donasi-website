<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDonationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'  => ['required', 'in:pending,paid,failed,expired,cancelled'],
            'paid_at' => ['nullable', 'date'],
            'notes'   => ['nullable', 'string'],
        ];
    }
}
