import { resolveStorageBaseUrl } from "@/lib/urls";
import imagePlaceholder from "@/brand/assets/image-placeholder.jpg";

/* --- Types --- */

export type Program = {
  id: number;
  slug?: string | null;
  title: string;
  title_en?: string | null;
  short_description: string;
  short_description_en?: string | null;
  thumbnail_path: string | null;
  target_amount: string | number;
  collected_amount: string | number;
  status: string;
  category?: string | null;
  category_en?: string | null;
  deadline_days?: number | string | null;
};

export type Literasi = {
  id: number;
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt: string;
  excerpt_en?: string | null;
  published_at: string | null;
  thumbnail_path?: string | null;
  category?: string | null;
  category_en?: string | null;
  author_name?: string | null;
};

export type Partner = {
  id: number;
  name: string;
  name_en?: string | null;
  logo_path: string | null;
  url?: string | null;
};

export type Banner = {
  id: number;
  image_path: string;
  display_order: number;
};

export type HomePayload = {
  highlights: Program[];
  latest_articles: Literasi[];
  partners: Partner[];
  stats: {
    total_programs: number;
    total_donations: number;
    amount_collected: string | number;
  };
};

/* --- Helpers --- */

export const formatCurrency = (value: number | string | undefined, locale: "id" | "en") =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const formatDate = (value: string | null | undefined, locale: "id" | "en", t: (k: string, f?: string) => string) => {
  if (!value) return t("landing.common.soon");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("landing.common.soon");
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

export const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};

export const getProgress = (collected: number | string | undefined, target: number | string | undefined) => {
  const safeTarget = Math.max(Number(target ?? 0), 1);
  const value = Math.round((Number(collected ?? 0) / safeTarget) * 100);
  return Number.isNaN(value) ? 0 : value;
};

export const normalizeProgramStatus = (status: string | null | undefined, t: (k: string, f?: string) => string, deadlineDays?: number | string | null) => {
  const raw = String(status ?? "").trim().toLowerCase();

  const hasDeadline = deadlineDays !== null && deadlineDays !== undefined && String(deadlineDays).trim() !== "";
  if (hasDeadline && Number(deadlineDays) <= 0) {
    return t("landing.programs.status.completed");
  }

  if (!raw) return t("landing.common.na");
  if (raw === "active" || raw === "berjalan") return t("landing.programs.status.ongoing");
  if (raw === "completed" || raw === "selesai" || raw === "archived" || raw === "arsip" || raw === "tersalurkan") return t("landing.programs.status.completed");
  if (raw === "draft" || raw === "upcoming" || raw === "segera") return t("landing.programs.status.upcoming");
  return status ?? raw;
};

export const getProgramStatusTone = (status?: string | null, deadlineDays?: number | string | null) => {
  const s = String(status ?? "").trim().toLowerCase();

  const hasDeadline = deadlineDays !== null && deadlineDays !== undefined && String(deadlineDays).trim() !== "";
  if (hasDeadline && Number(deadlineDays) <= 0) {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }

  if (s === "berjalan" || s === "active") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (s === "segera" || s === "draft") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (s === "selesai" || s === "completed" || s === "arsip" || s === "archived" || s === "tersalurkan") {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }
  return "bg-slate-50 text-slate-700 ring-slate-200";
};

export const isProgramCompleted = (status: string | null | undefined, deadlineDays?: number | string | null) => {
  const raw = String(status ?? "").trim().toLowerCase();
  const hasDeadline = deadlineDays !== null && deadlineDays !== undefined && String(deadlineDays).trim() !== "";
  if (hasDeadline && Number(deadlineDays) <= 0) return true;
  return ["completed", "selesai", "tersalurkan", "archived", "arsip"].includes(raw);
};
