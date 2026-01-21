import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFloppyDisk,
  faKeyboard,
  faFileWord,
  faHeading,
  faAlignLeft,
  faFlag,
  faCalendarDays,
  faUserCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
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
    <div className="mx-auto w-full max-w-5xl animate-fade-in space-y-8 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  Buat Tugas Baru
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl text-shadow-sm">
                  Penugasan Editor
                </h1>
                <p className="mt-2 max-w-xl text-lg font-medium text-emerald-100/90">
                  Buat instruksi tugas secara manual atau cukup unggah file dokumen untuk diproses oleh editor.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`${routeBase}/editor-tasks`)}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">

        {/* Mode Switcher */}
        <div className="mb-8 flex flex-col items-center justify-center gap-4">
          <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode("manual");
                setAttachments([]);
              }}
              className={`relative flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${mode === "manual"
                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
            >
              <FontAwesomeIcon icon={faKeyboard} />
              Input Manual
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("file");
                setAttachments([]);
              }}
              className={`relative flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${mode === "file"
                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
            >
              <FontAwesomeIcon icon={faFileWord} />
              Upload File Word
            </button>
          </div>
          <p className="text-center text-xs font-medium text-slate-500">
            {mode === "manual" ? "Tulis judul dan deskripsi tugas secara lengkap di form ini." : "Judul tugas akan diambil otomatis dari nama file Word yang diunggah."}
          </p>
        </div>

        <div className="grid gap-8">
          {isFileMode ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/30 group">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".doc,.docx,.pdf"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setAttachments(files.length ? [files[0]] : []);
                }}
              />
              <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md text-emerald-600 transition group-hover:scale-110 group-hover:shadow-lg">
                  <FontAwesomeIcon icon={faUpload} className="text-3xl" />
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-lg font-bold text-slate-800">
                    {hasAttachment ? "File Terpilih" : "Klik untuk Upload File"}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    {hasAttachment ? attachments[0].name : "Format yang didukung: DOCX, DOC"}
                  </p>
                </div>
                {hasAttachment && (
                  <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                    <FontAwesomeIcon icon={faFileWord} />
                    {attachments[0].name}
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHeading} className="text-slate-400" />
                    Judul Tugas
                  </label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Contoh: Artikel Manfaat Sedekah..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faAlignLeft} className="text-slate-400" />
                    Deskripsi / Instruksi
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Tuliskan instruksi detail untuk editor di sini..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition resize-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFlag} className="text-slate-400" />
                    Prioritas
                  </label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    >
                      <option value="low">Rendah</option>
                      <option value="normal">Normal</option>
                      <option value="high">Tinggi</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400" />
                    Tenggat Waktu
                  </label>
                  <input
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserCircle} className="text-slate-400" />
                    Assign Editor (Opsional)
                  </label>
                  <div className="relative">
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    >
                      <option value="">-- Pilih Editor (Atau Tugaskan ke Semua) --</option>
                      {editors.map((editor) => (
                        <option key={editor.id} value={editor.id}>
                          {editor.name ?? editor.email ?? `Editor ${editor.id}`}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                  {loadingEditors && (
                    <p className="mt-1.5 text-xs font-medium text-emerald-600 animate-pulse">
                      <FontAwesomeIcon icon={faUserCircle} className="mr-1.5" />
                      Sedang memuat daftar editor...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => navigate(`${routeBase}/editor-tasks`)}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void onCreateTask()}
            disabled={!canSubmit || saving}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:translate-y-0"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Menyimpan...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faFloppyDisk} className="transition group-hover:scale-110" />
                Simpan Tugas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditorTaskCreatePage;
