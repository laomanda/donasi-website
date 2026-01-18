<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);
        $data['created_by'] = $request->user()?->id;
        $data['priority'] = $data['priority'] ?? 'normal';
        $data['status'] = $data['status'] ?? 'open';
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

        return response()->json($task->load(['attachments', 'creator:id,name,email', 'assignee:id,name,email']), 201);
    }

    public function show(EditorTask $editor_task)
    {
        return response()->json($editor_task->load(['attachments', 'creator:id,name,email', 'assignee:id,name,email']));
    }

    public function update(Request $request, EditorTask $editor_task)
    {
        $data = $this->validatePayload($request, true);

        if (array_key_exists('assigned_to', $data) && blank($data['assigned_to'])) {
            $data['assigned_to'] = null;
        }
        if (array_key_exists('due_at', $data) && blank($data['due_at'])) {
            $data['due_at'] = null;
        }

        $editor_task->update($data);

        $attachments = $request->file('attachments', []);
        if (! empty($attachments)) {
            $this->storeAttachments($editor_task, $attachments, $request->user()?->id);
        }

        EditorTaskNotifier::dispatchCountForAllEditors();

        return response()->json($editor_task->refresh()->load(['attachments', 'creator:id,name,email', 'assignee:id,name,email']));
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

    private function validatePayload(Request $request, bool $isUpdate = false): array
    {
        $required = $isUpdate ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$required, 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'in:low,normal,high'],
            'status' => ['nullable', 'in:open,in_progress,done,cancelled'],
            'due_at' => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,zip'],
        ]);
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
