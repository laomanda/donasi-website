import { imagePlaceholder } from "@/lib/placeholder";
import { resolveStorageUrl } from "@/lib/urls";

export type GalleryDpfStatus = "draft" | "published" | "archived";

export type GalleryDpf = {
  id: number;
  image: string;
  caption_id: string;
  caption_en: string;
  status: GalleryDpfStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type GalleryDpfFormState = {
  image: string;
  caption_id: string;
  caption_en: string;
  status: GalleryDpfStatus;
};

export const emptyGalleryDpfForm: GalleryDpfFormState = {
  image: "",
  caption_id: "",
  caption_en: "",
  status: "draft",
};

export const galleryDpfFolder = "uploads/gallery-dpf";

export const resolveGalleryDpfUrl = (path?: string | null) =>
  resolveStorageUrl(path, imagePlaceholder) ?? imagePlaceholder;

export const formatGalleryDpfDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const getGalleryDpfStatusLabel = (status: string) => {
  if (status === "published") return "Terbit";
  if (status === "archived") return "Arsip";
  return "Draf";
};

export const getGalleryDpfStatusTone = (status: string) => {
  if (status === "published") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "archived") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-amber-50 text-amber-700 ring-amber-100";
};
