import imagePlaceholder from "../../brand/assets/image-placeholder.jpg";
import { resolveStorageBaseUrl } from "../../lib/urls";

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

export const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

export const formatDate = (value?: string | null, locale: "id" | "en" = "id", t?: (key: string, fallback?: string) => string) => {
  if (!value) return t ? t("literasi.date.soon") : locale === "en" ? "Just published" : "Baru Tayang";
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};
