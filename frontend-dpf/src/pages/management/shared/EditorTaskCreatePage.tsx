import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type EditorTaskPriority = "low" | "normal" | "high" | string;

type EditorUserOption = {
  id: number;
  name?: string | null;
  email?: string | null;
};

type EditorTaskCreatePageProps = {
  role: "admin" | "superadmin";
};

export function EditorTaskCreatePage({ role }: EditorTaskCreatePageProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const apiBase = role === "superadmin" ? "/superadmin" : "/admin";
  const routeBase = role === "superadmin" ? "/superadmin" : "/admin";

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
  const canSubmit = isFileMode ? hasAttachment && !saving : Boolean(title.trim()) && !saving;

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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
              Tugas Editor
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Buat Tugas Editor</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Isi ringkas, jelas, dan tambahkan lampiran jika diperlukan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`${routeBase}/editor-tasks`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            disabled={saving}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Mode tugas</p>
          <div className="mt-3 inline-flex flex-wrap gap-2 rounded-full bg-white p-1 ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode("manual");
                setAttachments([]);
              }}
              className={[
                "rounded-full px-4 py-2 text-xs font-bold transition",
                mode === "manual" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
              disabled={saving}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("file");
                setAttachments([]);
              }}
              className={[
                "rounded-full px-4 py-2 text-xs font-bold transition",
                mode === "file" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
              disabled={saving}
            >
              File (Word)
            </button>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Manual untuk instruksi lengkap. File hanya menerima lampiran dokumen Word.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {isFileMode ? (
            <label className="block sm:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Lampiran Word</span>
              <input
                type="file"
                accept=".doc,.docx"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setAttachments(files.length ? [files[0]] : []);
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm transition file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
                disabled={saving}
              />
              {attachments.length > 0 ? (
                <p className="mt-2 text-xs font-semibold text-slate-500">{attachments[0]?.name ?? "1 file dipilih."}</p>
              ) : (
                <p className="mt-2 text-xs font-semibold text-slate-500">Hanya 1 file Word.</p>
              )}
            </label>
          ) : (
            <>
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Judul</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Judul tugas..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={saving}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Deskripsi</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Instruksi tugas untuk editor..."
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Prioritas</span>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={saving}
                >
                  <option value="normal">Normal</option>
                  <option value="low">Rendah</option>
                  <option value="high">Tinggi</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Tenggat</span>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Editor</span>
                <select
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                  disabled={saving}
                >
                  <option value="">Semua Editor</option>
                  {editors.map((editor) => (
                    <option key={editor.id} value={editor.id}>
                      {editor.name ?? editor.email ?? `Editor ${editor.id}`}
                    </option>
                  ))}
                </select>
                {loadingEditors ? (
                  <p className="mt-2 text-xs font-semibold text-slate-500">Memuat daftar editor...</p>
                ) : null}
              </label>

            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`${routeBase}/editor-tasks`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            disabled={saving}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void onCreateTask()}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
            {saving ? "Menyimpan..." : "Simpan Tugas"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditorTaskCreatePage;
