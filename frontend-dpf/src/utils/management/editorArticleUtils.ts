export { resolveStorageUrl } from "../../lib/urls";
import type { ArticleStatus } from "../../types/article";

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export const getStatusTone = (status: ArticleStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "published") return "bg-emerald-600 text-white ring-emerald-700/70";
  if (s === "review") return "bg-sky-600 text-white ring-sky-700/70";
  return "bg-amber-600 text-white ring-amber-700/70";
};

export const formatStatusLabel = (status: ArticleStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "published") return "Terbit";
  if (s === "review") return "Peninjauan";
  if (s === "draft") return "Draf";
  return String(status || "-");
};

export const toLocalDateTimeInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const normalizeErrors = (error: any): string[] => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") {
    const message = error?.response?.data?.message ?? error?.message;
    return message ? [String(message)] : ["Terjadi kesalahan."];
  }

  const messages: string[] = [];
  
  // Mapping pesan error umum dari Laravel/Backend ke Bahasa Indonesia
  const translateMessage = (msg: string) => {
    let m = msg.toLowerCase();
    
    // Required fields
    if (m.includes("field is required") || m.includes("wajib diisi")) {
      if (m.includes("title")) return "Judul wajib diisi.";
      if (m.includes("category")) return "Kategori wajib diisi.";
      if (m.includes("excerpt")) return "Ringkasan wajib diisi.";
      if (m.includes("body")) return "Konten artikel wajib diisi.";
      if (m.includes("thumbnail")) return "Thumbnail artikel wajib diisi.";
      return "Bidang ini wajib diisi.";
    }

    // Unique/Format/Length
    if (m.includes("has already been taken")) return "Data sudah digunakan (duplikat).";
    if (m.includes("must be a valid image")) return "File harus berupa gambar yang valid.";
    if (m.includes("maximum")) return "Ukuran file atau teks terlalu besar.";
    
    return msg;
  };

  for (const key of Object.keys(errors)) {
    const value = (errors as any)[key];
    if (Array.isArray(value)) {
      value.forEach((msg) => messages.push(translateMessage(String(msg))));
    } else if (value) {
      messages.push(translateMessage(String(value)));
    }
  }
  return messages.length ? messages : ["Validasi gagal."];
};


export const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export const rememberSelection = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  selectionRef: React.MutableRefObject<{ start: number; end: number } | null>
) => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  const start = Number.isFinite(textarea.selectionStart) ? textarea.selectionStart : textarea.value.length;
  const end = Number.isFinite(textarea.selectionEnd) ? textarea.selectionEnd : textarea.value.length;
  selectionRef.current = { start, end };
};
