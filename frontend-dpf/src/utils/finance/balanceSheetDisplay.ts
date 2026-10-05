import type {
  BalanceSheetResponse,
  BalanceSheetAccount,
  FinancialStatementNoteItem,
  FinancialStatementPeriod,
} from "@/types/finance";

export interface NormalizedBalanceSheet {
  period: FinancialStatementPeriod | null;
  startDate: string | null;
  endDate: string | null;
  assets: BalanceSheetAccount[];
  liabilities: BalanceSheetAccount[];
  netAssets: BalanceSheetAccount[];
  totalAssets: number;
  totalLiabilities: number;
  totalNetAssets: number;
  totalLiabilitiesAndEquity?: number;
  currentPeriodSurplus: number;
  isBalanced: boolean;
  notes: FinancialStatementNoteItem[];
  hasData: boolean;
}

/**
 * Pure display normalizer for schema compatibility fields.
 * Strictly performs property mapping without calculating financial formulas.
 */
export function normalizeBalanceSheetResponse(
  raw: BalanceSheetResponse | null
): NormalizedBalanceSheet {
  if (!raw) {
    return {
      period: null,
      startDate: null,
      endDate: null,
      assets: [],
      liabilities: [],
      netAssets: [],
      totalAssets: 0,
      totalLiabilities: 0,
      totalNetAssets: 0,
      currentPeriodSurplus: 0,
      isBalanced: false,
      notes: [],
      hasData: false,
    };
  }

  const assets = Array.isArray(raw.assets) ? raw.assets : [];
  const liabilities = Array.isArray(raw.liabilities) ? raw.liabilities : [];
  const netAssets = Array.isArray(raw.net_assets) ? raw.net_assets : [];

  const rawNotes = raw.financial_notes ?? raw.notes;
  const notes = Array.isArray(rawNotes) ? rawNotes : [];

  const totalAssets = Number(raw.total_assets ?? raw.total_asset ?? 0);
  const totalLiabilities = Number(raw.total_liabilities ?? raw.total_liability ?? 0);
  const totalNetAssets = Number(raw.total_net_assets ?? raw.total_net_asset ?? raw.total_equity ?? 0);

  const totalLiabilitiesAndEquity =
    raw.total_liabilities_and_equity !== undefined
      ? Number(raw.total_liabilities_and_equity)
      : undefined;

  const currentPeriodSurplus = Number(raw.current_period_surplus ?? 0);
  const isBalanced = Boolean(raw.is_balanced);

  const hasData =
    assets.length > 0 ||
    liabilities.length > 0 ||
    netAssets.length > 0 ||
    totalAssets > 0 ||
    totalLiabilities > 0 ||
    totalNetAssets > 0;

  return {
    period: raw.period ?? null,
    startDate: raw.start_date ?? null,
    endDate: raw.end_date ?? null,
    assets,
    liabilities,
    netAssets,
    totalAssets,
    totalLiabilities,
    totalNetAssets,
    totalLiabilitiesAndEquity,
    currentPeriodSurplus,
    isBalanced,
    notes,
    hasData,
  };
}
