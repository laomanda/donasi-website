/**
 * Mapping of Indonesian category names to their English translations.
 * Used for auto-filling the English category field when the Indonesian one is set.
 *
 * Keys are LOWERCASE for case-insensitive lookup.
 */
const CATEGORY_ID_TO_EN: Record<string, string> = {
  // Program categories
  wakaf: "Endowment",
  pendidikan: "Education",
  kesehatan: "Health",
  kemanusiaan: "Humanity",
  sosial: "Social",
  ekonomi: "Economy",
  lingkungan: "Environment",
  dakwah: "Da'wah",
  pemberdayaan: "Empowerment",
  infrastruktur: "Infrastructure",
  pangan: "Food",
  air: "Water",
  santunan: "Charity",
  zakat: "Zakat",
  infaq: "Infaq",
  sedekah: "Alms",
  qurban: "Qurban",
  ramadhan: "Ramadan",

  // Article categories
  edukasi: "Education",
  berita: "News",
  artikel: "Article",
  opini: "Opinion",
  literasi: "Literacy",
  inspirasi: "Inspiration",
  kegiatan: "Activity",
  laporan: "Report",
  pengumuman: "Announcement",
  kajian: "Study",
  tips: "Tips",
  teknologi: "Technology",
  budaya: "Culture",
  olahraga: "Sports",
  hiburan: "Entertainment",
};

/**
 * List of available categories for dropdowns.
 * Capitalized for display.
 */
export const CATEGORY_OPTIONS = Object.keys(CATEGORY_ID_TO_EN).map((key) => {
  return key.charAt(0).toUpperCase() + key.slice(1);
});

/**
 * Given an Indonesian category string, return its English translation.
 * Returns `null` if no translation is found.
 */
export function translateCategoryToEn(idCategory: string): string | null {
  const key = idCategory.trim().toLowerCase();
  return CATEGORY_ID_TO_EN[key] ?? null;
}
