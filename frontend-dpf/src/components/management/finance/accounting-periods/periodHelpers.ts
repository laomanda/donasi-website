import { formatFinanceDate, formatFinanceDateTime } from "@/utils/financeUtils";
import type { AccountingPeriod } from "@/types/finance";

/**
 * Format accounting period display name cleanly.
 * Prevents redundant outputs like "2026 (2026)".
 */
export function formatAccountingPeriodName(period: Partial<AccountingPeriod>): string {
  const name = (period.period_name || period.name || "").trim();
  const yearStr = period.year != null ? String(period.year).trim() : "";

  if (!name && yearStr) return yearStr;
  if (!yearStr) return name || "—";

  // If the period name already contains the year, avoid duplicate "(year)"
  if (name.includes(yearStr)) {
    return name;
  }

  return `${name} (${yearStr})`;
}

/**
 * Format accounting period date range using clean en dash.
 */
export function formatAccountingPeriodDateRange(
  startDate?: string | null,
  endDate?: string | null
): string {
  const start = formatFinanceDate(startDate);
  const end = formatFinanceDate(endDate);
  if (start === "-" && end === "-") return "—";
  return `${start} – ${end}`;
}

/**
 * Format closing timestamp if available.
 */
export function formatAccountingPeriodClosedAt(
  closedAt?: string | null
): string {
  if (!closedAt) return "—";
  return formatFinanceDateTime(closedAt);
}
