import http from '../lib/http';
import type {
  Account,
  AccountPayload,
  AccountFilterParams,
  AccountSummary,
  AccountListResponse,
  JournalEntry,
  JournalEntryPayload,
  JournalFilterParams,
  GeneralLedgerResponse,
  GeneralLedgerFilterParams,
  TrialBalanceResponse,
  TrialBalanceFilterParams,
  BalanceSheetResponse,
  ActivityStatementResponse,
  StatementFilterParams,
  WaqfAssetReportResponse,
  WaqfAssetRegisterResponse,
  WaqfAssetItem,
  WaqfAssetFilterParams,
  FinancialNote,
  FinancialNoteSummary,
  FinancialNotePayload,
  FinancialNoteFilterParams,
  AccountingPeriod,
  PeriodCloseResult,
  ReconciliationSummary,
  ReconciliationReport,
  ImportPreviewResponse,
  ImportConfirmResponse,
  AccountsImportPreviewData,
  JournalImportPreviewData,
  OpeningBalanceImportPreviewData,
  ImportHistoryItem,
  ImportHistoryDetail,
  PaginatedFinanceResponse,
  ProgramOption,
} from '../types/finance';

/**
 * Finance Service Layer
 * Interfacing directly with Laravel Finance API (/api/v1/finance/*)
 */
const financeService = {
  // ==========================================
  // 0. CHART OF ACCOUNTS (COA)
  // ==========================================
  getAccounts: async (params?: AccountFilterParams): Promise<AccountListResponse> => {
    const res = await http.get<{
      success?: boolean;
      data: Account[] | PaginatedFinanceResponse<Account>;
      summary?: AccountSummary;
    }>('/finance/accounts', { params });
    return res.data;
  },

  getAccount: async (id: number) => {
    const res = await http.get<{
      success?: boolean;
      data: Account;
    }>(`/finance/accounts/${id}`);
    return res.data.data;
  },

  createAccount: async (payload: AccountPayload) => {
    const res = await http.post<{
      success: boolean;
      message: string;
      data: Account;
    }>('/finance/accounts', payload, { skipErrorRedirect: true });
    return res.data;
  },

  updateAccount: async (id: number, payload: Partial<AccountPayload>) => {
    const res = await http.put<{
      success: boolean;
      message: string;
      data: Account;
    }>(`/finance/accounts/${id}`, payload, { skipErrorRedirect: true });
    return res.data;
  },

  deleteAccount: async (id: number) => {
    const res = await http.delete<{
      success: boolean;
      message: string;
    }>(`/finance/accounts/${id}`, { skipErrorRedirect: true });
    return res.data;
  },

  // ==========================================
  // 1. JOURNALS
  // ==========================================
  getJournals: async (params?: JournalFilterParams) => {
    const res = await http.get<{ data?: PaginatedFinanceResponse<JournalEntry> } & PaginatedFinanceResponse<JournalEntry>>('/finance/journals', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as PaginatedFinanceResponse<JournalEntry>;
  },

  getJournal: async (id: number) => {
    const res = await http.get<{ data?: JournalEntry } & Partial<JournalEntry>>(`/finance/journals/${id}`);
    const data = res.data.data ?? (res.data as JournalEntry);
    return data;
  },

  createJournal: async (payload: JournalEntryPayload) => {
    const res = await http.post<{ data: JournalEntry; message?: string }>(
      '/finance/journals',
      payload,
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  postJournal: async (id: number) => {
    const res = await http.post<{ message: string; data?: JournalEntry }>(
      `/finance/journals/${id}/post`,
      {},
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  voidJournal: async (id: number, reason?: string) => {
    const res = await http.post<{ message: string; data?: JournalEntry }>(
      `/finance/journals/${id}/void`,
      { reason },
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  reverseJournal: async (id: number, reason?: string) => {
    const res = await http.post<{ message: string; data?: JournalEntry }>(
      `/finance/journals/${id}/reverse`,
      { reason },
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  getPrograms: async (): Promise<ProgramOption[]> => {
    const res = await http.get<{ data?: ProgramOption[] } | ProgramOption[]>('/programs', {
      params: { per_page: 100 },
    });
    const list = Array.isArray(res.data)
      ? res.data
      : (res.data as { data?: ProgramOption[] })?.data || [];
    return list;
  },

  // ==========================================
  // 2. GENERAL LEDGER (Buku Besar)
  // ==========================================
  getGeneralLedger: async (params?: GeneralLedgerFilterParams) => {
    const res = await http.get<{ data?: GeneralLedgerResponse } & GeneralLedgerResponse>('/finance/general-ledger', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as GeneralLedgerResponse;
  },

  // ==========================================
  // 3. TRIAL BALANCE (Neraca Saldo)
  // ==========================================
  getTrialBalance: async (params?: TrialBalanceFilterParams) => {
    const res = await http.get<{ data?: TrialBalanceResponse } & TrialBalanceResponse>('/finance/trial-balance', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as TrialBalanceResponse;
  },

  // ==========================================
  // 4. FINANCIAL STATEMENTS
  // ==========================================
  getBalanceSheet: async (params?: StatementFilterParams) => {
    const res = await http.get<{ data?: BalanceSheetResponse } & BalanceSheetResponse>('/finance/balance-sheet', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as BalanceSheetResponse;
  },

  getActivityStatement: async (params?: StatementFilterParams) => {
    const res = await http.get<{ data?: ActivityStatementResponse } & ActivityStatementResponse>('/finance/activity-statement', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as ActivityStatementResponse;
  },

  // ==========================================
  // 5. WAQF ASSETS & DEPRECIATION (LRAW)
  // ==========================================
  getWaqfAssetReport: async (params?: WaqfAssetFilterParams) => {
    const res = await http.get<{ data?: WaqfAssetReportResponse } & WaqfAssetReportResponse>('/finance/waqf-assets-report', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as WaqfAssetReportResponse;
  },

  getWaqfAssetRegister: async (params?: WaqfAssetFilterParams & { page?: number; per_page?: number }) => {
    const res = await http.get<{ data?: WaqfAssetItem[] } & WaqfAssetRegisterResponse>('/finance/waqf-assets-register', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as WaqfAssetItem[];
  },

  getWaqfAssetDetail: async (id: number, params?: { period_id?: number; accounting_period_id?: number }) => {
    const res = await http.get<{ data?: WaqfAssetItem } & WaqfAssetItem>(`/finance/waqf-assets/${id}`, {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as WaqfAssetItem;
  },

  // ==========================================
  // 6. FINANCIAL NOTES (CLK)
  // ==========================================
  getFinancialNotes: async (params?: FinancialNoteFilterParams) => {
    const res = await http.get<{ data?: FinancialNote[] } & FinancialNote[]>('/finance/financial-notes', {
      params,
    });
    const data = (Array.isArray(res.data) ? res.data : (res.data as { data?: FinancialNote[] })?.data) || [];
    return data as FinancialNote[];
  },

  getFinancialNotesSummary: async (params?: { period_id?: number | ''; accounting_period_id?: number | '' }) => {
    const res = await http.get<{ data?: FinancialNoteSummary } & FinancialNoteSummary>('/finance/financial-notes/summary', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as FinancialNoteSummary;
  },

  getFinancialNote: async (id: number) => {
    const res = await http.get<{ data?: FinancialNote } & FinancialNote>(`/finance/financial-notes/${id}`);
    const data = res.data?.data ?? res.data;
    return data as FinancialNote;
  },

  createFinancialNote: async (payload: FinancialNotePayload) => {
    const res = await http.post<{ data: FinancialNote; message: string }>(
      '/finance/financial-notes',
      payload,
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  updateFinancialNote: async (id: number, payload: Partial<FinancialNotePayload>) => {
    const res = await http.put<{ data: FinancialNote; message: string }>(
      `/finance/financial-notes/${id}`,
      payload,
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  deleteFinancialNote: async (id: number) => {
    const res = await http.delete<{ message: string }>(`/finance/financial-notes/${id}`, {
      skipErrorRedirect: true,
    });
    return res.data;
  },

  // ==========================================
  // 7. ACCOUNTING PERIOD & CLOSING CONTROL
  // ==========================================
  getAccountingPeriods: async () => {
    const res = await http.get<{ data?: AccountingPeriod[] } & AccountingPeriod[]>('/finance/accounting-periods');
    const data = (Array.isArray(res.data) ? res.data : (res.data as { data?: AccountingPeriod[] })?.data) || [];
    return data as AccountingPeriod[];
  },

  getAccountingPeriod: async (id: number) => {
    const res = await http.get<{ data?: AccountingPeriod } & AccountingPeriod>(`/finance/accounting-periods/${id}`);
    const data = (res.data as { data?: AccountingPeriod })?.data ?? res.data;
    return data as AccountingPeriod;
  },

  closeAccountingPeriod: async (id: number, closingNotes?: string) => {
    const res = await http.post<PeriodCloseResult>(
      `/finance/accounting-periods/${id}/close`,
      { closing_notes: closingNotes },
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  // ==========================================
  // 8. FINANCE RECONCILIATION & CONTROL
  // ==========================================
  getReconciliationSummary: async (params?: { period_id?: number }) => {
    const res = await http.get<{ data?: ReconciliationSummary } & ReconciliationSummary>('/finance/reconciliation/summary', {
      params,
    });
    const data = res.data?.data ?? res.data;
    return data as ReconciliationSummary;
  },

  getReconciliationReport: async (params?: { period_id?: number; start_date?: string; end_date?: string }): Promise<ReconciliationReport> => {
    const res = await http.get<{ data?: ReconciliationReport } & ReconciliationReport>('/finance/reconciliation', {
      params,
    });
    const data = (res.data?.data ?? res.data) as ReconciliationReport;
    if (!data.last_checked_at) {
      data.last_checked_at = new Date().toISOString();
    }
    return data;
  },

  // ==========================================
  // 9. EXCEL EXPORTS (Download Blobs)
  // ==========================================
  exportAccounts: async (params?: Record<string, string>) => {
    const res = await http.get('/finance/export/accounts', { params, responseType: 'blob' });
    return res.data;
  },

  exportJournals: async (params?: Record<string, string>) => {
    const res = await http.get('/finance/export/journals', { params, responseType: 'blob' });
    return res.data;
  },

  exportGeneralLedger: async (params?: Record<string, string>) => {
    const res = await http.get('/finance/export/general-ledger', { params, responseType: 'blob' });
    return res.data;
  },

  exportTrialBalance: async (params?: Record<string, string>) => {
    const res = await http.get('/finance/export/trial-balance', { params, responseType: 'blob' });
    return res.data;
  },

  exportBalanceSheet: async (params?: Record<string, string>) => {
    const res = await http.get('/finance/export/balance-sheet', { params, responseType: 'blob' });
    return res.data;
  },

  exportActivityStatement: async (params?: Record<string, string>) => {
    const res = await http.get('/finance/export/activity-statement', { params, responseType: 'blob' });
    return res.data;
  },

  exportWaqfAssets: async (params?: Record<string, string>) => {
    const res = await http.get('/finance/export/waqf-assets', { params, responseType: 'blob' });
    return res.data;
  },

  exportFinancialNotes: async (params?: Record<string, string>) => {
    const res = await http.get('/finance/export/financial-notes', { params, responseType: 'blob' });
    return res.data;
  },

  exportAnnualPackage: async (year: number) => {
    const res = await http.get('/finance/export/annual-package', {
      params: { year },
      responseType: 'blob',
    });
    return res.data;
  },

  // ==========================================
  // 10. EXCEL IMPORTS (Accounts, Journals, Opening Balance)
  // ==========================================
  getAccountsTemplate: async () => {
    const res = await http.get('/finance/import/accounts/template', { responseType: 'blob' });
    return res.data;
  },

  previewAccountsImport: async (formData: FormData) => {
    const res = await http.post<ImportPreviewResponse<AccountsImportPreviewData>>(
      '/finance/import/accounts/preview',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipErrorRedirect: true,
      }
    );
    return res.data;
  },

  confirmAccountsImport: async (payload: { batch_token: string } | FormData) => {
    const res = await http.post<ImportConfirmResponse>(
      '/finance/import/accounts/confirm',
      payload,
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  getJournalsTemplate: async () => {
    const res = await http.get('/finance/import/journals/template', { responseType: 'blob' });
    return res.data;
  },

  previewJournalsImport: async (formData: FormData) => {
    const res = await http.post<ImportPreviewResponse<JournalImportPreviewData>>(
      '/finance/import/journals/preview',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipErrorRedirect: true,
      }
    );
    return res.data;
  },

  confirmJournalsImport: async (payload: { batch_token: string } | FormData) => {
    const res = await http.post<ImportConfirmResponse>(
      '/finance/import/journals/confirm',
      payload,
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  getOpeningBalanceTemplate: async () => {
    const res = await http.get('/finance/import/opening-balance/template', { responseType: 'blob' });
    return res.data;
  },

  previewOpeningBalanceImport: async (formData: FormData) => {
    const res = await http.post<ImportPreviewResponse<OpeningBalanceImportPreviewData>>(
      '/finance/import/opening-balance/preview',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipErrorRedirect: true,
      }
    );
    return res.data;
  },

  confirmOpeningBalanceImport: async (payload: { batch_token: string; accounting_period_id?: number; period_id?: number } | FormData) => {
    const res = await http.post<ImportConfirmResponse>(
      '/finance/import/opening-balance/confirm',
      payload,
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  getImportHistory: async (params?: { page?: number; per_page?: number; type?: string; module?: string }) => {
    const res = await http.get<ImportHistoryItem[] | PaginatedFinanceResponse<ImportHistoryItem>>('/finance/import/history', {
      params,
    });
    return res.data;
  },

  getImportHistoryDetail: async (id: number) => {
    const res = await http.get<ImportHistoryDetail>(
      `/finance/import/history/${id}`
    );
    return res.data;
  },
};

export default financeService;
