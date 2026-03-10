<?php

namespace App\Services;

use App\Models\Program;
use Illuminate\Support\Str;

class ProgramService
{
    public function storeProgram(array $data): Program
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['collected_amount'] ??= 0;

        return Program::create($data);
    }

    public function updateProgram(Program $program, array $data): Program
    {
        if (blank($data['slug'] ?? null) && isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
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
