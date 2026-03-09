export type Partner = {
  id: number;
  name: string;
  name_en?: string | null;
  logo_path: string | null;
  url: string | null;
  description: string | null;
  description_en?: string | null;
  is_active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
};

export type PartnerFormState = {
  name: string;
  logo_path: File | string | null;
  url: string;
  description: string;
  is_active: boolean;
  order: string;
  _previewUrl?: string | null; // Untuk preview image
};

export const emptyPartnerForm: PartnerFormState = {
  name: "",
  logo_path: null,
  url: "",
  description: "",
  is_active: true,
  order: "0",
  _previewUrl: null,
};

export const getNextAvailableOrder = (partners: Partner[], excludeId?: number) => {
  const used = new Set<number>();
  partners.forEach((p) => {
    if (excludeId && p.id === excludeId) return;
    const n = Number(p.order);
    if (!Number.isFinite(n)) return;
    used.add(Math.max(0, Math.floor(n)));
  });

  let candidate = 0;
  while (used.has(candidate)) candidate += 1;
  return candidate;
};

import { resolveStorageBaseUrl } from "../../../../lib/urls";
import { imagePlaceholder } from "../../../../lib/placeholder";

export const resolveStorageUrl = (path: string | undefined | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};
export const partnerFolder = "partners";
