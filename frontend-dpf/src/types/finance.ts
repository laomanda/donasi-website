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
export interface GeneralLedgerTransaction {
  journal_entry_id: number | null;
  line_id: number;
  transaction_date: string | null;
  journal_number: string | null;
  reference_type?: string | null;
  reference_id?: number | null;
  description: string | null;
  debit: number;
  credit: number;
  running_balance: number;
}

export interface GeneralLedgerAccount {
  account_id: number;
  code: string;
  name: string;
  account_type: AccountType;
  normal_balance: NormalBalance;
  report_category?: string;
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  transactions: GeneralLedgerTransaction[];
}

export interface GeneralLedgerPeriodInfo {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export interface GeneralLedgerResponse {
  period?: GeneralLedgerPeriodInfo | null;
  start_date?: string | null;
  end_date?: string | null;
  total_accounts: number;
  grand_total_debit: number;
  grand_total_credit: number;
  accounts: GeneralLedgerAccount[];
  account?: GeneralLedgerAccount | null;
}

export interface GeneralLedgerFilterParams {
  account_id?: number | '';
  period_id?: number | '';
  accounting_period_id?: number | '';
  start_date?: string;
  end_date?: string;
  include_zero_balance?: boolean;
}

// ==========================================
// 4. TRIAL BALANCE (Neraca Saldo)
// ==========================================
export interface TrialBalanceAccount {
  account_id: number;
  code: string;
  name: string;
  account_type: AccountType;
  normal_balance: NormalBalance;
  total_debit: number;
  total_credit: number;
  ending_balance: number;
  debit_balance: number;
  credit_balance: number;
}

export type TrialBalanceItem = TrialBalanceAccount;

export interface TrialBalancePeriodInfo {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export interface TrialBalanceResponse {
  period?: TrialBalancePeriodInfo | null;
  start_date?: string | null;
  end_date?: string | null;
  total_accounts: number;
  total_debit: number;
  total_credit: number;
  total_debit_balance: number;
  total_credit_balance: number;
  is_balanced: boolean;
  accounts: TrialBalanceAccount[];
  data?: TrialBalanceAccount[];
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
  period_id?: number | '';
  accounting_period_id?: number | '';
  start_date?: string;
  end_date?: string;
  include_zero_balance?: boolean;
}

// ==========================================
// 5. FINANCIAL STATEMENTS
// ==========================================
export interface FinancialStatementPeriod {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export interface BalanceSheetAccount {
  account_id: number | null;
  code: string;
  name: string;
  account_type: AccountType;
  report_category?: string;
  balance: number;
}

export interface ActivityStatementAccount {
  account_id: number;
  code: string;
  name: string;
  account_type: AccountType;
  report_category?: string;
  amount: number;
}

export interface FinancialStatementNoteItem {
  id: number;
  accounting_period_id?: number | null;
  period_id?: number | null;
  period_name?: string | null;
  title: string;
  category: string;
  category_label?: string;
  content: string;
  sort_order?: number;
  status: string;
  created_by?: number | null;
  creator_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

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
  period?: FinancialStatementPeriod | null;
  start_date?: string | null;
  end_date?: string | null;
  as_of_date?: string;
  assets: BalanceSheetAccount[];
  total_assets: number;
  total_asset?: number;
  liabilities: BalanceSheetAccount[];
  total_liabilities: number;
  total_liability?: number;
  net_assets: BalanceSheetAccount[];
  total_net_assets: number;
  total_net_asset?: number;
  total_equity?: number;
  total_liabilities_and_equity?: number;
  current_period_surplus: number;
  is_balanced: boolean;
  notes?: FinancialStatementNoteItem[];
  financial_notes?: FinancialStatementNoteItem[];
}

export interface ActivityStatementResponse {
  period?: FinancialStatementPeriod | null;
  start_date?: string | null;
  end_date?: string | null;
  period_from?: string;
  period_to?: string;
  revenues: ActivityStatementAccount[];
  total_revenues: number;
  total_penerimaan?: number;
  expenses: ActivityStatementAccount[];
  total_expenses: number;
  total_beban?: number;
  surplus_deficit: number;
  net_surplus_deficit?: number;
  is_surplus: boolean;
  notes?: FinancialStatementNoteItem[];
  financial_notes?: FinancialStatementNoteItem[];
}

export interface FinancialStatementFilterParams {
  period_id?: number | '';
  accounting_period_id?: number | '';
  start_date?: string;
  end_date?: string;
  as_of_date?: string;
  date_from?: string;
  date_to?: string;
}

export type StatementFilterParams = FinancialStatementFilterParams;

// ==========================================
// 6. WAQF ASSETS & DEPRECIATION (LRAW)
// ==========================================
export interface WaqfAssetSourceItem {
  id: number;
  source_type: string;
  amount: number;
  description?: string | null;
}

export interface WaqfAssetDepreciationItem {
  id: number;
  period_id: number;
  period_name?: string | null;
  period_end_date?: string | null;
  depreciation_expense: number;
  accumulated_depreciation: number;
  book_value: number;
}

export interface WaqfAssetItem {
  id: number;
  asset_code: string;
  asset_name?: string;
  name?: string;
  category_id?: number;
  category: string;
  wakif_id?: number | null;
  wakif?: string;
  acquisition_date: string | null;
  quantity?: number;
  useful_life_month?: number;
  useful_life_years?: number;
  acquisition_value?: number;
  acquisition_cost?: number;
  accumulated_depreciation: number;
  book_value: number;
  condition: string;
  location?: string | null;
  status: string;
  sources?: WaqfAssetSourceItem[];
  depreciation_history?: WaqfAssetDepreciationItem[];
}

export type WaqfAssetRegisterItem = WaqfAssetItem;

export interface WaqfAssetCategorySummary {
  category: string;
  count: number;
  acquisition_value: number;
  accumulated_depreciation: number;
  book_value: number;
}

export interface WaqfAssetConditionSummary {
  condition: string;
  count: number;
  book_value: number;
}

export interface WaqfAssetStatusSummary {
  status: string;
  count: number;
  book_value: number;
}

export interface WaqfAssetReportSummary {
  total_assets: number;
  total_acquisition_value: number;
  total_accumulated_depreciation: number;
  total_book_value: number;
  by_category: WaqfAssetCategorySummary[];
  by_condition: WaqfAssetConditionSummary[];
  by_status: WaqfAssetStatusSummary[];
  // Legacy aliases
  total_assets_count?: number;
  total_acquisition_cost?: number;
}

export interface WaqfAssetReportResponse {
  period?: FinancialStatementPeriod | null;
  filters?: {
    category_id?: number | null;
    period_id?: number | null;
    status?: string | null;
  };
  summary: WaqfAssetReportSummary;
  assets: WaqfAssetItem[];
  notes?: FinancialStatementNoteItem[];
  financial_notes?: FinancialStatementNoteItem[];
  as_of_date?: string;
}

export interface WaqfAssetRegisterResponse {
  data: WaqfAssetItem[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export interface WaqfAssetFilterParams {
  category_id?: number | '';
  period_id?: number | '';
  accounting_period_id?: number | '';
  status?: string | '';
}

// ==========================================
// 7. FINANCIAL NOTES (CLK)
// ==========================================
export type FinancialNoteCategory =
  | 'accounting_policy'
  | 'asset_note'
  | 'revenue_note'
  | 'expense_note'
  | 'waqf_note'
  | 'general_note';

export type FinancialNoteStatus = 'draft' | 'published';

export interface FinancialNote {
  id: number;
  accounting_period_id?: number | null;
  period_id?: number | null;
  period_name?: string | null;
  note_number?: string;
  title: string;
  category: FinancialNoteCategory | string;
  category_label?: string;
  content: string;
  related_account_id?: number | null;
  related_account?: Account;
  sort_order?: number;
  order?: number;
  status: FinancialNoteStatus | string;
  created_by?: number | null;
  creator_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialNoteCategoryCount {
  category: string;
  label: string;
  count: number;
}

export interface FinancialNoteSummary {
  period_id?: number | null;
  total_notes: number;
  categories_count?: number;
  categories?: string[];
  by_category: FinancialNoteCategoryCount[];
  by_status: {
    draft: number;
    published: number;
  };
}

export interface FinancialNotePayload {
  title: string;
  category: string;
  content: string;
  period_id?: number | null;
  accounting_period_id?: number | null;
  note_number?: string;
  sort_order?: number;
  order?: number;
  related_account_id?: number | null;
  status?: FinancialNoteStatus;
}

export interface FinancialNoteFilterParams {
  period_id?: number | '';
  accounting_period_id?: number | '';
  category?: string | '';
  status?: string | '';
  q?: string;
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
// 10. IMPORT & EXPORT MANAGEMENT
// ==========================================
export type ImportModule = 'accounts' | 'journals' | 'opening_balance';

export type ImportBatchStatus = 'completed' | 'failed' | 'processing' | 'pending';

export interface ImportErrorItem {
  row: number;
  message: string;
  data?: string | Record<string, unknown>;
  column?: string;
  value?: string;
}

export interface AccountsImportPreviewData {
  total_rows: number;
  valid_rows: number;
  failed_rows: number;
  errors: ImportErrorItem[];
  batch_token: string | null;
  preview_token: string | null;
}

export interface JournalImportPreviewData {
  total_rows: number;
  total_journals: number;
  valid_journals: number;
  failed_journals: number;
  errors: ImportErrorItem[];
  batch_token: string | null;
  preview_token: string | null;
}

export interface OpeningBalanceImportPreviewData {
  total_rows: number;
  valid_rows: number;
  failed_rows: number;
  total_debit: number;
  total_credit: number;
  errors: ImportErrorItem[];
  batch_token: string | null;
  preview_token: string | null;
}

export interface ImportPreviewResponse<T = unknown> {
  status: 'success' | 'failed';
  data: T;
  message?: string;
}

export interface ImportConfirmResponse {
  status: 'success' | 'failed';
  message?: string;
  batch_id?: number;
  total_rows?: number;
  total_journals?: number;
  success_rows?: number;
  failed_rows?: number;
  errors?: ImportErrorItem[];
  journal_id?: number;
}

export interface ImportHistoryItem {
  id: number;
  filename: string;
  file_name?: string;
  module: string;
  status: ImportBatchStatus | string;
  total_rows: number;
  total_journals?: number;
  success_rows: number;
  failed_rows: number;
  user: string;
  created_at: string;
  errors_count?: number;
}

export interface ImportHistoryDetail {
  batch: {
    id?: number;
    filename?: string;
    file_name?: string;
    module?: string;
    status: string;
    total_rows: number;
    total_journals?: number;
    success_rows: number;
    failed_rows: number;
    user?: string;
    created_at?: string;
  };
  errors: ImportErrorItem[];
}

export interface ImportBatch {
  id: number;
  batch_number?: string;
  filename: string;
  file_name?: string;
  module: string;
  status: string;
  total_rows: number;
  total_journals?: number;
  success_rows: number;
  failed_rows: number;
  user?: string;
  created_at: string;
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

