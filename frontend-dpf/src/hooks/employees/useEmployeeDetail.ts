import { useState, useEffect, useCallback, useRef } from 'react';
import employeeService from '@/services/employeeService';
import type { Employee } from '@/types/employee';
import {
  EMPLOYEE_DETAIL_FRESH_TTL_MS,
  getCachedEmployeeDetail,
  isCacheFresh,
} from '@/utils/employeeCache';

export interface UseEmployeeDetailReturn {
  employee: Employee | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEmployeeDetail(id: number | string | undefined): UseEmployeeDetailReturn {
  const cached = id ? getCachedEmployeeDetail(id) : null;
  const isFresh = isCacheFresh(cached, EMPLOYEE_DETAIL_FRESH_TTL_MS);

  const [employee, setEmployee] = useState<Employee | null>(cached ? cached.data : null);
  const [loading, setLoading] = useState<boolean>(!cached && Boolean(id));
  const [refreshing, setRefreshing] = useState<boolean>(Boolean(cached && !isFresh));
  const [error, setError] = useState<string | null>(null);

  const activeIdRef = useRef<number | string | undefined>(id);
  activeIdRef.current = id;

  const fetchDetail = useCallback(
    async (targetId: number | string, force = false) => {
      if (!force) {
        const cachedEntry = getCachedEmployeeDetail(targetId);
        if (cachedEntry && isCacheFresh(cachedEntry, EMPLOYEE_DETAIL_FRESH_TTL_MS)) {
          if (activeIdRef.current === targetId) {
            setEmployee(cachedEntry.data);
            setError(null);
            setLoading(false);
            setRefreshing(false);
          }
          return;
        }
      }

      const cachedEntry = getCachedEmployeeDetail(targetId);
      if (!cachedEntry) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const data = await employeeService.getEmployee(targetId, { forceRefresh: force });
        if (activeIdRef.current === targetId) {
          setEmployee(data);
          setError(null);
        }
      } catch (err: any) {
        if (activeIdRef.current === targetId) {
          const msg = err?.response?.data?.message || 'Data karyawan tidak ditemukan.';
          setError(msg);
        }
      } finally {
        if (activeIdRef.current === targetId) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!id) {
      setEmployee(null);
      setLoading(false);
      return;
    }

    void fetchDetail(id, false);
  }, [id, fetchDetail]);

  const refresh = useCallback(async () => {
    if (id) {
      await fetchDetail(id, true);
    }
  }, [fetchDetail, id]);

  return {
    employee,
    loading,
    refreshing,
    error,
    refresh,
  };
}
