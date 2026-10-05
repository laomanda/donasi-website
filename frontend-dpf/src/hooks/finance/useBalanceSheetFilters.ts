import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { BalanceSheetFilterState } from "@/utils/finance/balanceSheetQuery";

export interface UseBalanceSheetFiltersReturn {
  filters: BalanceSheetFilterState;
  periodId: number | "";
  startDate: string;
  endDate: string;
  isFilterActive: boolean;
  setPeriodId: (id: number | "") => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  resetFilters: () => void;
}

export function useBalanceSheetFilters(): UseBalanceSheetFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial parameters from URL
  const initialPeriodId = searchParams.get("period_id");
  const initialStartDate = searchParams.get("start_date") || "";
  const initialEndDate = searchParams.get("end_date") || "";

  const [periodId, setPeriodIdState] = useState<number | "">(
    initialPeriodId ? Number(initialPeriodId) : ""
  );
  const [startDate, setStartDateState] = useState<string>(initialStartDate);
  const [endDate, setEndDateState] = useState<string>(initialEndDate);

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

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [periodId, startDate, endDate, searchParams, setSearchParams]);

  // Synchronize state when user navigates using browser back / forward
  useEffect(() => {
    const pPeriod = searchParams.get("period_id");
    const pStart = searchParams.get("start_date") || "";
    const pEnd = searchParams.get("end_date") || "";

    const nextPeriod = pPeriod ? Number(pPeriod) : "";

    setPeriodIdState((prev) => (prev !== nextPeriod ? nextPeriod : prev));
    setStartDateState((prev) => (prev !== pStart ? pStart : prev));
    setEndDateState((prev) => (prev !== pEnd ? pEnd : prev));
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

  const resetFilters = useCallback(() => {
    setPeriodIdState("");
    setStartDateState("");
    setEndDateState("");
  }, []);

  const isFilterActive = useMemo(() => {
    return Boolean(
      periodId !== "" ||
        startDate.trim() !== "" ||
        endDate.trim() !== ""
    );
  }, [periodId, startDate, endDate]);

  const filters = useMemo<BalanceSheetFilterState>(() => {
    return {
      periodId,
      startDate,
      endDate,
    };
  }, [periodId, startDate, endDate]);

  return {
    filters,
    periodId,
    startDate,
    endDate,
    isFilterActive,
    setPeriodId,
    setStartDate,
    setEndDate,
    resetFilters,
  };
}
