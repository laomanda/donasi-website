import type { Account, AccountType } from "@/types/finance";

export interface FlatTreeItem {
  account: Account;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  childCount: number;
}

export interface IndexedAccountStructures {
  accountById: Map<number, Account>;
  childrenMap: Map<number, Account[]>;
  rootAccounts: Account[];
}

/**
 * Builds indexed lookup structures once per accounts array change.
 * Avoids repeated iterations during renders or filter updates.
 */
export function buildAccountIndexes(accounts: Account[]): IndexedAccountStructures {
  const accountById = new Map<number, Account>();
  const childrenMap = new Map<number, Account[]>();
  const allIds = new Set<number>();

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    accountById.set(acc.id, acc);
    allIds.add(acc.id);
  }

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    if (acc.parent_id != null) {
      let list = childrenMap.get(acc.parent_id);
      if (!list) {
        list = [];
        childrenMap.set(acc.parent_id, list);
      }
      list.push(acc);
    }
  }

  // Sort children by code for consistent deterministic order
  childrenMap.forEach((childList) => {
    childList.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  });

  // Find root nodes (parent_id is null or points to an id not in the dataset)
  const rootAccounts: Account[] = [];
  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    if (acc.parent_id == null || !allIds.has(acc.parent_id)) {
      rootAccounts.push(acc);
    }
  }
  rootAccounts.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  return { accountById, childrenMap, rootAccounts };
}

export interface AccountFilterOptions {
  type?: AccountType | "";
  status?: "" | "active" | "inactive";
  search?: string;
}

/**
 * Filters the accounts flat array based on type, status, and search query.
 * Normalizes query string once before checking accounts.
 */
export function filterFlatAccounts(
  accounts: Account[],
  options: AccountFilterOptions
): Account[] {
  const { type, status, search } = options;
  const q = search?.trim().toLowerCase() ?? "";

  return accounts
    .filter((acc) => {
      if (type && acc.account_type !== type) {
        return false;
      }
      if (status === "active" && !acc.is_active) {
        return false;
      }
      if (status === "inactive" && acc.is_active) {
        return false;
      }
      if (q) {
        const matchCode = acc.code.toLowerCase().includes(q);
        const matchName = acc.name.toLowerCase().includes(q);
        const matchCat = acc.report_category ? acc.report_category.toLowerCase().includes(q) : false;
        if (!matchCode && !matchName && !matchCat) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
}

/**
 * Builds a flattened tree structure for display.
 * When filtering is active, matched nodes keep their ancestor chains visible and auto-expanded.
 */
export function buildFlattenedTree(
  indexed: IndexedAccountStructures,
  filteredFlat: Account[],
  isFiltered: boolean,
  expandedIds: Set<number>
): FlatTreeItem[] {
  const { accountById, childrenMap, rootAccounts } = indexed;

  // Determine which node IDs must remain visible
  let visibleInTreeIds: Set<number> | null = null;

  if (isFiltered) {
    visibleInTreeIds = new Set<number>();
    for (let i = 0; i < filteredFlat.length; i++) {
      const match = filteredFlat[i];
      visibleInTreeIds.add(match.id);
      let curr = match;
      while (curr.parent_id != null) {
        visibleInTreeIds.add(curr.parent_id);
        const parent = accountById.get(curr.parent_id);
        if (!parent) break;
        curr = parent;
      }
    }
  }

  const flattened: FlatTreeItem[] = [];

  const traverse = (node: Account, depth: number) => {
    if (visibleInTreeIds && !visibleInTreeIds.has(node.id)) {
      return;
    }

    const nodeChildren = childrenMap.get(node.id) ?? [];
    const hasChildren = nodeChildren.length > 0;
    // Auto-expand ancestors when filtering so matching children are immediately visible
    const isExpanded = isFiltered ? true : expandedIds.has(node.id);

    flattened.push({
      account: node,
      depth,
      hasChildren,
      isExpanded,
      childCount: nodeChildren.length,
    });

    if (hasChildren && isExpanded) {
      for (let i = 0; i < nodeChildren.length; i++) {
        traverse(nodeChildren[i], depth + 1);
      }
    }
  };

  for (let i = 0; i < rootAccounts.length; i++) {
    traverse(rootAccounts[i], 0);
  }

  return flattened;
}

/**
 * Helper to get default expanded IDs (level 1 and 2 accounts).
 */
export function getDefaultExpandedIds(accounts: Account[], maxLevel = 2): Set<number> {
  const defaultExpanded = new Set<number>();
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].level <= maxLevel) {
      defaultExpanded.add(accounts[i].id);
    }
  }
  return defaultExpanded;
}

/**
 * Helper to get all account IDs (for expand all).
 */
export function getAllAccountIds(accounts: Account[]): Set<number> {
  const allIds = new Set<number>();
  for (let i = 0; i < accounts.length; i++) {
    allIds.add(accounts[i].id);
  }
  return allIds;
}
