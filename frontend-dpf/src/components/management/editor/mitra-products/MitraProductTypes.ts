import { imagePlaceholder } from "@/lib/placeholder";
import { resolveStorageUrl } from "@/lib/urls";

export type MitraProductStatus = "draft" | "published" | "archived";
export type ProductImage = { id?: number; image: string; sort_order: number };
export type MitraProduct = { id: number; slug: string; nama_mitra?: string | null; title_id: string; title_en: string; description_id: string; description_en: string; whatsapp_number: string; status: MitraProductStatus; images: ProductImage[]; created_at?: string; updated_at?: string };
export type MitraProductFormState = Omit<MitraProduct, "id" | "created_at" | "updated_at">;
export const emptyMitraProductForm: MitraProductFormState = { slug: "", nama_mitra: "", title_id: "", title_en: "", description_id: "", description_en: "", whatsapp_number: "", status: "draft", images: [] };
export const mitraProductFolder = "uploads/mitra-products";
export const resolveMitraProductImage = (path?: string | null) => resolveStorageUrl(path, imagePlaceholder) ?? imagePlaceholder;
export const statusLabel = (status: string) => status === "published" ? "Terbit" : status === "archived" ? "Arsip" : "Draf";
