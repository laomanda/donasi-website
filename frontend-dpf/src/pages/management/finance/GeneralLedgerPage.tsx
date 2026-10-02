import { useState, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";

import {
  FinanceTableSkeleton,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import {
  GeneralLedgerHeader,
  GeneralLedgerFilters,
  LedgerOverviewSummary,
  LedgerOverview,
  AccountLedgerView,
} from "@/components/management/finance/general-ledger";
import { useGeneralLedgerMasterData } from "@/hooks/finance/useGeneralLedgerMasterData";
import { useGeneralLedgerFilters } from "@/hooks/finance/useGeneralLedgerFilters";
import { useGeneralLedger } from "@/hooks/finance/useGeneralLedger";
import financeService from "@/services/financeService";
import { buildGeneralLedgerExportParams } from "@/utils/finance/generalLedgerQuery";
import { extractFinanceErrorMessage, downloadBlobFile } from "@/utils/financeUtils";

const OVERVIEW_PAGE_SIZE = 10;

/**
 * Buku Besar (General Ledger) Orchestration Page.
 * Displays authoritative financial ledger data with SWR in-memory caching,
 * URL filter synchronization, and Mode A (account detail) / Mode B (all accounts overview).
 */
export function GeneralLedgerPage() {
  // 1. Master Data (reusing cached COA accounts & finance periods)
  const {
    activeAccounts,
    periods,
    refreshMasterData,
  } = useGeneralLedgerMasterData();

  // 2. Filter & URL Synchronizer Hook
  const {
    filters,
    accountId,
    periodId,
    startDate,
    endDate,
    includeZeroBalance,
    isFilterActive,
    overviewSearch,
    overviewPage,
    setAccountId,
    setPeriodId,
    setStartDate,
    setEndDate,
    setIncludeZeroBalance,
    setOverviewSearch,
    setOverviewPage,
    selectAccount,
    clearAccount,
    resetFilters,
  } = useGeneralLedgerFilters();

  // 3. Authoritative General Ledger Data Hook (SWR Cache + Dedupe + Race Protection)
  const {
    ledgerData,
    initialLoading,
    refreshing,
    error,
    refresh: refreshLedger,
  } = useGeneralLedger(filters);

  // 4. Excel Export State
  const [exporting, setExporting] = useState(false);

  // 5. Active single account ledger (Mode A: specific account selected)
  const singleAccount = useMemo(() => {
    if (!ledgerData) return null;
    if (accountId !== "") {
      return (
        ledgerData.account ||
        ledgerData.accounts.find((a) => a.account_id === Number(accountId)) ||
        ledgerData.accounts[0] ||
        null
      );
    }
    return null;
  }, [ledgerData, accountId]);

  // 6. Client search filtering for All Accounts list (Mode B)
  const filteredAccounts = useMemo(() => {
    if (!ledgerData?.accounts) return [];
    if (!overviewSearch.trim()) return ledgerData.accounts;
    const q = overviewSearch.toLowerCase().trim();
    return ledgerData.accounts.filter(
      (a) => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [ledgerData?.accounts, overviewSearch]);

  // 7. Client pagination for All Accounts list (Mode B)
  const paginatedAccounts = useMemo(() => {
    const start = (overviewPage - 1) * OVERVIEW_PAGE_SIZE;
    return filteredAccounts.slice(start, start + OVERVIEW_PAGE_SIZE);
  }, [filteredAccounts, overviewPage]);

  const totalOverviewPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / OVERVIEW_PAGE_SIZE)
  );

  // 8. Manual Refresh Handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshMasterData(), refreshLedger()]);
  }, [refreshMasterData, refreshLedger]);

  // 9. Excel Export Handler
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const exportParams = buildGeneralLedgerExportParams(filters);
      const blob = await financeService.exportGeneralLedger(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(blob as unknown as BlobPart, `Buku_Besar_${today}.xlsx`);
      toast.success("Berhasil mengunduh berkas Excel Buku Besar.");
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh Excel Buku Besar."));
    } finally {
      setExporting(false);
    }
  }, [filters]);

  const isGlobalLoading = initialLoading && !ledgerData;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <GeneralLedgerHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        isRefreshing={refreshing}
        isExporting={exporting}
        disableRefresh={isGlobalLoading}
        disableExport={isGlobalLoading}
        account={singleAccount}
        onBackToOverview={clearAccount}
      />

      {/* 2. Filter Bar */}
      <GeneralLedgerFilters
        accountId={accountId}
        periodId={periodId}
        startDate={startDate}
        endDate={endDate}
        includeZeroBalance={includeZeroBalance}
        activeAccounts={activeAccounts}
        periods={periods}
        isFilterActive={isFilterActive}
        totalAccountsCount={ledgerData?.total_accounts ?? 0}
        selectedAccountCode={singleAccount ? `${singleAccount.code} — ${singleAccount.name}` : undefined}
        selectedAccountTransactionsCount={singleAccount?.transactions.length}
        onAccountIdChange={setAccountId}
        onPeriodIdChange={setPeriodId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onIncludeZeroBalanceChange={setIncludeZeroBalance}
        onResetFilters={resetFilters}
        onClearAccount={clearAccount}
      />

      {/* 3. Main Ledger Content */}
      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat Buku Besar"
          message={error}
          onRetry={handleRefresh}
        />
      ) : isGlobalLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <FinanceTableSkeleton rows={8} cols={7} />
        </div>
      ) : singleAccount ? (
        /* MODE A: Detailed Account Ledger */
        <AccountLedgerView
          account={singleAccount}
          periodName={ledgerData?.period?.name}
          startDate={ledgerData?.start_date}
          onBackToOverview={clearAccount}
        />
      ) : ledgerData ? (
        /* MODE B: All Accounts Overview */
        <div className="space-y-4">
          <LedgerOverviewSummary data={ledgerData} />
          <LedgerOverview
            accounts={ledgerData.accounts}
            filteredAccounts={filteredAccounts}
            paginatedAccounts={paginatedAccounts}
            searchQuery={overviewSearch}
            currentPage={overviewPage}
            totalPages={totalOverviewPages}
            pageSize={OVERVIEW_PAGE_SIZE}
            isFilterActive={isFilterActive}
            onSearchChange={setOverviewSearch}
            onPageChange={setOverviewPage}
            onSelectAccount={selectAccount}
            onResetFilters={resetFilters}
          />
        </div>
      ) : null}
    </div>
  );
}

export default GeneralLedgerPage;
