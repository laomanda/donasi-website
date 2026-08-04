<?php

namespace Tests\Unit;

use App\Http\Requests\Admin\MitraProductRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class MitraProductRequestTest extends TestCase
{
    public function test_it_requires_an_e164_whatsapp_number(): void
    {
        $validator = Validator::make($this->validData(['whatsapp_number' => '08123456789']), (new MitraProductRequest)->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('whatsapp_number', $validator->errors()->toArray());
    }

    public function test_it_limits_products_to_five_images(): void
    {
        $images = collect(range(1, 6))->map(fn ($number) => ['image' => "uploads/mitra-products/{$number}.jpg"])->all();
        $validator = Validator::make($this->validData(['images' => $images]), (new MitraProductRequest)->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('images', $validator->errors()->toArray());
    }

    private function validData(array $overrides = []): array
    {
        return array_merge([
            'title_id' => 'Kopi Arabika DPF',
            'title_en' => 'DPF Arabica Coffee',
            'description_id' => 'Deskripsi produk.',
            'description_en' => 'Product description.',
            'whatsapp_number' => '+628123456789',
            'status' => 'draft',
            'images' => [],
        ], $overrides);
    }
}
