/**
 * Mapping of Indonesian organization group names to their English translations.
 * Used for auto-filling the English group field when the Indonesian one is set.
 *
 * Keys are LOWERCASE for case-insensitive lookup.
 */
const ORGANIZATION_GROUP_ID_TO_EN: Record<string, string> = {
  pembina: "Board of Patrons",
  pengawas: "Board of Supervisors",
  pengurus: "Board of Management",
  staff: "Staff",
  relawan: "Volunteer",
  lainnya: "Others",
  direksi: "Board of Directors",
  manajemen: "Management",
  "kepala divisi": "Head of Division",
  "kepala bagian": "Head of Section",
  anggota: "Member",
};

/**
 * List of available organization groups for dropdowns.
 * Capitalized for display.
 */
export const ORGANIZATION_GROUPS = Object.keys(ORGANIZATION_GROUP_ID_TO_EN).map((key) => {
  return key.charAt(0).toUpperCase() + key.slice(1);
});

/**
 * Given an Indonesian group string, return its English translation.
 * Returns `null` if no translation is found.
 */
export function translateGroupToEn(idGroup: string): string | null {
  const key = idGroup.trim().toLowerCase();
  return ORGANIZATION_GROUP_ID_TO_EN[key] ?? null;
}
