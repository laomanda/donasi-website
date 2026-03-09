import type { ProgramStatus } from "./EditorProgramTypes";

export const GALLERY_SLOTS = 3;

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

export const getStatusTone = (status: ProgramStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "active") return "bg-brandGreen-600 text-white ring-brandGreen-700/70";
  if (s === "completed" || s === "archived") return "bg-sky-600 text-white ring-sky-700/70";
  return "bg-amber-600 text-white ring-amber-700/70";
};

export const formatStatusLabel = (status: ProgramStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "active") return "Berjalan";
  if (s === "completed" || s === "archived") return "Tersalurkan";
  if (s === "draft") return "Draf";
  return String(status || "-");
};

export const normalizeProgramImages = (images?: string[] | null) => {
    const list = Array.isArray(images) ? images : [];
    const cleaned = list.map((value) => String(value ?? "").trim()).filter(Boolean);
    while (cleaned.length < GALLERY_SLOTS) cleaned.push("");
    return cleaned.slice(0, GALLERY_SLOTS);
};

export const normalizeErrors = (error: any): string[] => {
    const errors = error?.response?.data?.errors;
    if (!errors || typeof errors !== "object") {
        const message = error?.response?.data?.message ?? error?.message;
        return message ? [String(message)] : ["Terjadi kesalahan."];
    }

    const messages: string[] = [];
    for (const key of Object.keys(errors)) {
        const value = (errors as any)[key];
        if (Array.isArray(value)) value.forEach((msg) => messages.push(String(msg)));
        else if (value) messages.push(String(value));
    }
    return messages.length ? messages : ["Validasi gagal."];
};

export const getBackendBaseUrl = () => {
    const api = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
    const backend = import.meta.env.VITE_BACKEND_URL ?? api.replace(/\/api(\/v1)?$/, "");
    return String(backend).replace(/\/$/, "");
};

export const resolveStorageUrl = (path: string) => {
    const value = String(path ?? "").trim();
    if (!value) return null;
    if (value.startsWith("http")) return value;
    const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
    return `${getBackendBaseUrl()}/storage/${clean}`;
};

export const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
};
