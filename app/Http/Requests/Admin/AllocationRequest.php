<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id'   => ['nullable', 'exists:programs,id'],
            'user_id'      => ['nullable', 'exists:users,id'],
            'donation_id'  => ['nullable', 'exists:donations,id'],
            'amount'       => ['required', 'numeric', 'min:1'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'proof'        => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
            'allocated_at' => ['nullable', 'date'],
        ];
    }
}
