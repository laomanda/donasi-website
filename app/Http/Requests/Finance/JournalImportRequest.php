<?php

namespace App\Http\Requests\Finance;

use App\Rules\FinanceExcelFileRule;
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
                    'bail',
                    'required',
                    'file',
                    'max:15360', // 15MB
                    new FinanceExcelFileRule(),
                ],
            ];
        }

        return [
            'batch_token' => ['nullable', 'string'],
            'file'        => ['bail', 'nullable', 'file', 'max:15360', new FinanceExcelFileRule()],
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
            'file.max'      => 'Ukuran file melebihi batas maksimum 15 MB.',
        ];
    }
}
