<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $programId = $this->route('program') ? $this->route('program')->id : null;
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');
        $required = $isUpdate ? 'sometimes' : 'required';

        return [
            'title'             => [$required, 'string', 'max:255'],
            'title_en'          => ['nullable', 'string', 'max:255'],
            'slug'              => ['nullable', 'string', 'max:255', "unique:programs,slug,{$programId}"],
            'category'          => [$required, 'string', 'max:100'],
            'category_en'       => ['nullable', 'string', 'max:100'],
            'short_description' => [$required, 'string'],
            'short_description_en' => ['nullable', 'string'],
            'description'       => [$required, 'string'],
            'description_en'    => ['nullable', 'string'],
            'benefits'          => ['nullable', 'string'],
            'benefits_en'       => ['nullable', 'string'],
            'target_amount'     => [$required, 'numeric', 'min:0'],
            'collected_amount'  => ['nullable', 'numeric', 'min:0'],
            'thumbnail_path'    => ['nullable', 'string', 'max:255'],
            'banner_path'       => ['nullable', 'string', 'max:255'],
            'program_images'    => ['nullable', 'array', 'max:3'],
            'program_images.*'  => ['string', 'max:255'],
            'is_highlight'      => ['sometimes', 'boolean'],
            'status'            => [$required, 'in:draft,active,completed'],
            'deadline_days'     => ['nullable', 'integer', 'min:0'],
            'published_at'      => ['nullable', 'date'],
        ];
    }

    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);

        if (array_key_exists('program_images', $data) && is_array($data['program_images'])) {
            $images = collect($data['program_images'])
                ->map(fn ($value) => trim((string) $value))
                ->filter()
                ->values()
                ->take(3)
                ->all();
            $data['program_images'] = $images ?: null;
        }

        return $data;
    }
}
