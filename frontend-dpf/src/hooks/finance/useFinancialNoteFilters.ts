import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { FinancialNoteFilterState } from "@/utils/finance/financialNotesQuery";

export interface UseFinancialNoteFiltersReturn {
  filters: FinancialNoteFilterState;
  periodId: number | "";
  category: string;
  status: string;
  search: string;
  viewMode: "narrative" | "table";
  isFilterActive: boolean;
  setPeriodId: (id: number | "") => void;
  setCategory: (cat: string) => void;
  setStatus: (status: string) => void;
  setSearch: (query: string) => void;
  setViewMode: (mode: "narrative" | "table") => void;
  resetFilters: () => void;
}

export function useFinancialNoteFilters(): UseFinancialNoteFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial values from URL search params
  const initialPeriodId = searchParams.get("period_id");
  const initialCategory = searchParams.get("category") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialSearch = searchParams.get("q") || "";
  const initialView = searchParams.get("view") === "table" ? "table" : "narrative";

  const [periodId, setPeriodIdState] = useState<number | "">(
    initialPeriodId ? Number(initialPeriodId) : ""
  );
  const [category, setCategoryState] = useState<string>(initialCategory);
  const [status, setStatusState] = useState<string>(initialStatus);
  const [search, setSearchState] = useState<string>(initialSearch);
  const [viewMode, setViewModeState] = useState<"narrative" | "table">(initialView);

  // Sync state changes to URL
  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (periodId !== "") {
      nextParams.set("period_id", String(periodId));
    }
    if (category.trim()) {
      nextParams.set("category", category.trim());
    }
    if (status.trim()) {
      nextParams.set("status", status.trim());
    }
    if (search.trim()) {
      nextParams.set("q", search.trim());
    }
    if (viewMode === "table") {
      nextParams.set("view", "table");
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [periodId, category, status, search, viewMode, searchParams, setSearchParams]);

  // Synchronize state if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    const urlPeriod = searchParams.get("period_id");
    const nextPeriod = urlPeriod ? Number(urlPeriod) : "";
    if (nextPeriod !== periodId) setPeriodIdState(nextPeriod);

    const nextCategory = searchParams.get("category") || "";
    if (nextCategory !== category) setCategoryState(nextCategory);

    const nextStatus = searchParams.get("status") || "";
    if (nextStatus !== status) setStatusState(nextStatus);

    const nextSearch = searchParams.get("q") || "";
    if (nextSearch !== search) setSearchState(nextSearch);

    const nextView = searchParams.get("view") === "table" ? "table" : "narrative";
    if (nextView !== viewMode) setViewModeState(nextView);
  }, [searchParams]);

  const setPeriodId = useCallback((id: number | "") => {
    setPeriodIdState(id);
  }, []);

  const setCategory = useCallback((cat: string) => {
    setCategoryState(cat);
  }, []);

  const setStatus = useCallback((st: string) => {
    setStatusState(st);
  }, []);

  const setSearch = useCallback((query: string) => {
    setSearchState(query);
  }, []);

  const setViewMode = useCallback((mode: "narrative" | "table") => {
    setViewModeState(mode);
  }, []);

  const resetFilters = useCallback(() => {
    setPeriodIdState("");
    setCategoryState("");
    setStatusState("");
    setSearchState("");
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const isFilterActive = useMemo(() => {
    return Boolean(
      periodId !== "" ||
      category.trim() !== "" ||
      status.trim() !== "" ||
      search.trim() !== ""
    );
  }, [periodId, category, status, search]);

  const filters: FinancialNoteFilterState = useMemo(() => {
    return {
      periodId,
      category,
      status,
      search,
      viewMode,
    };
  }, [periodId, category, status, search, viewMode]);

  return {
    filters,
    periodId,
    category,
    status,
    search,
    viewMode,
    isFilterActive,
    setPeriodId,
    setCategory,
    setStatus,
    setSearch,
    setViewMode,
    resetFilters,
  };
}
