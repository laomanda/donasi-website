export type Banner = {
  id: number;
  image_path: string;
  display_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BannerFormState = {
  image_path: string;
  display_order: string;
};

export const emptyBannerForm: BannerFormState = {
  image_path: "",
  display_order: "0",
};

export const bannerFolder = "uploads/banners";

/**
 * Utility to resolve full storage URL for banners
 */
export const resolveBannerUrl = (path: string | null | undefined) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  
  const api = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const backend = import.meta.env.VITE_BACKEND_URL ?? api.replace(/\/api(\/v1)?$/, "");
  const baseUrl = String(backend).replace(/\/$/, "");
  
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${baseUrl}/storage/${clean}`;
};

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
