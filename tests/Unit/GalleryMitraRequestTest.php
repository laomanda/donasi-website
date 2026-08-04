<?php

namespace Tests\Unit;

use App\Http\Requests\Admin\GalleryMitraRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class GalleryMitraRequestTest extends TestCase
{
    public function test_caption_cannot_contain_more_than_three_words(): void
    {
        $request = new GalleryMitraRequest;
        $validator = Validator::make([
            'image' => 'uploads/gallery-mitra/activity.jpg',
            'caption_id' => 'Kegiatan Penyaluran Bantuan Sosial',
            'caption_en' => 'Partner Social Aid',
            'status' => 'published',
        ], $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('caption_id', $validator->errors()->toArray());
    }

    public function test_caption_can_contain_three_words(): void
    {
        $request = new GalleryMitraRequest;
        $validator = Validator::make([
            'image' => 'uploads/gallery-mitra/activity.webp',
            'caption_id' => 'Program Bakti Mitra',
            'caption_en' => 'Partner Service Program',
            'status' => 'draft',
        ], $request->rules());

        $this->assertFalse($validator->fails());
    }
}
