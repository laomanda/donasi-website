import { resolveStorageBaseUrl } from "@/lib/urls";
import { imagePlaceholder } from "@/lib/placeholder";

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
