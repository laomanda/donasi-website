import type {
  ActivityStatementResponse,
  ActivityStatementAccount,
  FinancialStatementNoteItem,
  FinancialStatementPeriod,
} from "@/types/finance";

export interface NormalizedActivityStatement {
  period: FinancialStatementPeriod | null;
  startDate: string | null;
  endDate: string | null;
  revenues: ActivityStatementAccount[];
  expenses: ActivityStatementAccount[];
  totalRevenues: number;
  totalExpenses: number;
  surplusDeficit: number;
  isSurplus: boolean;
  notes: FinancialStatementNoteItem[];
  hasData: boolean;
}

/**
 * Pure display normalizer for schema compatibility fields.
 * Strictly performs property mapping without calculating financial surplus/deficit formulas.
 */
export function normalizeActivityStatementResponse(
  raw: ActivityStatementResponse | null
): NormalizedActivityStatement {
  if (!raw) {
    return {
      period: null,
      startDate: null,
      endDate: null,
      revenues: [],
      expenses: [],
      totalRevenues: 0,
      totalExpenses: 0,
      surplusDeficit: 0,
      isSurplus: true,
      notes: [],
      hasData: false,
    };
  }

  const revenues = Array.isArray(raw.revenues) ? raw.revenues : [];
  const expenses = Array.isArray(raw.expenses) ? raw.expenses : [];

  const rawNotes = raw.financial_notes ?? raw.notes;
  const notes = Array.isArray(rawNotes) ? rawNotes : [];

  const totalRevenues = Number(raw.total_revenues ?? raw.total_penerimaan ?? 0);
  const totalExpenses = Number(raw.total_expenses ?? raw.total_beban ?? 0);
  const surplusDeficit = Number(raw.surplus_deficit ?? raw.net_surplus_deficit ?? 0);
  const isSurplus = Boolean(raw.is_surplus);

  const hasData =
    revenues.length > 0 ||
    expenses.length > 0 ||
    totalRevenues > 0 ||
    totalExpenses > 0 ||
    surplusDeficit !== 0;

  return {
    period: raw.period ?? null,
    startDate: raw.start_date ?? null,
    endDate: raw.end_date ?? null,
    revenues,
    expenses,
    totalRevenues,
    totalExpenses,
    surplusDeficit,
    isSurplus,
    notes,
    hasData,
  };
}
