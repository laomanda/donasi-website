export type CashFlowSummary = {
  total_inflow: number;
  total_inflow_count: number;
  total_outflow: number;
  total_outflow_count: number;
  net_cash_flow: number;
  disbursement_ratio: number;
};

export type ProgramBreakdown = {
  program_id: number;
  program_title: string;
  category?: string;
  target_amount?: number;
  inflow_amount: number;
  outflow_amount: number;
  remaining_balance: number;
  disbursement_ratio: number;
  status: "surplus" | "balanced" | "deficit";
};

export type CashFlowMutation = {
  id: string;
  raw_id: number;
  type: "inflow" | "outflow";
  date: string;
  code: string;
  title: string;
  subtitle: string;
  program_id?: number | null;
  program_title: string;
  amount: number;
  proof_path?: string | null;
};

export type CashFlowResponse = {
  summary: CashFlowSummary;
  program_breakdowns: ProgramBreakdown[];
  data: CashFlowMutation[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  filters: {
    date_from?: string;
    date_to?: string;
    program_id?: string | number;
    q?: string;
  };
};
