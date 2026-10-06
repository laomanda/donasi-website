import { useState, useEffect, useCallback } from 'react';
import employeeService from '@/services/employeeService';
import type { EmployeeFilterOptions } from '@/types/employee';

export interface UseEmployeeFiltersReturn {
  filters: EmployeeFilterOptions;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEmployeeFilters(): UseEmployeeFiltersReturn {
  const [filters, setFilters] = useState<EmployeeFilterOptions>({
    positions: [],
    display_orders: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilters = useCallback(async (force = false) => {
    try {
      setError(null);
      const data = await employeeService.getEmployeeFilters({ forceRefresh: force });
      setFilters(data);
    } catch {
      setError('Gagal memuat opsi filter.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFilters();
  }, [fetchFilters]);

  const refresh = useCallback(async () => {
    await fetchFilters(true);
  }, [fetchFilters]);

  return {
    filters,
    loading,
    error,
    refresh,
  };
}
