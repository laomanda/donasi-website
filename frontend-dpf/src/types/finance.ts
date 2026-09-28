/**
 * YWDP Digital Waqf - Finance Module Types
 * Source of Truth: Backend Phase 5.1 - 5.7 Laravel Models & API Resources
 */

// ==========================================
// 1. ACCOUNT (Chart of Accounts / COA)
// ==========================================
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type NormalBalance = 'debit' | 'credit';

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  normal_balance: NormalBalance;
  parent_id?: number | null;
  level?: number;
  is_active: boolean;
  description?: string | null;
  opening_balance?: number;
  current_balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AccountFilterParams {
  type?: AccountType | '';
  is_active?: boolean | '';
  q?: string;
}

// ==========================================
// 2. JOURNAL ENTRY & LINES
// ==========================================
export type JournalStatus = 'draft' | 'posted' | 'void';

export interface JournalEntryLine {
  id?: number;
  journal_entry_id?: number;
  account_id: number;
  account?: Account;
  debit: number;
  credit: number;
  memo?: string | null;
}

export interface JournalEntry {
  id: number;
  journal_number: string;
  date: string;
  reference_type?: string | null;
  reference_id?: number | null;
  description: string;
  status: JournalStatus;
  posted_at?: string | null;
  posted_by?: number | null;
  voided_at?: string | null;
  voided_by?: number | null;
  reversed_by_id?: number | null;
  reversal_of_id?: number | null;
  lines?: JournalEntryLine[];
  total_debit?: number;
  total_credit?: number;
  created_at?: string;
  updated_at?: string;
}

export interface JournalLinePayload {
  account_id: number;
  debit: number;
  credit: number;
  memo?: string | null;
}

export interface JournalEntryPayload {
  date: string;
  description: string;
  lines: JournalLinePayload[];
  auto_post?: boolean;
}

export interface JournalFilterParams {
  page?: number;
  per_page?: number;
  q?: string;
  status?: JournalStatus | '';
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
  period_from: string;
  period_to: string;
  data: TrialBalanceItem[];
  totals: {
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
  date_from?: string;
  date_to?: string;
  include_zero?: boolean;
}

// ==========================================
// 5. FINANCIAL STATEMENTS
// ==========================================
export interface StatementLineItem {
  code: string;
  name: string;
  amount: number;
}

export interface StatementSection {
  title: string;
  items: StatementLineItem[];
  subtotal: number;
}

export interface BalanceSheetResponse {
  as_of_date: string;
  assets: StatementSection[];
  total_assets: number;
  liabilities: StatementSection[];
  total_liabilities: number;
  equity: StatementSection[];
  total_equity: number;
  total_liabilities_and_equity: number;
  is_balanced: boolean;
}

export interface ActivityStatementResponse {
  period_from: string;
  period_to: string;
  revenues: StatementSection[];
  total_revenues: number;
  expenses: StatementSection[];
  total_expenses: number;
  net_surplus_deficit: number;
}

export interface StatementFilterParams {
  as_of_date?: string;
  date_from?: string;
  date_to?: string;
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
  year: number;
  month: number;
  period_name: string;
  status: AccountingPeriodStatus;
  start_date: string;
  end_date: string;
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
  key: string;
  name: string;
  description: string;
  status: ReconciliationControlStatus;
  source_amount: number;
  ledger_amount: number;
  variance: number;
  last_checked_at?: string;
  notes?: string | null;
}

export interface ReconciliationSummary {
  total_controls: number;
  balanced_controls: number;
  warning_controls: number;
  anomaly_controls: number;
  overall_status: 'healthy' | 'needs_attention' | 'critical';
  checked_at: string;
  controls: ReconciliationControlItem[];
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
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorRedirect?: boolean;
  }
}

