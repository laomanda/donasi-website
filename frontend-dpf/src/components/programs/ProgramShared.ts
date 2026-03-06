import imagePlaceholder from "../../brand/assets/image-placeholder.jpg";
import { resolveStorageBaseUrl } from "../../lib/urls";
import { landingDict, translate as translateLanding } from "../../i18n/landing";

export type Program = {
  id: number;
  slug: string;
  title: string;
  title_en?: string | null;
  short_description: string;
  short_description_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  benefits?: string | null;
  benefits_en?: string | null;
  thumbnail_path: string | null;
  banner_path?: string | null;
  program_images?: string[] | null;
  target_amount: number | string;
  collected_amount: number | string;
  status: string;
  category?: string | null;
  category_en?: string | null;
  deadline_days?: number | string | null;
  is_highlight?: boolean | null;
  published_at?: string | null;
  created_at?: string | null;
};

export type Donation = {
  id: number;
  donor_name?: string | null;
  amount?: number | string | null;
  paid_at?: string | null;
  is_anonymous?: boolean | null;
};

export type ProgramUpdate = {
  id: number;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  published_at?: string | null;
};

export type ProgramShowResponse = {
  program: Program;
  progress_percent?: number;
  recent_donations?: Donation[];
  latest_updates?: ProgramUpdate[];
};

export const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

export const formatCurrency = (value: number | string | null | undefined, locale: "id" | "en") =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};

export const formatDate = (value?: string | null, locale: "id" | "en" = "id") => {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

export const getProgress = (collected: number | string | undefined, target: number | string | undefined) => {
  const safeTarget = Math.max(Number(target ?? 0), 1);
  const value = Math.round((Number(collected ?? 0) / safeTarget) * 100);
  return Number.isNaN(value) ? 0 : value;
};

export const canonicalStatus = (status?: string | null, deadlineDays?: number | string | null) => {
  const raw = String(status ?? "").trim();
  const s = raw.toLowerCase();

  // Auto-complete if deadline passed (deadline_days <= 0)
  const hasDeadline = deadlineDays !== null && deadlineDays !== undefined && String(deadlineDays).trim() !== "";
  if (hasDeadline && Number(deadlineDays) <= 0) {
    return "completed";
  }

  if (s === "active" || s === "berjalan") return "active";
  if (s === "completed" || s === "selesai" || s === "archived" || s === "arsip" || s === "tersalurkan") return "completed";
  if (s === "draft" || s === "upcoming" || s === "segera") return "draft";
  return "other";
};

export const getProgramStatusTone = (status?: string | null, deadlineDays?: number | string | null) => {
  const s = canonicalStatus(status, deadlineDays);
  if (s === "active") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (s === "draft") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (s === "completed") return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-slate-50 text-slate-700 ring-slate-200";
};

export const getStatusLabel = (status?: string | null, t?: (key: string, fallback?: string) => string, deadlineDays?: number | string | null) => {
  const translateFn = t ?? ((key: string, fallback?: string) => translateLanding(landingDict, "id", key, fallback));
  const s = canonicalStatus(status, deadlineDays);
  if (s === "active") return translateFn("landing.programs.status.ongoing");
  if (s === "completed") return translateFn("landing.programs.status.completed");
  if (s === "draft") return translateFn("landing.programs.status.upcoming");
  return translateFn("landing.common.na");
};

export const getExcerptParagraph = (value?: string | null) => {
  if (!value) return "";
  const cleaned = value.replace(/\r/g, "").trim();
  if (!cleaned) return "";
  const parts = cleaned.split(/\n\s*\n|\n/).map((part) => part.trim()).filter(Boolean);
  return parts[0] ?? "";
};
