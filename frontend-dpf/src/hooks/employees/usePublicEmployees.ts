import { useEffect, useMemo, useState } from 'react';
import { publicEmployeeService } from '@/services/publicEmployeeService';
import { getPublicList, isPublicCacheFresh, publicListKey, setPublicList, PUBLIC_LIST_FRESH_TTL_MS } from '@/utils/publicEmployeeCache';
import type { PublicEmployeeListResponse } from '@/types/publicEmployee';

export function usePublicEmployees(params: { q: string; position: string; division: string; page: number }) {
  const key = useMemo(() => publicListKey(params), [params]);
  const [result, setResult] = useState<PublicEmployeeListResponse | null>(() => getPublicList(key)?.data ?? null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    const cached = getPublicList(key);
    if (cached) { setResult(cached.data); setLoading(false); }
    if (cached && isPublicCacheFresh(cached, PUBLIC_LIST_FRESH_TTL_MS)) return () => { alive = false; };
    setLoading(!cached);
    publicEmployeeService.list(params).then((data) => {
      if (!alive) return; setPublicList(key, data); setResult(data); setError(null); setLoading(false);
    }).catch((reason) => { if (alive) { setError(reason); setLoading(false); } });
    return () => { alive = false; };
  }, [key, params.q, params.position, params.division, params.page]);

  return { data: result, loading, error };
}

