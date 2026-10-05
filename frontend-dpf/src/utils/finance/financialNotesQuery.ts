import type { FinancialNoteFilterParams } from "@/types/finance";

export interface FinancialNoteFilterState {
  periodId: number | "";
  category: string;
  status: string;
  search: string;
  viewMode: "narrative" | "table";
}

/**
 * Builds clean parameters for Financial Notes API query.
 */
export function buildFinancialNoteFilterParams(
  filters: Pick<FinancialNoteFilterState, "periodId" | "category" | "status">
): FinancialNoteFilterParams {
  const params: FinancialNoteFilterParams = {};

  if (filters.periodId !== "" && filters.periodId !== undefined) {
    const pId = Number(filters.periodId);
    params.period_id = pId;
    params.accounting_period_id = pId;
  }

  if (filters.category?.trim()) {
    params.category = filters.category.trim();
  }

  if (filters.status?.trim()) {
    params.status = filters.status.trim();
  }

  return params;
}

/**
 * Builds parameters for Financial Notes Excel export.
 */
export function buildFinancialNoteExportParams(
  filters: Pick<FinancialNoteFilterState, "periodId" | "category" | "status">
): Record<string, string> {
  const exportParams: Record<string, string> = {};

  if (filters.periodId !== "" && filters.periodId !== undefined) {
    exportParams.period_id = String(filters.periodId);
    exportParams.accounting_period_id = String(filters.periodId);
  }

  if (filters.category?.trim()) {
    exportParams.category = filters.category.trim();
  }

  if (filters.status?.trim()) {
    exportParams.status = filters.status.trim();
  }

  return exportParams;
}

/**
 * Deterministic cache key for Notes List based on server filters.
 * Excludes client search query to avoid cache fragmentation.
 */
export function buildFinancialNotesListCacheKey(
  params: FinancialNoteFilterParams | Pick<FinancialNoteFilterState, "periodId" | "category" | "status">
): string {
  const period =
    "periodId" in params
      ? params.periodId
      : params.period_id ?? params.accounting_period_id ?? "";
  const cat = params.category ?? "";
  const st = params.status ?? "";

  return `finance:financial-notes:period=${period}:category=${cat}:status=${st}`;
}

/**
 * Deterministic cache key for Financial Notes Summary based strictly on period.
 * Does NOT depend on category/status filters so summary cache is reused across filter changes.
 */
export function buildFinancialNotesSummaryCacheKey(
  periodId?: number | string | null
): string {
  const p = periodId !== undefined && periodId !== null && periodId !== "" ? String(periodId) : "all";
  return `finance:financial-notes-summary:period=${p}`;
}

/**
 * Cache key for single financial note detail.
 */
export function buildFinancialNoteDetailCacheKey(id: number | string): string {
  return `finance:financial-note:${id}`;
}
