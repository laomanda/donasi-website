<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GalleryMitraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string', 'max:255'],
            'caption_id' => ['required', 'string', 'max:255', $this->maximumWordCountRule()],
            'caption_en' => ['required', 'string', 'max:255', $this->maximumWordCountRule()],
            'status' => ['required', 'in:draft,published,archived'],
        ];
    }

    private function maximumWordCountRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            $words = preg_split('/[\s\p{Z}]+/u', trim((string) $value), -1, PREG_SPLIT_NO_EMPTY) ?: [];

            if (count($words) > 3) {
                $fail("{$attribute} may not contain more than 3 words.");
            }
        };
    }
}
