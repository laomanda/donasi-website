import type { FinancialNoteCategory } from "@/types/finance";

export interface FinancialNoteCategoryConfig {
  key: FinancialNoteCategory;
  label: string;
  sectionLetter: string;
  description: string;
}

export const FINANCIAL_NOTE_CATEGORIES: FinancialNoteCategoryConfig[] = [
  {
    key: "accounting_policy",
    label: "A. Kebijakan Akuntansi",
    sectionLetter: "A",
    description:
      "Dasar penyusunan, kepatuhan PSAK 109/112, asumsi kelangsungan usaha, dan metode akuntansi.",
  },
  {
    key: "asset_note",
    label: "B. Catatan Aset Wakaf & Lancar",
    sectionLetter: "B",
    description:
      "Penjelasan saldo kas, bank, piutang, aset wakaf, dan rincian penyusutan/akumulasi.",
  },
  {
    key: "revenue_note",
    label: "C. Catatan Penerimaan / Pendapatan",
    sectionLetter: "C",
    description:
      "Rincian penerimaan donasi terikat, tidak terikat, hasil pengelolaan wakaf, dan bagi hasil.",
  },
  {
    key: "expense_note",
    label: "D. Catatan Beban & Penyaluran",
    sectionLetter: "D",
    description:
      "Rincian penyaluran program sosial/dakwah, beban operasional, dan beban kepegawaian yayasan.",
  },
  {
    key: "waqf_note",
    label: "E. Catatan Pengelolaan Wakaf",
    sectionLetter: "E",
    description:
      "Informasi surplus/defisit pengelolaan wakaf, alokasi nadzir (10%), dan reinvestasi pokok wakaf.",
  },
  {
    key: "general_note",
    label: "F. Catatan Umum & Lain-Lain",
    sectionLetter: "F",
    description:
      "Profil entitas, susunan pengurus, komitmen, kontinjensi, dan peristiwa setelah tanggal neraca.",
  },
];

export const UNKNOWN_CATEGORY_FALLBACK = {
  key: "custom",
  label: "Catatan Tambahan Lainnya",
  sectionLetter: "G",
  description: "Catatan dan pengungkapan tambahan di luar kategori baku.",
};

export function getCategoryConfig(category?: string | null): FinancialNoteCategoryConfig {
  if (!category) return UNKNOWN_CATEGORY_FALLBACK as FinancialNoteCategoryConfig;
  const found = FINANCIAL_NOTE_CATEGORIES.find((c) => c.key === category);
  return found || (UNKNOWN_CATEGORY_FALLBACK as FinancialNoteCategoryConfig);
}

export function getCategoryLabel(category?: string | null): string {
  return getCategoryConfig(category).label;
}

export function getCategorySectionLetter(category?: string | null): string {
  return getCategoryConfig(category).sectionLetter;
}
