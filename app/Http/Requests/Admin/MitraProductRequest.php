<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class MitraProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('mitra_product')?->id;

        return [
            'slug' => ['nullable', 'string', 'max:255', "unique:mitra_products,slug,{$productId}"],
            'nama_mitra' => ['nullable', 'string', 'max:255'],
            'title_id' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'description_id' => ['required', 'string'],
            'description_en' => ['required', 'string'],
            'whatsapp_number' => ['required', 'string', 'regex:/^\+[1-9]\d{7,14}$/'],
            'status' => ['required', 'in:draft,published,archived'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*.image' => ['required_with:images', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'whatsapp_number.regex' => 'Nomor WhatsApp harus menggunakan format internasional E.164, misalnya +628123456789.',
            'images.max' => 'Produk dapat memiliki maksimal 5 gambar.',
        ];
    }
}
