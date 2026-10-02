import type {
  BalanceSheetResponse,
  ActivityStatementResponse,
  TrialBalanceResponse,
  ReconciliationSummary,
  JournalEntry,
} from "@/types/finance";

export interface FinanceDashboardMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalNetAssets: number;
  totalRevenues: number;
  totalExpenses: number;
  surplusDeficit: number;
  isSurplus: boolean;
}

export interface FinanceDashboardData {
  balanceSheet: BalanceSheetResponse | null;
  activityStatement: ActivityStatementResponse | null;
  trialBalance: TrialBalanceResponse | null;
  reconciliation: ReconciliationSummary | null;
  recentJournals: JournalEntry[];
}

export interface FinanceDashboardSectionErrors {
  balanceSheet?: string;
  activity?: string;
  trialBalance?: string;
  reconciliation?: string;
  journals?: string;
}

/**
 * Normalizes balance sheet and activity statement responses into standard dashboard display metrics.
 * Uses authoritative response properties with defensive compatibility fallbacks.
 * DOES NOT perform synthetic accounting calculations or percentage estimates.
 */
export function normalizeFinanceMetrics(
  balanceSheet: BalanceSheetResponse | null,
  activityStatement: ActivityStatementResponse | null
): FinanceDashboardMetrics {
  const totalAssets =
    balanceSheet?.total_assets ?? balanceSheet?.total_asset ?? 0;
  const totalLiabilities =
    balanceSheet?.total_liabilities ?? balanceSheet?.total_liability ?? 0;
  const totalNetAssets =
    balanceSheet?.total_net_assets ?? balanceSheet?.total_net_asset ?? 0;

  const totalRevenues =
    activityStatement?.total_revenues ?? activityStatement?.total_penerimaan ?? 0;
  const totalExpenses =
    activityStatement?.total_expenses ?? activityStatement?.total_beban ?? 0;
  const surplusDeficit =
    activityStatement?.surplus_deficit ?? activityStatement?.net_surplus_deficit ?? 0;
  const isSurplus =
    activityStatement?.is_surplus ?? surplusDeficit >= 0;

  return {
    totalAssets,
    totalLiabilities,
    totalNetAssets,
    totalRevenues,
    totalExpenses,
    surplusDeficit,
    isSurplus,
  };
}
