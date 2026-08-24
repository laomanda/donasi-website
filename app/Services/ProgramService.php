<?php

namespace App\Services;

use App\Models\Program;
use Illuminate\Support\Str;

class ProgramService
{
    public function storeProgram(array $data): Program
    {
        $data['slug'] = isset($data['slug']) && !blank($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['title']);
        if (isset($data['slug_en']) && !blank($data['slug_en'])) {
            $data['slug_en'] = Str::slug($data['slug_en']);
        } elseif (isset($data['title_en']) && !blank($data['title_en'])) {
            $data['slug_en'] = Str::slug($data['title_en']);
        } else {
            $data['slug_en'] = null;
        }
        $data['collected_amount'] ??= 0;

        return Program::create($data);
    }

    public function updateProgram(Program $program, array $data): Program
    {
        if (isset($data['slug']) && !blank($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
        } elseif (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        if (array_key_exists('slug_en', $data)) {
            if (!blank($data['slug_en'])) {
                $data['slug_en'] = Str::slug($data['slug_en']);
            } elseif (isset($data['title_en']) && !blank($data['title_en'])) {
                $data['slug_en'] = Str::slug($data['title_en']);
            } else {
                $data['slug_en'] = null;
            }
        }

        $program->update($data);

        return $program->refresh();
    }
    
    public function updateStatus(Program $program, array $data): Program
    {
        $program->update($data);
        return $program->refresh();
    }
    
    public function toggleHighlight(Program $program): Program
    {
        $program->is_highlight = ! $program->is_highlight;
        $program->save();
        return $program;
    }
}
