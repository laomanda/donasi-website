import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { TrialBalanceFilterState } from "@/utils/finance/trialBalanceQuery";

export interface UseTrialBalanceFiltersReturn {
  filters: TrialBalanceFilterState;
  periodId: number | "";
  startDate: string;
  endDate: string;
  includeZeroBalance: boolean;
  isFilterActive: boolean;
  setPeriodId: (id: number | "") => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setIncludeZeroBalance: (val: boolean) => void;
  resetFilters: () => void;
}

export function useTrialBalanceFilters(): UseTrialBalanceFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial parameters from URL
  const initialPeriodId = searchParams.get("period_id");
  const initialStartDate = searchParams.get("start_date") || "";
  const initialEndDate = searchParams.get("end_date") || "";
  const initialZero =
    searchParams.get("include_zero_balance") === "1" ||
    searchParams.get("include_zero_balance") === "true";

  const [periodId, setPeriodIdState] = useState<number | "">(
    initialPeriodId ? Number(initialPeriodId) : ""
  );
  const [startDate, setStartDateState] = useState<string>(initialStartDate);
  const [endDate, setEndDateState] = useState<string>(initialEndDate);
  const [includeZeroBalance, setIncludeZeroBalanceState] = useState<boolean>(initialZero);

  // Sync state to URL search parameters
  useEffect(() => {
    const nextParams = new URLSearchParams();

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

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [periodId, startDate, endDate, includeZeroBalance, searchParams, setSearchParams]);

  // Synchronize state when user navigates using browser back / forward
  useEffect(() => {
    const pPeriod = searchParams.get("period_id");
    const pStart = searchParams.get("start_date") || "";
    const pEnd = searchParams.get("end_date") || "";
    const pZero =
      searchParams.get("include_zero_balance") === "1" ||
      searchParams.get("include_zero_balance") === "true";

    const nextPeriod = pPeriod ? Number(pPeriod) : "";

    setPeriodIdState((prev) => (prev !== nextPeriod ? nextPeriod : prev));
    setStartDateState((prev) => (prev !== pStart ? pStart : prev));
    setEndDateState((prev) => (prev !== pEnd ? pEnd : prev));
    setIncludeZeroBalanceState((prev) => (prev !== pZero ? pZero : prev));
  }, [searchParams]);

  const setPeriodId = useCallback((id: number | "") => {
    setPeriodIdState(id);
  }, []);

  const setStartDate = useCallback((date: string) => {
    setStartDateState(date);
  }, []);

  const setEndDate = useCallback((date: string) => {
    setEndDateState(date);
  }, []);

  const setIncludeZeroBalance = useCallback((val: boolean) => {
    setIncludeZeroBalanceState(val);
  }, []);

  const resetFilters = useCallback(() => {
    setPeriodIdState("");
    setStartDateState("");
    setEndDateState("");
    setIncludeZeroBalanceState(false);
  }, []);

  const isFilterActive = useMemo(() => {
    return Boolean(
      periodId !== "" ||
        startDate.trim() !== "" ||
        endDate.trim() !== "" ||
        includeZeroBalance
    );
  }, [periodId, startDate, endDate, includeZeroBalance]);

  const filters = useMemo<TrialBalanceFilterState>(() => {
    return {
      periodId,
      startDate,
      endDate,
      includeZeroBalance,
    };
  }, [periodId, startDate, endDate, includeZeroBalance]);

  return {
    filters,
    periodId,
    startDate,
    endDate,
    includeZeroBalance,
    isFilterActive,
    setPeriodId,
    setStartDate,
    setEndDate,
    setIncludeZeroBalance,
    resetFilters,
  };
}
