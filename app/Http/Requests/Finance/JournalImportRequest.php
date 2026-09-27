<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class JournalImportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->routeIs('*preview*')) {
            return [
                'file' => [
                    'required',
                    'file',
                    'mimes:xlsx,xls',
                    'max:15360', // 15MB
                ],
            ];
        }

        return [
            'batch_token' => ['nullable', 'string'],
            'file'        => ['nullable', 'file', 'mimes:xlsx,xls', 'max:15360'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'File Excel wajib diunggah.',
            'file.mimes'    => 'Format file harus berupa Excel (.xlsx atau .xls).',
            'file.max'      => 'Ukuran file tidak boleh melebihi 15 MB.',
        ];
    }
}
