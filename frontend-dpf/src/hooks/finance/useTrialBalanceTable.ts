import { useState, useMemo, useEffect, useCallback } from "react";
import type { TrialBalanceAccount } from "@/types/finance";

export interface UseTrialBalanceTableReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  filteredAccounts: TrialBalanceAccount[];
  paginatedAccounts: TrialBalanceAccount[];
  totalPages: number;
  totalFilteredCount: number;
  totalRawCount: number;
  resetPagination: () => void;
}

export function useTrialBalanceTable(
  accounts: TrialBalanceAccount[] = []
): UseTrialBalanceTableReturn {
  const [searchQuery, setSearchQueryState] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPageState] = useState<number>(25);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
  }, []);

  const setPerPage = useCallback((count: number) => {
    setPerPageState(count);
    setCurrentPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setSearchQueryState("");
    setCurrentPage(1);
  }, []);

  // Filter accounts by code or name
  const filteredAccounts = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return accounts;

    return accounts.filter((acc) => {
      const codeMatch = acc.code.toLowerCase().includes(query);
      const nameMatch = acc.name.toLowerCase().includes(query);
      return codeMatch || nameMatch;
    });
  }, [accounts, searchQuery]);

  // Compute total pages
  const totalPages = useMemo(() => {
    if (perPage === -1 || filteredAccounts.length === 0) return 1;
    return Math.ceil(filteredAccounts.length / perPage);
  }, [filteredAccounts.length, perPage]);

  // If current page is beyond total pages after filtering, snap back to page 1
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Paginate filtered results
  const paginatedAccounts = useMemo(() => {
    if (perPage === -1) return filteredAccounts;
    const start = (currentPage - 1) * perPage;
    return filteredAccounts.slice(start, start + perPage);
  }, [filteredAccounts, currentPage, perPage]);

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    filteredAccounts,
    paginatedAccounts,
    totalPages,
    totalFilteredCount: filteredAccounts.length,
    totalRawCount: accounts.length,
    resetPagination,
  };
}
