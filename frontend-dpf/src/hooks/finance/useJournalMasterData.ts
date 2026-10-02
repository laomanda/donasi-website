import { useState, useEffect, useMemo, useRef } from "react";
import financeService from "@/services/financeService";
import { useFinancePeriods } from "./useFinancePeriods";
import { useAccountsData } from "./useAccountsData";
import type { AccountingPeriod, Account, ProgramOption } from "@/types/finance";

// Module-level in-memory cache for programs
let programsCache: { data: ProgramOption[]; fetchedAt: number } | null = null;
let programsInFlight: Promise<ProgramOption[]> | null = null;
const PROGRAMS_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchAuthoritativePrograms(): Promise<ProgramOption[]> {
  if (programsInFlight) {
    return programsInFlight;
  }
  programsInFlight = financeService.getPrograms().then((res) => {
    programsCache = { data: res, fetchedAt: Date.now() };
    programsInFlight = null;
    return res;
  }).catch((err) => {
    programsInFlight = null;
    throw err;
  });
  return programsInFlight;
}

export interface UseJournalMasterDataReturn {
  periods: AccountingPeriod[];
  openPeriods: AccountingPeriod[];
  accounts: Account[];
  activeAccounts: Account[];
  programs: ProgramOption[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshMasterData: () => Promise<void>;
}

export function useJournalMasterData(): UseJournalMasterDataReturn {
  const isMountedRef = useRef(true);

  // 1. Periods (cached)
  const { periods, loading: periodsLoading, refresh: refreshPeriods } = useFinancePeriods();

  // 2. Accounts (cached from COA)
  const { accounts, loading: accountsLoading, refresh: refreshAccounts } = useAccountsData();

  // 3. Programs (cached locally)
  const isProgramsFresh = Boolean(
    programsCache && Date.now() - programsCache.fetchedAt < PROGRAMS_TTL_MS
  );
  const [programs, setPrograms] = useState<ProgramOption[]>(
    programsCache ? programsCache.data : []
  );
  const [programsLoading, setProgramsLoading] = useState<boolean>(!isProgramsFresh);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isProgramsFresh) {
      setProgramsLoading(true);
      void fetchAuthoritativePrograms()
        .then((res) => {
          if (isMountedRef.current) {
            setPrograms(res);
          }
        })
        .catch(() => {
          // Keep existing or empty
        })
        .finally(() => {
          if (isMountedRef.current) {
            setProgramsLoading(false);
          }
        });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [isProgramsFresh]);

  const refresh = async () => {
    programsCache = null;
    await Promise.all([
      refreshPeriods(),
      refreshAccounts(true),
      fetchAuthoritativePrograms().then((res) => {
        if (isMountedRef.current) setPrograms(res);
      }),
    ]);
  };

  const openPeriods = useMemo(() => {
    return periods.filter((p) => p.status === "open");
  }, [periods]);

  const activeAccounts = useMemo(() => {
    return accounts.filter((a) => a.is_active);
  }, [accounts]);

  const loading = periodsLoading || accountsLoading || programsLoading;

  return {
    periods,
    openPeriods,
    accounts,
    activeAccounts,
    programs,
    loading,
    error: null,
    refresh,
    refreshMasterData: refresh,
  };
}

export default useJournalMasterData;
