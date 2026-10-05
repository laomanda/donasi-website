import type { WaqfAssetFilterParams } from "@/types/finance";

export interface WaqfAssetFilterState {
  periodId: number | "";
  categoryId: number | "";
  status: string;
  search: string;
}

/**
 * Builds clean API filter parameters for Waqf Asset report queries.
 */
export function buildWaqfAssetReportParams(
  filters: Pick<WaqfAssetFilterState, "periodId" | "categoryId" | "status">
): WaqfAssetFilterParams {
  const params: WaqfAssetFilterParams = {};

  if (filters.periodId !== "" && filters.periodId !== undefined) {
    const pId = Number(filters.periodId);
    params.period_id = pId;
    params.accounting_period_id = pId;
  }

  if (filters.categoryId !== "" && filters.categoryId !== undefined) {
    params.category_id = Number(filters.categoryId);
  }

  if (filters.status?.trim()) {
    params.status = filters.status.trim();
  }

  return params;
}

/**
 * Builds query parameters for Waqf Asset Excel export API.
 */
export function buildWaqfAssetExportParams(
  filters: Pick<WaqfAssetFilterState, "periodId" | "categoryId" | "status">
): Record<string, string> {
  const exportParams: Record<string, string> = {};

  if (filters.periodId !== "" && filters.periodId !== undefined) {
    exportParams.period_id = String(filters.periodId);
    exportParams.accounting_period_id = String(filters.periodId);
  }

  if (filters.categoryId !== "" && filters.categoryId !== undefined) {
    exportParams.category_id = String(filters.categoryId);
  }

  if (filters.status?.trim()) {
    exportParams.status = filters.status.trim();
  }

  return exportParams;
}

/**
 * Constructs a deterministic cache key for Waqf Asset report based on server filters.
 * Note: Client search query is excluded to avoid cache fragmentation.
 */
export function buildWaqfAssetReportCacheKey(
  params: WaqfAssetFilterParams | Pick<WaqfAssetFilterState, "periodId" | "categoryId" | "status">
): string {
  const period =
    "periodId" in params
      ? params.periodId
      : params.period_id ?? params.accounting_period_id ?? "";
  const category =
    "categoryId" in params ? params.categoryId : params.category_id ?? "";
  const status =
    "status" in params ? params.status : params.status ?? "";

  return `finance:waqf-assets:period=${period}:category=${category}:status=${status}`;
}

/**
 * Constructs a deterministic cache key for a specific asset detail including period context.
 */
export function buildWaqfAssetDetailCacheKey(
  assetId: number | string,
  periodId?: number | string | null
): string {
  const p = periodId !== undefined && periodId !== null && periodId !== "" ? String(periodId) : "";
  return `finance:waqf-asset:${assetId}:period=${p}`;
}
