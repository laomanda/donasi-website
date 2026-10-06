import type { PublicEmployee, PublicEmployeeFilters, PublicEmployeeListResponse } from '@/types/publicEmployee';

export const PUBLIC_LIST_FRESH_TTL_MS = 15_000;
export const PUBLIC_LIST_MAX_STALE_MS = 120_000;
export const PUBLIC_FILTERS_MAX_STALE_MS = 600_000;
export const PUBLIC_DETAIL_MAX_STALE_MS = 180_000;

export interface PublicCacheEntry<T> { data: T; timestamp: number }

const lists = new Map<string, PublicCacheEntry<PublicEmployeeListResponse>>();
const details = new Map<string, PublicCacheEntry<PublicEmployee>>();
let filters: PublicCacheEntry<PublicEmployeeFilters> | null = null;

export const isPublicCacheFresh = <T>(entry: PublicCacheEntry<T> | null | undefined, ttl: number) =>
  Boolean(entry && Date.now() - entry.timestamp < ttl);
export const isPublicCacheValid = <T>(entry: PublicCacheEntry<T> | null | undefined, ttl: number) =>
  Boolean(entry && Date.now() - entry.timestamp < ttl);

export const publicListKey = (params: { q?: string; position?: string; division?: string; page?: number }) =>
  `public-employees:list:${JSON.stringify({
    q: (params.q ?? '').trim(),
    position: params.position ?? '',
    division: params.division ?? '',
    page: params.page ?? 1,
    per_page: 12,
  })}`;

export const getPublicList = (key: string) => {
  const entry = lists.get(key);
  if (!isPublicCacheValid(entry, PUBLIC_LIST_MAX_STALE_MS)) { lists.delete(key); return null; }
  return entry ?? null;
};
export const setPublicList = (key: string, data: PublicEmployeeListResponse) => lists.set(key, { data, timestamp: Date.now() });
export const getPublicFilters = () => {
  if (!isPublicCacheValid(filters, PUBLIC_FILTERS_MAX_STALE_MS)) { filters = null; return null; }
  return filters;
};
export const setPublicFilters = (data: PublicEmployeeFilters) => { filters = { data, timestamp: Date.now() }; };
export const getPublicDetail = (slug: string) => {
  const entry = details.get(slug);
  if (!isPublicCacheValid(entry, PUBLIC_DETAIL_MAX_STALE_MS)) { details.delete(slug); return null; }
  return entry ?? null;
};
export const setPublicDetail = (slug: string, data: PublicEmployee) => details.set(slug, { data, timestamp: Date.now() });

