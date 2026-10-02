import { useMemo } from "react";
import { useFinancePeriods } from "./useFinancePeriods";
import { useAccountsData } from "./useAccountsData";
import type { AccountingPeriod, Account } from "@/types/finance";

export interface UseGeneralLedgerMasterDataReturn {
  periods: AccountingPeriod[];
  openPeriods: AccountingPeriod[];
  accounts: Account[];
  activeAccounts: Account[];
  loading: boolean;
  error: string | null;
  refreshMasterData: () => Promise<void>;
}

/**
 * Reuses master account data (COA cache) and accounting periods (Dashboard cache)
 * to avoid duplicate API requests across finance modules.
 */
export function useGeneralLedgerMasterData(): UseGeneralLedgerMasterDataReturn {
  const { periods, loading: periodsLoading, refresh: refreshPeriods } = useFinancePeriods();
  const { accounts, loading: accountsLoading, refresh: refreshAccounts } = useAccountsData();

  const activeAccounts = useMemo(() => {
    return accounts.filter((a) => a.is_active);
  }, [accounts]);

  const openPeriods = useMemo(() => {
    return periods.filter((p) => p.status === "open");
  }, [periods]);

  const refreshMasterData = async () => {
    await Promise.all([refreshPeriods(), refreshAccounts(true)]);
  };

  const loading = periodsLoading || accountsLoading;

  return {
    periods,
    openPeriods,
    accounts,
    activeAccounts,
    loading,
    error: null,
    refreshMasterData,
  };
}

export default useGeneralLedgerMasterData;
