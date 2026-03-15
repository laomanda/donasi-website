import type { Locale } from "./i18n";

export type Dict = Record<string, { id: string; en?: string }>;

export function translate(dict: Dict, locale: Locale, key: string, fallback?: string) {
  const found = dict[key];
  if (!found) return fallback ?? key;
  return (locale === "en" ? found.en : found.id) ?? found.id;
}
