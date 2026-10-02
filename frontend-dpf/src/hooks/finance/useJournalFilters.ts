import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { JournalStatus, JournalFilterParams } from "@/types/finance";

export interface UseJournalFiltersReturn {
  filters: JournalFilterParams;
  searchInput: string;
  setSearchInput: (val: string) => void;
  debouncedSearch: string;
  statusFilter: JournalStatus | "";
  setStatusFilter: (val: JournalStatus | "") => void;
  status?: JournalStatus | "";
  setStatus: (val: JournalStatus | "") => void;
  periodFilter: number | "";
  setPeriodFilter: (val: number | "") => void;
  periodId?: number | "";
  setPeriodId: (val: number | "") => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
  page: number;
  setPage: (val: number) => void;
  perPage: number;
  setPerPage: (val: number) => void;
  isFilterActive: boolean;
  resetFilters: () => void;
}

export function useJournalFilters(): UseJournalFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial states from URL
  const initialQ = searchParams.get("q") || "";
  const rawStatus = searchParams.get("status");
  const initialStatus: JournalStatus | "" =
    rawStatus === "draft" || rawStatus === "posted" || rawStatus === "void"
      ? rawStatus
      : "";
  const rawPeriod = searchParams.get("period_id");
  const initialPeriod = rawPeriod && !isNaN(Number(rawPeriod)) ? Number(rawPeriod) : "";
  const initialFrom = searchParams.get("date_from") || "";
  const initialTo = searchParams.get("date_to") || "";
  const rawPage = searchParams.get("page");
  const initialPage = rawPage && !isNaN(Number(rawPage)) ? Math.max(1, Number(rawPage)) : 1;
  const rawPerPage = searchParams.get("per_page");
  const initialPerPage = rawPerPage && !isNaN(Number(rawPerPage)) ? Number(rawPerPage) : 15;

  const [searchInput, setSearchInput] = useState(initialQ);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  const [statusFilter, setStatusFilter] = useState<JournalStatus | "">(initialStatus);
  const [periodFilter, setPeriodFilter] = useState<number | "">(initialPeriod);
  const [dateFrom, setDateFrom] = useState(initialFrom);
  const [dateTo, setDateTo] = useState(initialTo);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, periodFilter, dateFrom, dateTo, perPage]);

  // Synchronize state to URL without looping
  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (debouncedSearch) nextParams.set("q", debouncedSearch);
    if (statusFilter) nextParams.set("status", statusFilter);
    if (periodFilter !== "") nextParams.set("period_id", String(periodFilter));
    if (dateFrom) nextParams.set("date_from", dateFrom);
    if (dateTo) nextParams.set("date_to", dateTo);
    if (page > 1) nextParams.set("page", String(page));
    if (perPage !== 15) nextParams.set("per_page", String(perPage));

    // Only update if changed
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearch, statusFilter, periodFilter, dateFrom, dateTo, page, perPage, searchParams, setSearchParams]);

  const isFilterActive = useMemo(() => {
    return Boolean(
      debouncedSearch ||
        statusFilter ||
        periodFilter !== "" ||
        dateFrom ||
        dateTo
    );
  }, [debouncedSearch, statusFilter, periodFilter, dateFrom, dateTo]);

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("");
    setPeriodFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  return {
    filters: {
      q: debouncedSearch,
      status: statusFilter,
      period_id: periodFilter,
      date_from: dateFrom,
      date_to: dateTo,
      page,
      per_page: perPage,
    },
    searchInput,
    setSearchInput,
    debouncedSearch,
    statusFilter,
    setStatusFilter,
    status: statusFilter,
    setStatus: setStatusFilter,
    periodFilter,
    setPeriodFilter,
    periodId: periodFilter,
    setPeriodId: setPeriodFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    perPage,
    setPerPage,
    isFilterActive,
    resetFilters,
  };
}

export default useJournalFilters;
