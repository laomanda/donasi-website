import { imagePlaceholder } from "@/lib/placeholder";
import { resolveStorageUrl } from "@/lib/urls";

export type GalleryMitraStatus = "draft" | "published" | "archived";
export type GalleryMitra = { id: number; image: string; caption_id: string; caption_en: string; status: GalleryMitraStatus | string; created_at?: string | null; updated_at?: string | null };
export type GalleryMitraFormState = { image: string; caption_id: string; caption_en: string; status: GalleryMitraStatus };
export const emptyGalleryMitraForm: GalleryMitraFormState = { image: "", caption_id: "", caption_en: "", status: "draft" };
export const galleryMitraFolder = "uploads/gallery-mitra";
export const resolveGalleryMitraUrl = (path?: string | null) => resolveStorageUrl(path, imagePlaceholder) ?? imagePlaceholder;
export const formatGalleryMitraDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};
export const getGalleryMitraStatusLabel = (status: string) => status === "published" ? "Terbit" : status === "archived" ? "Arsip" : "Draf";
export const getGalleryMitraStatusTone = (status: string) => status === "published" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : status === "archived" ? "bg-slate-100 text-slate-600 ring-slate-200" : "bg-amber-50 text-amber-700 ring-amber-100";
