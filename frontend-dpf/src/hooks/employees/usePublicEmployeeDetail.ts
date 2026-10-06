import { useEffect, useState } from 'react';
import { isPublicNotFound, publicEmployeeService } from '@/services/publicEmployeeService';
import { getPublicDetail, setPublicDetail } from '@/utils/publicEmployeeCache';
import type { PublicEmployee } from '@/types/publicEmployee';

export function usePublicEmployeeDetail(slug: string) {
  const [data, setData] = useState<PublicEmployee | null>(() => getPublicDetail(slug)?.data ?? null);
  const [loading, setLoading] = useState(!data);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    let alive = true;
    const cached = getPublicDetail(slug);
    if (cached) { setData(cached.data); setLoading(false); return () => { alive = false; }; }
    setLoading(true);
    publicEmployeeService.detail(slug).then((value) => { if (alive) { setPublicDetail(slug, value); setData(value); setLoading(false); } }).catch((reason) => {
      if (alive) { setNotFound(isPublicNotFound(reason)); setError(reason); setLoading(false); }
    });
    return () => { alive = false; };
  }, [slug]);
  return { data, loading, notFound, error };
}

