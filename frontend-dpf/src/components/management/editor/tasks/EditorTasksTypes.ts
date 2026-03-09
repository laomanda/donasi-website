export type EditorTaskItem = {
    id: number;
    title?: string | null;
    description?: string | null;
    status?: string | null;
    cancel_reason?: string | null;
    priority?: string | null;
    due_at?: string | null;
    created_at?: string | null;
    attachments?: { id: number; original_name?: string | null; url?: string | null }[] | null;
    creator?: { id?: number; name?: string | null; email?: string | null } | null;
    assignee?: { id?: number; name?: string | null; email?: string | null } | null;
};

export type EditorTaskPayload = {
    data: EditorTaskItem[];
    current_page?: number;
    per_page?: number;
    last_page?: number;
    total?: number;
};

export const statusOptions = [
    { value: "open", label: "Baru" },
    { value: "in_progress", label: "Dikerjakan" },
    { value: "done", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
];

export const priorityOptions = [
    { value: "high", label: "Tinggi" },
    { value: "normal", label: "Normal" },
    { value: "low", label: "Rendah" },
];
