/**
 * Utilitas untuk fitur Manajemen Tugas Editor Admin.
 * Berisi fungsi pemformatan dan logika status/prioritas.
 */

export type EditorTaskStatus = "open" | "in_progress" | "done" | "cancelled" | string;
export type EditorTaskPriority = "low" | "normal" | "high" | string;

/**
 * Memformat string tanggal menjadi format ID yang mudah dibaca.
 */
export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Mendapatkan label bahasa Indonesia untuk prioritas.
 */
export const formatPriority = (value: EditorTaskPriority | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "high") return "Tinggi";
  if (s === "low") return "Rendah";
  return "Normal";
};

/**
 * Mendapatkan label bahasa Indonesia untuk status.
 */
export const formatStatus = (value: EditorTaskStatus | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "done") return "Selesai";
  if (s === "in_progress") return "Dikerjakan";
  if (s === "open") return "Baru";
  if (s === "cancelled") return "Dibatalkan";
  return s || "-";
};

/**
 * Mendapatkan kelas CSS warna latar belakang berdasarkan status.
 */
export const getStatusTone = (value: EditorTaskStatus | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "done") return "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500/20";
  if (s === "in_progress") return "bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/20";
  if (s === "open") return "bg-amber-500 text-white shadow-sm ring-1 ring-amber-400/20";
  if (s === "cancelled") return "bg-rose-600 text-white shadow-sm ring-1 ring-rose-500/20";
  return "bg-slate-600 text-white shadow-sm ring-1 ring-slate-500/20";
};

/**
 * Mendapatkan kelas CSS border kiri berdasarkan status.
 */
export const getStatusBorder = (value: EditorTaskStatus | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "done") return "border-l-emerald-500";
  if (s === "in_progress") return "border-l-blue-500";
  if (s === "open") return "border-l-amber-500";
  if (s === "cancelled") return "border-l-rose-500";
  return "border-l-slate-400";
};

/**
 * Mendapatkan kelas CSS warna latar belakang berdasarkan prioritas.
 */
export const getPriorityTone = (value: EditorTaskPriority | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "high") return "bg-rose-600 text-white shadow-sm ring-1 ring-rose-500/30";
  if (s === "low") return "bg-slate-500 text-white shadow-sm ring-1 ring-slate-400/30";
  return "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500/30";
};

/**
 * Memeriksa apakah tugas dalam status yang mengunci penghapusan.
 */
export const isDeleteLocked = (value: EditorTaskStatus | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  return s === "in_progress" || s === "done";
};
