import { useState, useEffect, useMemo, useCallback } from "react";
import type { Account, AccountType } from "@/types/finance";
import {
  buildAccountIndexes,
  filterFlatAccounts,
  buildFlattenedTree,
  getDefaultExpandedIds,
  getAllAccountIds,
  type FlatTreeItem,
} from "@/utils/accountTreeUtils";

export interface UseAccountTreeOptions {
  accounts: Account[];
  typeFilter: AccountType | "";
  statusFilter: "" | "active" | "inactive";
  searchQuery: string;
  isFiltered: boolean;
}

export interface UseAccountTreeReturn {
  treeItems: FlatTreeItem[];
  flatFilteredItems: Account[];
  expandedIds: Set<number>;
  toggleExpand: (id: number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  level1Count: number;
}

export function useAccountTree({
  accounts,
  typeFilter,
  statusFilter,
  searchQuery,
  isFiltered,
}: UseAccountTreeOptions): UseAccountTreeReturn {
  // 1. Build indexed structures once per accounts dataset
  const indexed = useMemo(() => {
    return buildAccountIndexes(accounts);
  }, [accounts]);

  // 2. Track expanded IDs
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() =>
    getDefaultExpandedIds(accounts, 2)
  );

  // Update default expanded IDs when accounts change (e.g. initial load or mutation)
  useEffect(() => {
    if (accounts.length > 0) {
      setExpandedIds((prev) => {
        // If already populated, preserve existing user expansion unless empty
        if (prev.size > 0) return prev;
        return getDefaultExpandedIds(accounts, 2);
      });
    }
  }, [accounts]);

  // 3. Filter flat list
  const flatFilteredItems = useMemo(() => {
    return filterFlatAccounts(accounts, {
      type: typeFilter,
      status: statusFilter,
      search: searchQuery,
    });
  }, [accounts, typeFilter, statusFilter, searchQuery]);

  // 4. Build flattened tree
  const treeItems = useMemo(() => {
    return buildFlattenedTree(indexed, flatFilteredItems, isFiltered, expandedIds);
  }, [indexed, flatFilteredItems, isFiltered, expandedIds]);

  // 5. Tree expansion controls
  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(getAllAccountIds(accounts));
  }, [accounts]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // 6. Level 1 count metric
  const level1Count = useMemo(() => {
    return accounts.filter((a) => a.level === 1).length;
  }, [accounts]);

  return {
    treeItems,
    flatFilteredItems,
    expandedIds,
    toggleExpand,
    expandAll,
    collapseAll,
    level1Count,
  };
}
