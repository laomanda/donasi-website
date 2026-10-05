import type { FinancialNote } from "@/types/finance";
import {
  FINANCIAL_NOTE_CATEGORIES,
  UNKNOWN_CATEGORY_FALLBACK,
} from "@/config/finance/financialNoteCategories";

export interface FinancialNoteGroup {
  categoryKey: string;
  categoryLabel: string;
  sectionLetter: string;
  description: string;
  notes: FinancialNote[];
}

/**
 * Pure helper to group financial notes into canonical categories for narrative view.
 * Preserves custom / unknown categories under a fallback section.
 */
export function groupFinancialNotesByCategory(
  notes: FinancialNote[],
  activeCategoryFilter = ""
): FinancialNoteGroup[] {
  const groups: FinancialNoteGroup[] = [];

  // 1. Group canonical categories
  for (const cat of FINANCIAL_NOTE_CATEGORIES) {
    const matching = notes.filter((n) => n.category === cat.key);
    // Include group if it has notes, or if user explicitly selected this category
    if (matching.length > 0 || (activeCategoryFilter === cat.key && notes.length > 0)) {
      groups.push({
        categoryKey: cat.key,
        categoryLabel: cat.label,
        sectionLetter: cat.sectionLetter,
        description: cat.description,
        notes: matching,
      });
    }
  }

  // 2. Custom categories not in canonical list
  const customNotes = notes.filter(
    (n) => !FINANCIAL_NOTE_CATEGORIES.some((c) => c.key === n.category)
  );

  if (customNotes.length > 0) {
    groups.push({
      categoryKey: UNKNOWN_CATEGORY_FALLBACK.key,
      categoryLabel: UNKNOWN_CATEGORY_FALLBACK.label,
      sectionLetter: UNKNOWN_CATEGORY_FALLBACK.sectionLetter,
      description: UNKNOWN_CATEGORY_FALLBACK.description,
      notes: customNotes,
    });
  }

  return groups;
}

/**
 * Maps financial note status code to Indonesian label.
 */
export function formatNoteStatusLabel(status?: string | null): string {
  if (!status) return "Draft";
  const norm = status.toLowerCase().trim();
  switch (norm) {
    case "published":
      return "Dipublikasikan";
    case "draft":
      return "Draft";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Formats note visual order code, e.g. "A.1", "B.2".
 */
export function formatNoteOrderLabel(
  note: FinancialNote,
  sectionLetter: string,
  fallbackIndex: number
): string {
  const orderNum = note.sort_order ?? note.order ?? fallbackIndex;
  return `${sectionLetter}.${orderNum}`;
}

/**
 * Formats creator display without fabricating identity.
 * Strictly returns "—" if creator_name is absent.
 */
export function formatCreatorLabel(creatorName?: string | null): string {
  if (!creatorName || !creatorName.trim()) {
    return "—";
  }
  return creatorName.trim();
}
