import { useState, useCallback, useMemo } from "react";
import type { AccountType } from "@/types/finance";

export interface UseAccountFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: AccountType | "";
  setTypeFilter: (type: AccountType | "") => void;
  statusFilter: "" | "active" | "inactive";
  setStatusFilter: (status: "" | "active" | "inactive") => void;
  viewMode: "tree" | "flat";
  setViewMode: (mode: "tree" | "flat") => void;
  isFiltered: boolean;
  resetFilters: () => void;
}

export function useAccountFilters(): UseAccountFiltersReturn {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");

  const isFiltered = useMemo(() => {
    return Boolean(searchQuery.trim() || typeFilter || statusFilter);
  }, [searchQuery, typeFilter, statusFilter]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    isFiltered,
    resetFilters,
  };
}
