import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { WaqfAssetFilterState } from "@/utils/finance/waqfAssetQuery";

export interface UseWaqfAssetFiltersReturn {
  filters: WaqfAssetFilterState;
  periodId: number | "";
  categoryId: number | "";
  status: string;
  search: string;
  isFilterActive: boolean;
  setPeriodId: (id: number | "") => void;
  setCategoryId: (id: number | "") => void;
  setStatus: (status: string) => void;
  setSearch: (query: string) => void;
  resetFilters: () => void;
}

export function useWaqfAssetFilters(): UseWaqfAssetFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial parameters from URL
  const initialPeriodId = searchParams.get("period_id");
  const initialCategoryId = searchParams.get("category_id");
  const initialStatus = searchParams.get("status") || "";
  const initialSearch = searchParams.get("q") || "";

  const [periodId, setPeriodIdState] = useState<number | "">(
    initialPeriodId ? Number(initialPeriodId) : ""
  );
  const [categoryId, setCategoryIdState] = useState<number | "">(
    initialCategoryId ? Number(initialCategoryId) : ""
  );
  const [status, setStatusState] = useState<string>(initialStatus);
  const [search, setSearchState] = useState<string>(initialSearch);

  // Sync state to URL search parameters
  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (periodId !== "") {
      nextParams.set("period_id", String(periodId));
    }
    if (categoryId !== "") {
      nextParams.set("category_id", String(categoryId));
    }
    if (status.trim()) {
      nextParams.set("status", status.trim());
    }
    if (search.trim()) {
      nextParams.set("q", search.trim());
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [periodId, categoryId, status, search, searchParams, setSearchParams]);

  // Synchronize state when user navigates using browser back / forward
  useEffect(() => {
    const pPeriod = searchParams.get("period_id");
    const pCategory = searchParams.get("category_id");
    const pStatus = searchParams.get("status") || "";
    const pSearch = searchParams.get("q") || "";

    const nextPeriod = pPeriod ? Number(pPeriod) : "";
    const nextCategory = pCategory ? Number(pCategory) : "";

    setPeriodIdState((prev) => (prev !== nextPeriod ? nextPeriod : prev));
    setCategoryIdState((prev) => (prev !== nextCategory ? nextCategory : prev));
    setStatusState((prev) => (prev !== pStatus ? pStatus : prev));
    setSearchState((prev) => (prev !== pSearch ? pSearch : prev));
  }, [searchParams]);

  const setPeriodId = useCallback((id: number | "") => {
    setPeriodIdState(id);
  }, []);

  const setCategoryId = useCallback((id: number | "") => {
    setCategoryIdState(id);
  }, []);

  const setStatus = useCallback((val: string) => {
    setStatusState(val);
  }, []);

  const setSearch = useCallback((query: string) => {
    setSearchState(query);
  }, []);

  const resetFilters = useCallback(() => {
    setPeriodIdState("");
    setCategoryIdState("");
    setStatusState("");
    setSearchState("");
  }, []);

  const isFilterActive = useMemo(() => {
    return Boolean(
      periodId !== "" ||
        categoryId !== "" ||
        status.trim() !== "" ||
        search.trim() !== ""
    );
  }, [periodId, categoryId, status, search]);

  const filters = useMemo<WaqfAssetFilterState>(() => {
    return {
      periodId,
      categoryId,
      status,
      search,
    };
  }, [periodId, categoryId, status, search]);

  return {
    filters,
    periodId,
    categoryId,
    status,
    search,
    isFilterActive,
    setPeriodId,
    setCategoryId,
    setStatus,
    setSearch,
    resetFilters,
  };
}
