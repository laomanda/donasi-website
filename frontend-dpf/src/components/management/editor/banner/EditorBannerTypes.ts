export { resolveStorageUrl as resolveBannerUrl } from "@/lib/urls";

export type BannerMediaType = "image" | "video";
export type BannerStatus = "published" | "draft";

export type Banner = {
  id: number;
  media_type?: BannerMediaType;
  image_path?: string | null;
  video_path?: string | null;
  video_duration?: number | null;
  display_order: number;
  status: BannerStatus;
  created_at?: string | null;
  updated_at?: string | null;
  image_url?: string | null;
  video_url?: string | null;
};

export type BannerFormState = {
  media_type: BannerMediaType;
  image_path: string;
  video_path: string;
  video_duration: string;
  display_order: string;
  status: BannerStatus;
};

export const emptyBannerForm: BannerFormState = {
  media_type: "image",
  image_path: "",
  video_path: "",
  video_duration: "",
  display_order: "0",
  status: "published",
};

export const bannerFolder = "uploads/banners";
export const bannerVideoFolder = "banners/videos";

/**
 * Utility to resolve full storage URL for banners
 */

/**
 * Utility to format updated/created dates
 */
export const formatBannerDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  }).format(date);
};

/**
 * Logic to find the next available display order
 */
export const getNextBannerOrder = (banners: Banner[], excludeId?: number) => {
  const used = new Set<number>();
  banners.forEach((banner) => {
    if (excludeId && banner.id === excludeId) return;
    const n = Number(banner.display_order);
    if (!Number.isFinite(n)) return;
    used.add(Math.max(0, Math.floor(n)));
  });

  let candidate = 0;
  while (used.has(candidate)) candidate += 1;
  return candidate;
};
