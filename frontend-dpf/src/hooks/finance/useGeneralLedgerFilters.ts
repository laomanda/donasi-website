import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { GeneralLedgerFilterState } from "@/utils/finance/generalLedgerQuery";

export interface UseGeneralLedgerFiltersReturn {
  filters: GeneralLedgerFilterState;
  accountId: number | "";
  periodId: number | "";
  startDate: string;
  endDate: string;
  includeZeroBalance: boolean;
  isFilterActive: boolean;
  isAccountSelected: boolean;
  overviewSearch: string;
  overviewPage: number;
  setAccountId: (id: number | "") => void;
  setPeriodId: (id: number | "") => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setIncludeZeroBalance: (val: boolean) => void;
  setOverviewSearch: (q: string) => void;
  setOverviewPage: (page: number | ((prev: number) => number)) => void;
  selectAccount: (id: number) => void;
  clearAccount: () => void;
  resetFilters: () => void;
}

export function useGeneralLedgerFilters(): UseGeneralLedgerFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL
  const initialAccountId = searchParams.get("account_id");
  const initialPeriodId = searchParams.get("period_id");
  const initialStartDate = searchParams.get("start_date") || "";
  const initialEndDate = searchParams.get("end_date") || "";
  const initialZero = searchParams.get("include_zero_balance") === "1" || searchParams.get("include_zero_balance") === "true";

  const [accountId, setAccountIdState] = useState<number | "">(
    initialAccountId ? Number(initialAccountId) : ""
  );
  const [periodId, setPeriodIdState] = useState<number | "">(
    initialPeriodId ? Number(initialPeriodId) : ""
  );
  const [startDate, setStartDateState] = useState<string>(initialStartDate);
  const [endDate, setEndDateState] = useState<string>(initialEndDate);
  const [includeZeroBalance, setIncludeZeroBalanceState] = useState<boolean>(initialZero);

  // Client-side search and pagination for Mode B (Overview mode)
  const [overviewSearch, setOverviewSearchState] = useState<string>("");
  const [overviewPage, setOverviewPage] = useState<number>(1);

  // Sync URL search params whenever filter states change
  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (accountId !== "") {
      nextParams.set("account_id", String(accountId));
    }
    if (periodId !== "") {
      nextParams.set("period_id", String(periodId));
    }
    if (startDate.trim()) {
      nextParams.set("start_date", startDate.trim());
    }
    if (endDate.trim()) {
      nextParams.set("end_date", endDate.trim());
    }
    if (includeZeroBalance) {
      nextParams.set("include_zero_balance", "1");
    }

    // Only update searchParams if string representation changed to avoid loops
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [accountId, periodId, startDate, endDate, includeZeroBalance, searchParams, setSearchParams]);

  // Synchronize state when user navigates using browser back / forward
  useEffect(() => {
    const pAcc = searchParams.get("account_id");
    const pPeriod = searchParams.get("period_id");
    const pStart = searchParams.get("start_date") || "";
    const pEnd = searchParams.get("end_date") || "";
    const pZero = searchParams.get("include_zero_balance") === "1" || searchParams.get("include_zero_balance") === "true";

    const nextAcc = pAcc ? Number(pAcc) : "";
    const nextPeriod = pPeriod ? Number(pPeriod) : "";

    setAccountIdState((prev) => (prev !== nextAcc ? nextAcc : prev));
    setPeriodIdState((prev) => (prev !== nextPeriod ? nextPeriod : prev));
    setStartDateState((prev) => (prev !== pStart ? pStart : prev));
    setEndDateState((prev) => (prev !== pEnd ? pEnd : prev));
    setIncludeZeroBalanceState((prev) => (prev !== pZero ? pZero : prev));
  }, [searchParams]);

  const setAccountId = useCallback((id: number | "") => {
    setAccountIdState(id);
    setOverviewPage(1);
  }, []);

  const selectAccount = useCallback((id: number) => {
    setAccountIdState(id);
  }, []);

  const clearAccount = useCallback(() => {
    setAccountIdState("");
    setOverviewPage(1);
  }, []);

  const setPeriodId = useCallback((id: number | "") => {
    setPeriodIdState(id);
    setOverviewPage(1);
  }, []);

  const setStartDate = useCallback((date: string) => {
    setStartDateState(date);
    setOverviewPage(1);
  }, []);

  const setEndDate = useCallback((date: string) => {
    setEndDateState(date);
    setOverviewPage(1);
  }, []);

  const setIncludeZeroBalance = useCallback((val: boolean) => {
    setIncludeZeroBalanceState(val);
    setOverviewPage(1);
  }, []);

  const setOverviewSearch = useCallback((q: string) => {
    setOverviewSearchState(q);
    setOverviewPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setAccountIdState("");
    setPeriodIdState("");
    setStartDateState("");
    setEndDateState("");
    setIncludeZeroBalanceState(false);
    setOverviewSearchState("");
    setOverviewPage(1);
  }, []);

  const isFilterActive = useMemo(() => {
    return Boolean(
      accountId !== "" ||
        periodId !== "" ||
        startDate ||
        endDate ||
        includeZeroBalance
    );
  }, [accountId, periodId, startDate, endDate, includeZeroBalance]);

  const isAccountSelected = accountId !== "";

  const filters = useMemo<GeneralLedgerFilterState>(
    () => ({
      accountId,
      periodId,
      startDate,
      endDate,
      includeZeroBalance,
    }),
    [accountId, periodId, startDate, endDate, includeZeroBalance]
  );

  return {
    filters,
    accountId,
    periodId,
    startDate,
    endDate,
    includeZeroBalance,
    isFilterActive,
    isAccountSelected,
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
  };
}

export default useGeneralLedgerFilters;
