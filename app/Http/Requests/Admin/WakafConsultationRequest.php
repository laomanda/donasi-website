<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class WakafConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name'        => ['required', 'string', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'email'       => ['nullable', 'email'],
            'topic'       => ['required', 'string', 'max:255'],
            'message'     => ['required', 'string'],
            'admin_notes' => ['nullable', 'string'],
        ];

        if ($this->isMethod('post')) {
            $rules['status'] = ['nullable', 'in:baru,dibalas,ditutup'];
        }

        return $rules;
    }
}
