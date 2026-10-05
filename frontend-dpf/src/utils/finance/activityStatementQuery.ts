import type { FinancialStatementFilterParams } from "@/types/finance";

export interface ActivityStatementFilterState {
  periodId: number | "";
  startDate: string;
  endDate: string;
}

/**
 * Builds clean, type-safe API filter parameters for Activity Statement queries.
 */
export function buildActivityStatementParams(
  filters: ActivityStatementFilterState
): FinancialStatementFilterParams {
  const params: FinancialStatementFilterParams = {};

  if (filters.periodId !== "" && filters.periodId !== undefined) {
    const pId = Number(filters.periodId);
    params.period_id = pId;
    params.accounting_period_id = pId;
  }

  if (filters.startDate?.trim()) {
    params.start_date = filters.startDate.trim();
  }

  if (filters.endDate?.trim()) {
    params.end_date = filters.endDate.trim();
  }

  return params;
}

/**
 * Builds string key-value parameters for Activity Statement Excel export API.
 */
export function buildActivityStatementExportParams(
  filters: ActivityStatementFilterState
): Record<string, string> {
  const exportParams: Record<string, string> = {};

  if (filters.periodId !== "" && filters.periodId !== undefined) {
    exportParams.period_id = String(filters.periodId);
  }

  if (filters.startDate?.trim()) {
    exportParams.start_date = filters.startDate.trim();
  }

  if (filters.endDate?.trim()) {
    exportParams.end_date = filters.endDate.trim();
  }

  return exportParams;
}

/**
 * Deterministically constructs a unique cache key based on query filters.
 */
export function buildActivityStatementCacheKey(
  params: FinancialStatementFilterParams | ActivityStatementFilterState
): string {
  const period =
    "periodId" in params
      ? params.periodId
      : params.period_id ?? params.accounting_period_id ?? "";
  const start =
    "startDate" in params ? params.startDate : params.start_date ?? "";
  const end =
    "endDate" in params ? params.endDate : params.end_date ?? "";

  return `finance:activity-statement:period=${period}:start=${start}:end=${end}`;
}
