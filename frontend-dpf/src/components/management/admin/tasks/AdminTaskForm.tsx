import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import type { EditorTaskPriority } from "@/utils/management/adminTaskUtils";

interface EditorUserOption {
  id: number;
  name?: string | null;
  email?: string | null;
}

interface AdminTaskFormProps {
  mode: "manual" | "file";
  setMode: (mode: "manual" | "file") => void;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  priority: EditorTaskPriority;
  setPriority: (val: EditorTaskPriority) => void;
  dueAt: string;
  setDueAt: (val: string) => void;
  assignedTo: string;
  setAssignedTo: (val: string) => void;
  attachments: File[];
  setAttachments: (files: File[]) => void;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  editors: EditorUserOption[];
  loadingEditors: boolean;
}

export default function AdminTaskForm({
  mode,
  setMode,
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  dueAt,
  setDueAt,
  assignedTo,
  setAssignedTo,
  attachments,
  setAttachments,
  saving,
  onSubmit,
  onCancel,
  editors,
  loadingEditors,
}: AdminTaskFormProps) {
  const isFileMode = mode === "file";
  const hasAttachment = attachments.length > 0;
  const canSubmit = isFileMode ? hasAttachment && !saving : Boolean(title.trim()) && !saving;

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
      {/* Mode Switcher */}
      <div className="mb-8 flex flex-col items-center justify-center gap-4">
        <div className="flex w-full max-w-md rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200 sm:w-auto sm:inline-flex">
          <button
            type="button"
            onClick={() => {
              setMode("manual");
              setAttachments([]);
            }}
            className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:px-6 sm:text-sm ${mode === "manual"
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
            className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:px-6 sm:text-sm ${mode === "file"
              ? "bg-white text-emerald-700 shadow-sm ring-1 ring-black/5"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
          >
            <FontAwesomeIcon icon={faFileWord} />
            Upload File
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
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onSubmit}
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
  );
}
