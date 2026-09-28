import http from '../lib/http';
import type {
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
  FinancialNote,
  FinancialNoteSummary,
  FinancialNotePayload,
  AccountingPeriod,
  PeriodCloseResult,
  ReconciliationSummary,
  ImportBatch,
  ImportPreviewResponse,
  ImportConfirmResponse,
  PaginatedFinanceResponse,
} from '../types/finance';

/**
 * Finance Service Layer
 * Interfacing directly with Laravel Finance API (/api/v1/finance/*)
 */
const financeService = {
  // ==========================================
  // 1. JOURNALS
  // ==========================================
  getJournals: async (params?: JournalFilterParams) => {
    const res = await http.get<PaginatedFinanceResponse<JournalEntry>>('/finance/journals', {
      params,
    });
    return res.data;
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

  // ==========================================
  // 2. GENERAL LEDGER (Buku Besar)
  // ==========================================
  getGeneralLedger: async (params?: GeneralLedgerFilterParams) => {
    const res = await http.get<GeneralLedgerResponse>('/finance/general-ledger', {
      params,
    });
    return res.data;
  },

  // ==========================================
  // 3. TRIAL BALANCE (Neraca Saldo)
  // ==========================================
  getTrialBalance: async (params?: TrialBalanceFilterParams) => {
    const res = await http.get<TrialBalanceResponse>('/finance/trial-balance', {
      params,
    });
    return res.data;
  },

  // ==========================================
  // 4. FINANCIAL STATEMENTS
  // ==========================================
  getBalanceSheet: async (params?: StatementFilterParams) => {
    const res = await http.get<BalanceSheetResponse>('/finance/balance-sheet', {
      params,
    });
    return res.data;
  },

  getActivityStatement: async (params?: StatementFilterParams) => {
    const res = await http.get<ActivityStatementResponse>('/finance/activity-statement', {
      params,
    });
    return res.data;
  },

  // ==========================================
  // 5. WAQF ASSETS & DEPRECIATION
  // ==========================================
  getWaqfAssetReport: async (params?: { as_of_date?: string }) => {
    const res = await http.get<WaqfAssetReportResponse>('/finance/waqf-assets-report', {
      params,
    });
    return res.data;
  },

  getWaqfAssetRegister: async (params?: { page?: number; per_page?: number }) => {
    const res = await http.get<WaqfAssetRegisterResponse>('/finance/waqf-assets-register', {
      params,
    });
    return res.data;
  },

  getWaqfAssetDetail: async (id: number) => {
    const res = await http.get<{ data?: WaqfAssetItem } & Partial<WaqfAssetItem>>(`/finance/waqf-assets/${id}`);
    const data = res.data.data ?? (res.data as WaqfAssetItem);
    return data;
  },

  // ==========================================
  // 6. FINANCIAL NOTES (CALK)
  // ==========================================
  getFinancialNotes: async (params?: { category?: string; q?: string }) => {
    const res = await http.get<FinancialNote[]>('/finance/financial-notes', {
      params,
    });
    return res.data;
  },

  getFinancialNotesSummary: async () => {
    const res = await http.get<FinancialNoteSummary>('/finance/financial-notes/summary');
    return res.data;
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
    const res = await http.get<AccountingPeriod[]>('/finance/accounting-periods');
    return res.data;
  },

  getAccountingPeriod: async (id: number) => {
    const res = await http.get<AccountingPeriod>(`/finance/accounting-periods/${id}`);
    return res.data;
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
  getReconciliationSummary: async () => {
    const res = await http.get<ReconciliationSummary>('/finance/reconciliation/summary');
    return res.data;
  },

  getReconciliationReport: async (params?: { date?: string }) => {
    const res = await http.get<{ data: ReconciliationSummary }>('/finance/reconciliation', {
      params,
    });
    return res.data;
  },

  // ==========================================
  // 9. EXCEL EXPORTS (Download Blobs)
  // ==========================================
  exportAccounts: async () => {
    const res = await http.get('/finance/export/accounts', { responseType: 'blob' });
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
    const res = await http.post<ImportPreviewResponse>('/finance/import/accounts/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipErrorRedirect: true,
    });
    return res.data;
  },

  confirmAccountsImport: async (batchId: number) => {
    const res = await http.post<ImportConfirmResponse>(
      '/finance/import/accounts/confirm',
      { batch_id: batchId },
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  getJournalsTemplate: async () => {
    const res = await http.get('/finance/import/journals/template', { responseType: 'blob' });
    return res.data;
  },

  previewJournalsImport: async (formData: FormData) => {
    const res = await http.post<ImportPreviewResponse>('/finance/import/journals/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      skipErrorRedirect: true,
    });
    return res.data;
  },

  confirmJournalsImport: async (batchId: number) => {
    const res = await http.post<ImportConfirmResponse>(
      '/finance/import/journals/confirm',
      { batch_id: batchId },
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  getOpeningBalanceTemplate: async () => {
    const res = await http.get('/finance/import/opening-balance/template', { responseType: 'blob' });
    return res.data;
  },

  previewOpeningBalanceImport: async (formData: FormData) => {
    const res = await http.post<ImportPreviewResponse>(
      '/finance/import/opening-balance/preview',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipErrorRedirect: true,
      }
    );
    return res.data;
  },

  confirmOpeningBalanceImport: async (batchId: number) => {
    const res = await http.post<ImportConfirmResponse>(
      '/finance/import/opening-balance/confirm',
      { batch_id: batchId },
      { skipErrorRedirect: true }
    );
    return res.data;
  },

  getImportHistory: async (params?: { page?: number; per_page?: number; type?: string }) => {
    const res = await http.get<PaginatedFinanceResponse<ImportBatch>>('/finance/import/history', {
      params,
    });
    return res.data;
  },

  getImportHistoryDetail: async (id: number) => {
    const res = await http.get<{ batch: ImportBatch; errors: Record<string, unknown>[] }>(
      `/finance/import/history/${id}`
    );
    return res.data;
  },
};

export default financeService;
