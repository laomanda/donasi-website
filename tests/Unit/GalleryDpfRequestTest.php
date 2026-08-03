<?php

namespace Tests\Unit;

use App\Http\Requests\Admin\GalleryDpfRequest;
use Tests\TestCase;

class GalleryDpfRequestTest extends TestCase
{
    public function test_caption_cannot_contain_more_than_three_words(): void
    {
        $request = new GalleryDpfRequest;
        $request->setMethod('POST');

        $validator = app('validator')->make([
            'image' => 'uploads/gallery-dpf/activity.jpg',
            'caption_id' => 'Satu dua tiga empat',
            'caption_en' => 'One two',
            'status' => 'draft',
        ], $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('caption_id', $validator->errors()->toArray());
    }

    public function test_three_word_captions_are_valid(): void
    {
        $request = new GalleryDpfRequest;
        $request->setMethod('POST');

        $validator = app('validator')->make([
            'image' => 'uploads/gallery-dpf/activity.jpg',
            'caption_id' => 'Berbagi Paket Ramadan',
            'caption_en' => 'Sharing Ramadan Packages',
            'status' => 'published',
        ], $request->rules());

        $this->assertFalse($validator->fails());
    }
}
