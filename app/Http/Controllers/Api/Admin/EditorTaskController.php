<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EditorTask\StoreEditorTaskRequest;
use App\Http\Requests\Admin\EditorTask\UpdateEditorTaskRequest;
use App\Http\Resources\EditorTaskResource;
use App\Models\EditorTask;
use App\Models\EditorTaskAttachment;
use App\Models\User;
use App\Support\EditorTaskNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EditorTaskController extends Controller
{
    public function index(Request $request)
    {
        $query = EditorTask::query()
            ->with(['attachments', 'creator:id,name,email', 'assignee:id,name,email']);

        $search = $request->string('q')->trim()->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $status = $request->string('status')->trim()->toString();
        if ($status !== '') {
            $query->where('status', $status);
        }

        $priority = $request->string('priority')->trim()->toString();
        if ($priority !== '') {
            $query->where('priority', $priority);
        }

        $assignedTo = $request->input('assigned_to');
        if ($assignedTo !== null && $assignedTo !== '') {
            $query->where('assigned_to', $assignedTo);
        }

        $tasks = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return EditorTaskResource::collection($tasks);
    }

    public function store(StoreEditorTaskRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()?->id;
        $data['priority'] = $data['priority'] ?? 'normal';
        $data['status'] = $data['status'] ?? 'open';
        
        // Handle defaults for nullable fields if blank string is sent (though validation should handle it)
        if (array_key_exists('assigned_to', $data) && blank($data['assigned_to'])) {
            $data['assigned_to'] = null;
        }
        if (array_key_exists('due_at', $data) && blank($data['due_at'])) {
            $data['due_at'] = null;
        }

        $attachments = $request->file('attachments', []);

        $task = null;
        DB::transaction(function () use ($data, $attachments, $request, &$task) {
            $task = EditorTask::create($data);

            $this->storeAttachments($task, $attachments, $request->user()?->id);
        });

        EditorTaskNotifier::dispatchCountForAllEditors();

        return new EditorTaskResource(
            $task->load(['attachments', 'creator', 'assignee'])
        );
    }

    public function show(EditorTask $editor_task)
    {
        return new EditorTaskResource(
            $editor_task->load(['attachments', 'creator', 'assignee'])
        );
    }

    public function update(UpdateEditorTaskRequest $request, EditorTask $editor_task)
    {
        $data = $request->validated();

        if (array_key_exists('assigned_to', $data) && blank($data['assigned_to'])) {
            $data['assigned_to'] = null;
        }
        if (array_key_exists('due_at', $data) && blank($data['due_at'])) {
            $data['due_at'] = null;
        }

        if (array_key_exists('status', $data) && $data['status'] !== 'cancelled') {
             $data['cancel_reason'] = null;
        }

        $editor_task->update($data);

        $attachments = $request->file('attachments', []);
        if (! empty($attachments)) {
            $this->storeAttachments($editor_task, $attachments, $request->user()?->id);
        }

        EditorTaskNotifier::dispatchCountForAllEditors();

        return new EditorTaskResource(
            $editor_task->refresh()->load(['attachments', 'creator', 'assignee'])
        );
    }

    public function destroy(EditorTask $editor_task)
    {
        if (in_array($editor_task->status, ['in_progress', 'done'], true)) {
            return response()->json([
                'message' => 'Tugas yang dikerjakan atau selesai tidak bisa dihapus.',
            ], 422);
        }

        $editor_task->attachments->each(function (EditorTaskAttachment $attachment) {
            $this->deleteAttachmentFile($attachment);
        });

        $editor_task->delete();

        EditorTaskNotifier::dispatchCountForAllEditors();

        return response()->json([
            'message' => 'Tugas dihapus.',
        ]);
    }

    public function destroyAttachment(EditorTask $editor_task, EditorTaskAttachment $attachment)
    {
        if ($attachment->editor_task_id !== $editor_task->id) {
            return response()->json([
                'message' => 'Lampiran tidak ditemukan.',
            ], 404);
        }

        $this->deleteAttachmentFile($attachment);
        $attachment->delete();

        return response()->json([
            'message' => 'Lampiran dihapus.',
        ]);
    }

    public function editors()
    {
        $editors = User::role('editor')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json($editors);
    }

    private function storeAttachments(EditorTask $task, array $attachments, ?int $userId): void
    {
        if (empty($attachments)) {
            return;
        }

        foreach ($attachments as $file) {
            if (! $file) {
                continue;
            }

            $path = $file->store("editor-tasks/{$task->id}", 'public');

            $task->attachments()->create([
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => $userId,
            ]);
        }
    }

    private function deleteAttachmentFile(EditorTaskAttachment $attachment): void
    {
        if ($attachment->file_path) {
            Storage::disk('public')->delete($attachment->file_path);
        }
    }
}
