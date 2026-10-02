import type { GeneralLedgerFilterParams } from "@/types/finance";

export interface GeneralLedgerFilterState {
  accountId: number | "";
  periodId: number | "";
  startDate: string;
  endDate: string;
  includeZeroBalance: boolean;
}

/**
 * Builds clean, type-safe API filter parameters for General Ledger queries.
 */
export function buildGeneralLedgerParams(
  filters: GeneralLedgerFilterState
): GeneralLedgerFilterParams {
  const params: GeneralLedgerFilterParams = {};

  if (filters.accountId !== "" && filters.accountId !== undefined) {
    params.account_id = Number(filters.accountId);
  }

  if (filters.periodId !== "" && filters.periodId !== undefined) {
    params.period_id = Number(filters.periodId);
  }

  if (filters.startDate?.trim()) {
    params.start_date = filters.startDate.trim();
  }

  if (filters.endDate?.trim()) {
    params.end_date = filters.endDate.trim();
  }

  if (filters.includeZeroBalance) {
    params.include_zero_balance = 1;
  }

  return params;
}

/**
 * Builds string key-value parameters for Excel export API.
 */
export function buildGeneralLedgerExportParams(
  filters: GeneralLedgerFilterState
): Record<string, string> {
  const exportParams: Record<string, string> = {};

  if (filters.accountId !== "" && filters.accountId !== undefined) {
    exportParams.account_id = String(filters.accountId);
  }

  if (filters.periodId !== "" && filters.periodId !== undefined) {
    exportParams.period_id = String(filters.periodId);
  }

  if (filters.startDate?.trim()) {
    exportParams.start_date = filters.startDate.trim();
  }

  if (filters.endDate?.trim()) {
    exportParams.end_date = filters.endDate.trim();
  }

  if (filters.includeZeroBalance) {
    exportParams.include_zero_balance = "1";
  }

  return exportParams;
}

/**
 * Deterministically constructs a unique cache key based on query filters.
 */
export function buildGeneralLedgerCacheKey(
  params: GeneralLedgerFilterParams | GeneralLedgerFilterState
): string {
  const acc = "accountId" in params ? params.accountId : params.account_id ?? "";
  const period = "periodId" in params ? params.periodId : params.period_id ?? "";
  const start = "startDate" in params ? params.startDate : params.start_date ?? "";
  const end = "endDate" in params ? params.endDate : params.end_date ?? "";
  const zero =
    "includeZeroBalance" in params
      ? params.includeZeroBalance
        ? "1"
        : "0"
      : params.include_zero_balance
      ? "1"
      : "0";

  return `finance:gl:acc=${acc}:period=${period}:start=${start}:end=${end}:zero=${zero}`;
}
