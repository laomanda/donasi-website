import { useState, useEffect, useCallback, useRef } from 'react';
import employeeService from '@/services/employeeService';
import type {
  Employee,
  EmployeeListParams,
  EmployeePaginationMeta,
} from '@/types/employee';
import {
  buildEmployeeListCacheKey,
  EMPLOYEE_LIST_FRESH_TTL_MS,
  getCachedEmployeeList,
  isCacheFresh,
} from '@/utils/employeeCache';

export interface UseEmployeesReturn {
  employees: Employee[];
  meta: EmployeePaginationMeta;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_META: EmployeePaginationMeta = {
  current_page: 1,
  from: null,
  last_page: 1,
  per_page: 15,
  to: null,
  total: 0,
};

export function useEmployees(params: EmployeeListParams): UseEmployeesReturn {
  const currentKey = buildEmployeeListCacheKey(params);
  const activeKeyRef = useRef<string>(currentKey);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestKeyRef = useRef<string | null>(null);

  // Synchronous cache lookup on mount or param change
  const cached = getCachedEmployeeList(currentKey);
  const isFresh = isCacheFresh(cached, EMPLOYEE_LIST_FRESH_TTL_MS);

  const [employees, setEmployees] = useState<Employee[]>(cached ? cached.data.data : []);
  const [meta, setMeta] = useState<EmployeePaginationMeta>(cached ? cached.data.meta : DEFAULT_META);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [refreshing, setRefreshing] = useState<boolean>(Boolean(cached && !isFresh));
  const [error, setError] = useState<string | null>(null);

  activeKeyRef.current = currentKey;

  const executeFetch = useCallback(
    async (targetParams: EmployeeListParams, targetKey: string, force = false) => {
      // Abort a request only when switching to a different query. React may
      // re-run an effect for the same key in development, and aborting that
      // request before the service deduplicates it would leave the new effect
      // subscribed to an already-canceled promise.
      if (abortControllerRef.current && requestKeyRef.current !== targetKey) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      requestKeyRef.current = targetKey;

      // Check cache if not forced
      if (!force) {
        const cachedEntry = getCachedEmployeeList(targetKey);
        if (cachedEntry && isCacheFresh(cachedEntry, EMPLOYEE_LIST_FRESH_TTL_MS)) {
          if (activeKeyRef.current === targetKey) {
            setEmployees(cachedEntry.data.data);
            setMeta(cachedEntry.data.meta);
            setError(null);
            setLoading(false);
            setRefreshing(false);
          }
          return;
        }
      }

      const cachedEntry = getCachedEmployeeList(targetKey);
      if (!cachedEntry) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const result = await employeeService.getEmployees(targetParams, {
          forceRefresh: force,
          signal: controller.signal,
        });

        // Race protection: only apply if this request matches current key
        if (activeKeyRef.current === targetKey) {
          setEmployees(result.data);
          setMeta(result.meta);
          setError(null);
        }
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
          return; // Ignore canceled requests
        }
        if (activeKeyRef.current === targetKey) {
          setError('Gagal memuat data karyawan.');
        }
      } finally {
        if (activeKeyRef.current === targetKey) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    activeKeyRef.current = currentKey;
    void executeFetch(params, currentKey, false);

    return () => {
      // The next query will abort the previous request if its key changes.
      // Do not abort here: StrictMode re-runs this effect with the same key
      // and the shared in-flight promise must remain usable.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, executeFetch]);

  const refresh = useCallback(async () => {
    await executeFetch(params, currentKey, true);
  }, [executeFetch, params, currentKey]);

  return {
    employees,
    meta,
    loading,
    refreshing,
    error,
    refresh,
  };
}
