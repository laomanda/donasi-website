<?php

namespace App\Http\Controllers\Api\Editor;

use App\Http\Controllers\Controller;
use App\Models\EditorTask;
use App\Support\EditorTaskNotifier;
use Illuminate\Http\Request;

class EditorTaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = EditorTask::query()
            ->with(['attachments', 'creator:id,name,email', 'assignee:id,name,email'])
            ->where(function ($q) use ($user) {
                $q->whereNull('assigned_to')
                    ->orWhere('assigned_to', $user->id);
            });

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        $tasks = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10));

        return response()->json($tasks);
    }

    public function show(Request $request, EditorTask $editor_task)
    {
        if (! $this->canAccess($request, $editor_task)) {
            return response()->json([
                'message' => 'Akses ditolak.',
            ], 403);
        }

        return response()->json($editor_task->load(['attachments', 'creator:id,name,email', 'assignee:id,name,email']));
    }

    public function update(Request $request, EditorTask $editor_task)
    {
        if (! $this->canAccess($request, $editor_task)) {
            return response()->json([
                'message' => 'Akses ditolak.',
            ], 403);
        }

        $data = $request->validate([
            'status' => ['required', 'in:open,in_progress,done'],
        ]);

        $editor_task->update($data);

        EditorTaskNotifier::dispatchCountForAllEditors();

        return response()->json($editor_task->refresh()->load(['attachments', 'creator:id,name,email', 'assignee:id,name,email']));
    }

    private function canAccess(Request $request, EditorTask $task): bool
    {
        $userId = $request->user()?->id;

        return $userId !== null && ($task->assigned_to === null || (int) $task->assigned_to === (int) $userId);
    }
}
