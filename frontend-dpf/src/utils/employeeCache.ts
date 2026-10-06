import type {
  Employee,
  EmployeeFilterOptions,
  EmployeeListParams,
  EmployeeListResponse,
} from '@/types/employee';

// TTL Configuration
export const EMPLOYEE_LIST_FRESH_TTL_MS = 15 * 1000; // 15 seconds
export const EMPLOYEE_LIST_MAX_STALE_MS = 2 * 60 * 1000; // 2 minutes

export const EMPLOYEE_FILTERS_FRESH_TTL_MS = 3 * 60 * 1000; // 3 minutes
export const EMPLOYEE_FILTERS_MAX_STALE_MS = 10 * 60 * 1000; // 10 minutes

export const EMPLOYEE_DETAIL_FRESH_TTL_MS = 30 * 1000; // 30 seconds
export const EMPLOYEE_DETAIL_MAX_STALE_MS = 3 * 60 * 1000; // 3 minutes

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-Memory Cache Stores
const listCache = new Map<string, CacheEntry<EmployeeListResponse>>();
let filtersCacheEntry: CacheEntry<EmployeeFilterOptions> | null = null;
const detailCache = new Map<string | number, CacheEntry<Employee>>();

// In-Flight Promises for Request Deduplication
const inFlightListRequests = new Map<string, Promise<EmployeeListResponse>>();
let inFlightFiltersRequest: Promise<EmployeeFilterOptions> | null = null;
const inFlightDetailRequests = new Map<string | number, Promise<Employee>>();

/**
 * Check if a cache entry is within its fresh TTL window.
 */
export function isCacheFresh<T>(entry: CacheEntry<T> | null | undefined, ttlMs: number): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttlMs;
}

/**
 * Check if a cache entry is within its maximum allowed stale window.
 */
export function isCacheValid<T>(entry: CacheEntry<T> | null | undefined, maxStaleMs: number): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < maxStaleMs;
}

/**
 * Build a deterministic cache key for an employee list query.
 */
export function buildEmployeeListCacheKey(params: EmployeeListParams = {}): string {
  const q = (params.q ?? '').trim().toLowerCase();
  const position = (params.position ?? '').trim();
  const employment_status = (params.employment_status ?? '').trim();
  const is_published = params.is_published !== undefined ? String(params.is_published) : '';
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 15;

  return `employees:list:${JSON.stringify({ q, position, employment_status, is_published, page, per_page })}`;
}

// --- List Cache Accessors ---

export function getCachedEmployeeList(key: string): CacheEntry<EmployeeListResponse> | null {
  const entry = listCache.get(key);
  if (!entry) return null;
  if (!isCacheValid(entry, EMPLOYEE_LIST_MAX_STALE_MS)) {
    listCache.delete(key);
    return null;
  }
  return entry;
}

export function setCachedEmployeeList(key: string, data: EmployeeListResponse): void {
  // Simple LRU trim
  if (listCache.size >= 40) {
    const oldestKey = listCache.keys().next().value;
    if (oldestKey) listCache.delete(oldestKey);
  }
  listCache.set(key, { data, timestamp: Date.now() });
}

export function getInFlightListRequest(key: string): Promise<EmployeeListResponse> | undefined {
  return inFlightListRequests.get(key);
}

export function setInFlightListRequest(key: string, promise: Promise<EmployeeListResponse> | null): void {
  if (promise) {
    inFlightListRequests.set(key, promise);
  } else {
    inFlightListRequests.delete(key);
  }
}

// --- Filter Options Cache Accessors ---

export function getCachedEmployeeFilters(): CacheEntry<EmployeeFilterOptions> | null {
  if (!filtersCacheEntry) return null;
  if (!isCacheValid(filtersCacheEntry, EMPLOYEE_FILTERS_MAX_STALE_MS)) {
    filtersCacheEntry = null;
    return null;
  }
  return filtersCacheEntry;
}

export function setCachedEmployeeFilters(data: EmployeeFilterOptions): void {
  filtersCacheEntry = { data, timestamp: Date.now() };
}

export function getInFlightFiltersRequest(): Promise<EmployeeFilterOptions> | null {
  return inFlightFiltersRequest;
}

export function setInFlightFiltersRequest(promise: Promise<EmployeeFilterOptions> | null): void {
  inFlightFiltersRequest = promise;
}

// --- Detail Cache Accessors ---

export function getCachedEmployeeDetail(id: number | string): CacheEntry<Employee> | null {
  const entry = detailCache.get(id);
  if (!entry) return null;
  if (!isCacheValid(entry, EMPLOYEE_DETAIL_MAX_STALE_MS)) {
    detailCache.delete(id);
    return null;
  }
  return entry;
}

export function setCachedEmployeeDetail(id: number | string, data: Employee): void {
  if (detailCache.size >= 60) {
    const oldestKey = detailCache.keys().next().value;
    if (oldestKey) detailCache.delete(oldestKey);
  }
  detailCache.set(id, { data, timestamp: Date.now() });
}

export function getInFlightDetailRequest(id: number | string): Promise<Employee> | undefined {
  return inFlightDetailRequests.get(id);
}

export function setInFlightDetailRequest(id: number | string, promise: Promise<Employee> | null): void {
  if (promise) {
    inFlightDetailRequests.set(id, promise);
  } else {
    inFlightDetailRequests.delete(id);
  }
}

// --- Invalidation Helpers ---

/**
 * Invalidate all employee list query caches.
 */
export function invalidateEmployeeListCache(): void {
  listCache.clear();
  inFlightListRequests.clear();
}

/**
 * Invalidate filter options cache.
 */
export function invalidateEmployeeFiltersCache(): void {
  filtersCacheEntry = null;
  inFlightFiltersRequest = null;
}

/**
 * Invalidate single detail or all detail caches.
 */
export function invalidateEmployeeDetailCache(id?: number | string): void {
  if (id !== undefined) {
    detailCache.delete(id);
    inFlightDetailRequests.delete(id);
  } else {
    detailCache.clear();
    inFlightDetailRequests.clear();
  }
}

/**
 * Invalidate all employee-related caches after a mutation.
 */
export function invalidateAllEmployeeCaches(): void {
  listCache.clear();
  inFlightListRequests.clear();
  filtersCacheEntry = null;
  inFlightFiltersRequest = null;
  detailCache.clear();
  inFlightDetailRequests.clear();
}
