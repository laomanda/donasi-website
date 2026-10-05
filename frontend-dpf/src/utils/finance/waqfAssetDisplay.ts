import type {
  WaqfAssetReportResponse,
  WaqfAssetItem,
  WaqfAssetReportSummary,
  FinancialStatementPeriod,
  FinancialStatementNoteItem,
} from "@/types/finance";

export interface NormalizedWaqfAssetReport {
  period: FinancialStatementPeriod | null;
  summary: WaqfAssetReportSummary;
  assets: WaqfAssetItem[];
  notes: FinancialStatementNoteItem[];
  hasData: boolean;
}

/**
 * Pure display normalizer for Waqf Asset report schema aliases.
 * Strictly avoids performing financial calculations (no summing, no book value derivation).
 */
export function normalizeWaqfAssetReport(
  raw: WaqfAssetReportResponse | null
): NormalizedWaqfAssetReport {
  if (!raw) {
    return {
      period: null,
      summary: {
        total_assets: 0,
        total_acquisition_value: 0,
        total_accumulated_depreciation: 0,
        total_book_value: 0,
        by_category: [],
        by_condition: [],
        by_status: [],
      },
      assets: [],
      notes: [],
      hasData: false,
    };
  }

  const rawSummary = raw.summary;
  const summary: WaqfAssetReportSummary = {
    total_assets: Number(rawSummary?.total_assets ?? rawSummary?.total_assets_count ?? 0),
    total_acquisition_value: Number(
      rawSummary?.total_acquisition_value ?? rawSummary?.total_acquisition_cost ?? 0
    ),
    total_accumulated_depreciation: Number(
      rawSummary?.total_accumulated_depreciation ?? 0
    ),
    total_book_value: Number(rawSummary?.total_book_value ?? 0),
    by_category: Array.isArray(rawSummary?.by_category) ? rawSummary.by_category : [],
    by_condition: Array.isArray(rawSummary?.by_condition) ? rawSummary.by_condition : [],
    by_status: Array.isArray(rawSummary?.by_status) ? rawSummary.by_status : [],
  };

  const assets = Array.isArray(raw.assets) ? raw.assets : [];
  const rawNotes = raw.financial_notes ?? raw.notes;
  const notes = Array.isArray(rawNotes) ? rawNotes : [];

  const hasData =
    assets.length > 0 ||
    summary.total_assets > 0 ||
    summary.total_book_value > 0;

  return {
    period: raw.period ?? null,
    summary,
    assets,
    notes,
    hasData,
  };
}

/**
 * Maps asset condition code to user-friendly Bahasa Indonesia label.
 */
export function formatConditionLabel(condition?: string | null): string {
  if (!condition) return "-";
  const normalized = condition.toLowerCase().trim();

  switch (normalized) {
    case "excellent":
    case "sangat baik":
      return "Sangat Baik";
    case "good":
    case "baik":
      return "Baik";
    case "under_maintenance":
    case "under_repair":
    case "pemeliharaan":
      return "Pemeliharaan";
    case "damaged":
    case "rusak":
      return "Rusak";
    default:
      return condition.charAt(0).toUpperCase() + condition.slice(1);
  }
}

/**
 * Maps asset operational status code to natural Bahasa Indonesia label.
 */
export function formatStatusLabel(status?: string | null): string {
  if (!status) return "-";
  const normalized = status.toLowerCase().trim();

  switch (normalized) {
    case "active":
      return "Aktif";
    case "disposed":
      return "Dihapuskan";
    case "transferred":
      return "Dimutasi";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Formats economic use without fabricating a 100% assumption.
 * Strictly uses backend percentage if provided.
 */
export function formatEconomicUseLabel(
  economicUse?: "productive" | "social" | "mixed" | string | null,
  percentage?: number | null
): string {
  if (!economicUse) return "Belum Diklasifikasikan";

  const norm = economicUse.toLowerCase().trim();

  if (norm === "productive") {
    if (percentage !== null && percentage !== undefined && !isNaN(Number(percentage))) {
      return `Produktif (${Number(percentage).toFixed(0)}%)`;
    }
    return "Produktif";
  }

  if (norm === "social") {
    return "Sosial";
  }

  if (norm === "mixed") {
    if (percentage !== null && percentage !== undefined && !isNaN(Number(percentage))) {
      return `Campuran (${Number(percentage).toFixed(0)}%)`;
    }
    return "Campuran";
  }

  return "Belum Diklasifikasikan";
}

/**
 * Maps fund source type to humanized Bahasa Indonesia.
 */
export function formatSourceType(sourceType?: string | null): string {
  if (!sourceType) return "-";
  const norm = sourceType.toLowerCase().trim();

  switch (norm) {
    case "wakaf_uang":
      return "Wakaf Uang";
    case "wakaf_melalui_uang":
      return "Wakaf Melalui Uang";
    case "hibah":
      return "Hibah / Donasi";
    case "apbd":
    case "apbn":
      return "Dana Pemerintah";
    case "swadaya":
      return "Swadaya Masyarakat";
    default:
      return sourceType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/**
 * Category Model for dropdown selection.
 */
export interface WaqfCategoryOption {
  id: number;
  name: string;
}

/**
 * Helper to discover available categories from the asset dataset.
 *
 * NOTE (Requirement 24 Limitation):
 * There is currently no dedicated /finance/waqf-asset-categories endpoint in the backend.
 * Therefore, we extract distinct categories from the loaded report dataset as a compatibility fallback.
 */
export function extractCategoriesFromAssets(
  assets: WaqfAssetItem[]
): WaqfCategoryOption[] {
  const map = new Map<number, string>();

  for (const a of assets) {
    if (a.category_id && a.category) {
      if (!map.has(a.category_id)) {
        map.set(a.category_id, a.category);
      }
    }
  }

  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
