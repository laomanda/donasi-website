export { resolveStorageUrl } from "@/lib/urls";
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

export const getRemainingDays = (publishedAt?: string | null, deadlineDays?: number | string | null): number | null => {
  if (deadlineDays === null || deadlineDays === undefined || String(deadlineDays).trim() === "") {
    return null; // Unlimited
  }

  const days = Number(deadlineDays);
  if (isNaN(days)) return null;

  if (!publishedAt) {
     return days; 
  }

  const publishDate = new Date(publishedAt);
  publishDate.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(publishDate);
  deadlineDate.setDate(publishDate.getDate() + days);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
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




export const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
};
