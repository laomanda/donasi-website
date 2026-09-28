/**
 * YWDP Digital Waqf - Finance Module Types
 * Source of Truth: Backend Phase 5.1 - 5.7 Laravel Models & API Resources
 */

// ==========================================
// 1. ACCOUNT (Chart of Accounts / COA)
// ==========================================
export type AccountType = 'asset' | 'liability' | 'net_asset' | 'equity' | 'revenue' | 'expense';

export type NormalBalance = 'debit' | 'credit';

export interface AccountParentSummary {
  id: number;
  code: string;
  name: string;
  account_type?: AccountType;
  level?: number;
}

export interface Account {
  id: number;
  code: string;
  name: string;
  account_type: AccountType;
  type?: AccountType; // backward-compatibility alias
  normal_balance: NormalBalance;
  parent_id?: number | null;
  parent?: AccountParentSummary | null;
  level: number;
  report_category?: string | null;
  is_active: boolean;
  description?: string | null;
  children_count?: number;
  journal_entry_lines_count?: number;
  children?: Account[];
  opening_balance?: number;
  current_balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AccountSummary {
  total: number;
  active: number;
  inactive: number;
  asset: number;
  liability: number;
  net_asset: number;
  revenue: number;
  expense: number;
}

export interface AccountPayload {
  code: string;
  name: string;
  account_type: AccountType;
  normal_balance: NormalBalance;
  parent_id?: number | null;
  report_category?: string | null;
  is_active?: boolean;
}

export interface AccountFilterParams {
  q?: string;
  account_type?: AccountType | '';
  is_active?: boolean | string | '';
  level?: number;
  parent_id?: number;
  page?: number;
  per_page?: number | string;
  all?: boolean | string;
  tree?: boolean | string;
}

export interface AccountListResponse {
  data: Account[] | PaginatedFinanceResponse<Account>;
  summary?: AccountSummary;
  success?: boolean;
}

// ==========================================
// 2. JOURNAL ENTRY & LINES
// ==========================================
export type JournalStatus = 'draft' | 'posted' | 'void';

export interface ProgramOption {
  id: number;
  title: string;
  slug?: string;
}

export interface JournalEntryLine {
  id?: number;
  journal_entry_id?: number;
  account_id: number;
  account?: Account;
  debit: number | string;
  credit: number | string;
  description?: string | null;
  memo?: string | null;
}

export interface JournalEntry {
  id: number;
  journal_number: string;
  transaction_date?: string;
  date?: string; // compatibility
  accounting_period_id?: number;
  accounting_period?: AccountingPeriod;
  reference_type?: string | null;
  reference_id?: number | null;
  program_id?: number | null;
  program?: ProgramOption | null;
  description: string;
  status: JournalStatus;
  created_by?: number | null;
  creator?: { id: number; name: string; email?: string } | null;
  posted_at?: string | null;
  posted_by?: number | null;
  voided_at?: string | null;
  voided_by?: number | null;
  reversed_by_id?: number | null;
  reversal_of_id?: number | null;
  lines?: JournalEntryLine[];
  total_debit?: number;
  total_credit?: number;
  is_balanced?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface JournalLinePayload {
  account_id: number;
  debit: number;
  credit: number;
  description?: string;
  memo?: string;
}

export interface JournalEntryPayload {
  transaction_date: string;
  date?: string;
  accounting_period_id?: number | null;
  description: string;
  reference_type?: string;
  reference_id?: number | null;
  program_id?: number | null;
  status?: 'draft' | 'posted';
  journal_lines: JournalLinePayload[];
  lines?: JournalLinePayload[];
}

export interface JournalFilterParams {
  page?: number;
  per_page?: number;
  q?: string;
  status?: JournalStatus | '';
  period_id?: number | '';
  date_from?: string;
  date_to?: string;
  account_id?: number | '';
}

// ==========================================
// 3. GENERAL LEDGER (Buku Besar)
// ==========================================
export interface GeneralLedgerLine {
  id: number;
  date: string;
  journal_number: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference_type?: string | null;
  reference_id?: number | null;
}

export interface GeneralLedgerAccount {
  account_id: number;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  normal_balance: NormalBalance;
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  ending_balance: number;
  entries: GeneralLedgerLine[];
}

export interface GeneralLedgerResponse {
  period_from: string;
  period_to: string;
  accounts: GeneralLedgerAccount[];
}

export interface GeneralLedgerFilterParams {
  account_id?: number | '';
  date_from?: string;
  date_to?: string;
  q?: string;
}

// ==========================================
// 4. TRIAL BALANCE (Neraca Saldo)
// ==========================================
export interface TrialBalanceItem {
  account_id: number;
  code: string;
  name: string;
  type: AccountType;
  normal_balance: NormalBalance;
  opening_debit: number;
  opening_credit: number;
  movement_debit: number;
  movement_credit: number;
  ending_debit: number;
  ending_credit: number;
}

export interface TrialBalanceResponse {
  period_from?: string;
  period_to?: string;
  start_date?: string;
  end_date?: string;
  total_debit?: number;
  total_credit?: number;
  total_debit_balance?: number;
  total_credit_balance?: number;
  is_balanced: boolean;
  data?: TrialBalanceItem[];
  accounts?: TrialBalanceItem[];
  totals?: {
    opening_debit: number;
    opening_credit: number;
    movement_debit: number;
    movement_credit: number;
    ending_debit: number;
    ending_credit: number;
    is_balanced: boolean;
  };
}

export interface TrialBalanceFilterParams {
  period_id?: number;
  date_from?: string;
  date_to?: string;
  start_date?: string;
  end_date?: string;
  include_zero?: boolean;
  include_zero_balance?: boolean;
}

// ==========================================
// 5. FINANCIAL STATEMENTS
// ==========================================
export interface StatementLineItem {
  account_id?: number | null;
  code: string;
  name: string;
  amount: number;
  balance?: number;
  report_category?: string;
}

export interface StatementSection {
  title: string;
  items: StatementLineItem[];
  subtotal: number;
}

export interface BalanceSheetResponse {
  as_of_date?: string;
  start_date?: string;
  end_date?: string;
  assets?: StatementSection[] | StatementLineItem[];
  total_assets: number;
  total_asset?: number;
  liabilities?: StatementSection[] | StatementLineItem[];
  total_liabilities: number;
  total_liability?: number;
  net_assets?: StatementSection[] | StatementLineItem[];
  equity?: StatementSection[] | StatementLineItem[];
  total_net_assets?: number;
  total_net_asset?: number;
  total_equity?: number;
  total_liabilities_and_equity?: number;
  current_period_surplus?: number;
  is_balanced: boolean;
}

export interface ActivityStatementResponse {
  period_from?: string;
  period_to?: string;
  start_date?: string;
  end_date?: string;
  revenues?: StatementSection[] | StatementLineItem[];
  total_revenues: number;
  total_penerimaan?: number;
  expenses?: StatementSection[] | StatementLineItem[];
  total_expenses: number;
  total_beban?: number;
  surplus_deficit?: number;
  net_surplus_deficit?: number;
  is_surplus: boolean;
}

export interface StatementFilterParams {
  period_id?: number;
  as_of_date?: string;
  date_from?: string;
  date_to?: string;
  start_date?: string;
  end_date?: string;
}

// ==========================================
// 6. WAQF ASSETS & DEPRECIATION
// ==========================================
export interface WaqfAssetItem {
  id: number;
  asset_code: string;
  name: string;
  category: string;
  acquisition_date: string;
  acquisition_cost: number;
  useful_life_years: number;
  accumulated_depreciation: number;
  book_value: number;
  condition: string;
  location?: string | null;
  status: 'active' | 'disposed' | 'under_maintenance';
}

export interface WaqfAssetReportResponse {
  as_of_date: string;
  summary: {
    total_assets_count: number;
    total_acquisition_cost: number;
    total_accumulated_depreciation: number;
    total_book_value: number;
  };
  categories: Array<{
    category: string;
    count: number;
    acquisition_cost: number;
    book_value: number;
  }>;
}

export interface WaqfAssetRegisterResponse {
  data: WaqfAssetItem[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

// ==========================================
// 7. FINANCIAL NOTES (CALK)
// ==========================================
export interface FinancialNote {
  id: number;
  note_number: string;
  title: string;
  category: string;
  content: string;
  related_account_id?: number | null;
  related_account?: Account;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialNoteSummary {
  total_notes: number;
  categories_count: number;
  categories: string[];
}

export interface FinancialNotePayload {
  note_number: string;
  title: string;
  category: string;
  content: string;
  related_account_id?: number | null;
  order?: number;
}

// ==========================================
// 8. ACCOUNTING PERIOD & CLOSING CONTROL
// ==========================================
export type AccountingPeriodStatus = 'open' | 'closed';

export interface AccountingPeriod {
  id: number;
  year?: number;
  month?: number;
  name?: string;
  period_name: string;
  period_type?: string;
  status: AccountingPeriodStatus;
  start_date: string;
  end_date: string;
  is_closed?: boolean;
  closed_at?: string | null;
  closed_by?: number | null;
  closer?: { id: number; name: string } | null;
  closing_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PeriodCloseResult {
  success: boolean;
  message: string;
  period?: AccountingPeriod;
  closing_summary?: {
    total_revenue: number;
    total_expense: number;
    net_surplus_deficit: number;
    closing_journal_id?: number;
  };
}

// ==========================================
// 9. FINANCE RECONCILIATION & CONTROL (14 Controls)
// ==========================================
export type ReconciliationControlStatus = 'balanced' | 'warning' | 'anomaly';

export interface ReconciliationControlItem {
  key?: string;
  id?: string;
  code?: string;
  name: string;
  description?: string;
  status: ReconciliationControlStatus | string;
  source_amount?: number;
  ledger_amount?: number;
  variance?: number;
  last_checked_at?: string;
  notes?: string | null;
}

export interface ReconciliationSummary {
  total_controls?: number;
  total_checks?: number;
  passed_checks?: number;
  failed_checks?: number;
  balanced_controls?: number;
  warning_controls?: number;
  anomaly_controls?: number;
  critical_errors?: number;
  high_errors?: number;
  warnings?: number;
  overall_status: 'healthy' | 'needs_attention' | 'critical' | 'reconciled' | 'reconciled_with_warnings' | 'critical_unreconciled' | string;
  checked_at?: string;
  last_checked_at?: string;
  controls?: ReconciliationControlItem[];
  checks?: ReconciliationControlItem[];
}

// ==========================================
// 10. IMPORT & EXPORT
// ==========================================
export interface ImportBatch {
  id: number;
  batch_number: string;
  type: 'accounts' | 'journals' | 'opening_balance';
  filename: string;
  status: 'pending' | 'previewed' | 'confirmed' | 'failed';
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  created_by?: number | null;
  creator?: { id: number; name: string } | null;
  created_at: string;
}

export interface ImportErrorItem {
  row: number;
  column?: string;
  value?: string;
  message: string;
}

export interface ImportPreviewResponse {
  batch_id: number;
  batch_number: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  errors: ImportErrorItem[];
  preview_data: Record<string, unknown>[];
}

export interface ImportConfirmResponse {
  success: boolean;
  message: string;
  batch_id: number;
  imported_count: number;
}

// ==========================================
// 11. GENERIC PAGINATED RESPONSE
// ==========================================
export interface PaginatedFinanceResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorRedirect?: boolean;
  }
}

