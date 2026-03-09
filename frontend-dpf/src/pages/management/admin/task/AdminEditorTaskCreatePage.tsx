import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";

// Modular Components
import AdminTaskHeader from "@/components/management/admin/tasks/AdminTaskHeader";
import AdminTaskForm from "@/components/management/admin/tasks/AdminTaskForm";

// Utilities
import type { EditorTaskPriority } from "@/utils/management/adminTaskUtils";

interface EditorUserOption {
  id: number;
  name?: string | null;
  email?: string | null;
}

export function AdminEditorTaskCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const apiBase = "/admin";
  const routeBase = "/admin";

  const [editors, setEditors] = useState<EditorUserOption[]>([]);
  const [loadingEditors, setLoadingEditors] = useState(true);

  const [mode, setMode] = useState<"manual" | "file">("manual");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<EditorTaskPriority>("normal");
  const [dueAt, setDueAt] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const isFileMode = mode === "file";
  const hasAttachment = attachments.length > 0;

  useEffect(() => {
    let active = true;
    setLoadingEditors(true);
    http
      .get<EditorUserOption[]>(`${apiBase}/editor-tasks/editors`)
      .then((res) => {
        if (!active) return;
        setEditors(res.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setEditors([]);
      })
      .finally(() => {
        if (!active) return;
        setLoadingEditors(false);
      });

    return () => {
      active = false;
    };
  }, [apiBase]);

  const buildFileTitle = (file?: File) => {
    if (!file) return "Tugas File";
    const rawName = String(file.name ?? "").trim();
    const baseName = rawName.replace(/\.[^/.]+$/, "").trim();
    const candidate = baseName || "Tugas File";
    return candidate.length > 180 ? candidate.slice(0, 180) : candidate;
  };

  const onCreateTask = async () => {
    if (isFileMode) {
      if (!hasAttachment) {
        toast.error("Lampiran wajib diisi.", { title: "Validasi" });
        return;
      }
    } else if (!title.trim()) {
      toast.error("Judul tugas wajib diisi.", { title: "Validasi" });
      return;
    }

    const formData = new FormData();
    if (isFileMode) {
      formData.append("title", buildFileTitle(attachments[0]));
    } else {
      formData.append("title", title.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (priority) {
        formData.append("priority", priority);
      }
      if (dueAt) {
        formData.append("due_at", dueAt);
      }
      if (assignedTo) {
        formData.append("assigned_to", assignedTo);
      }
    }
    attachments.forEach((file) => {
      formData.append("attachments[]", file);
    });

    setSaving(true);
    try {
      await http.post(`${apiBase}/editor-tasks`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Tugas berhasil dibuat.", { title: "Berhasil" });
      navigate(`${routeBase}/editor-tasks`, { replace: true });
    } catch {
      toast.error("Gagal membuat tugas.", { title: "Error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-in space-y-8 pb-10">
      <AdminTaskHeader onAddClick={() => {}} />

      <AdminTaskForm
        mode={mode}
        setMode={setMode}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        priority={priority}
        setPriority={setPriority}
        dueAt={dueAt}
        setDueAt={setDueAt}
        assignedTo={assignedTo}
        setAssignedTo={setAssignedTo}
        attachments={attachments}
        setAttachments={setAttachments}
        saving={saving}
        onSubmit={() => void onCreateTask()}
        onCancel={() => navigate(`${routeBase}/editor-tasks`)}
        editors={editors}
        loadingEditors={loadingEditors}
      />
    </div>
  );
}

export default AdminEditorTaskCreatePage;
