import { useEffect, useState } from 'react';
import { publicEmployeeService } from '@/services/publicEmployeeService';
import { getPublicFilters, setPublicFilters } from '@/utils/publicEmployeeCache';
import type { PublicEmployeeFilters } from '@/types/publicEmployee';

export function usePublicEmployeeFilters() {
  const [data, setData] = useState<PublicEmployeeFilters>(() => getPublicFilters()?.data ?? { positions: [], divisions: [] });
  const [loading, setLoading] = useState(!getPublicFilters());
  useEffect(() => {
    let alive = true;
    if (getPublicFilters()) return () => { alive = false; };
    publicEmployeeService.filters().then((value) => { if (alive) { setPublicFilters(value); setData(value); setLoading(false); } }).catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  return { data, loading };
}

