import http from '@/lib/http';
import type {
  Employee,
  EmployeeFilterOptions,
  EmployeeFormPayload,
  EmployeeListParams,
  EmployeeListResponse,
} from '@/types/employee';
import {
  buildEmployeeListCacheKey,
  EMPLOYEE_DETAIL_FRESH_TTL_MS,
  EMPLOYEE_FILTERS_FRESH_TTL_MS,
  EMPLOYEE_LIST_FRESH_TTL_MS,
  getCachedEmployeeDetail,
  getCachedEmployeeFilters,
  getCachedEmployeeList,
  getInFlightDetailRequest,
  getInFlightFiltersRequest,
  getInFlightListRequest,
  invalidateAllEmployeeCaches,
  invalidateEmployeeDetailCache,
  invalidateEmployeeFiltersCache,
  invalidateEmployeeListCache,
  isCacheFresh,
  setCachedEmployeeDetail,
  setCachedEmployeeFilters,
  setCachedEmployeeList,
  setInFlightDetailRequest,
  setInFlightFiltersRequest,
  setInFlightListRequest,
} from '@/utils/employeeCache';

export class EmployeeService {
  /**
   * Fetch paginated employees list with deduplication and in-memory caching.
   */
  async getEmployees(
    params: EmployeeListParams = {},
    options: { forceRefresh?: boolean; signal?: AbortSignal } = {}
  ): Promise<EmployeeListResponse> {
    const cacheKey = buildEmployeeListCacheKey(params);

    if (!options.forceRefresh) {
      const cached = getCachedEmployeeList(cacheKey);
      if (cached && isCacheFresh(cached, EMPLOYEE_LIST_FRESH_TTL_MS)) {
        return cached.data;
      }
    }

    // Check in-flight request for deduplication
    const existingPromise = getInFlightListRequest(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }

    const fetchPromise = (async () => {
      try {
        const queryParams: Record<string, string | number | boolean> = {};
        if (params.q?.trim()) queryParams.q = params.q.trim();
        if (params.position?.trim()) queryParams.position = params.position.trim();
        if (params.division?.trim()) queryParams.division = params.division.trim();
        if (params.employment_status?.trim()) queryParams.employment_status = params.employment_status.trim();
        if (params.is_published !== undefined && params.is_published !== '') {
          queryParams.is_published = params.is_published;
        }
        if (params.page) queryParams.page = params.page;
        if (params.per_page) queryParams.per_page = params.per_page;

        const res = await http.get('/employees', {
          params: queryParams,
          signal: options.signal,
          headers: { Accept: 'application/json' },
        });

        const raw = res.data;
        const items: Employee[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const meta = raw?.meta
          ? {
              current_page: raw.meta.current_page ?? 1,
              from: raw.meta.from ?? null,
              last_page: raw.meta.last_page ?? 1,
              per_page: raw.meta.per_page ?? 15,
              to: raw.meta.to ?? null,
              total: raw.meta.total ?? items.length,
            }
          : {
              current_page: raw?.current_page ?? 1,
              from: raw?.from ?? null,
              last_page: raw?.last_page ?? 1,
              per_page: raw?.per_page ?? 15,
              to: raw?.to ?? null,
              total: raw?.total ?? items.length,
            };

        const result: EmployeeListResponse = { data: items, meta };
        setCachedEmployeeList(cacheKey, result);
        return result;
      } finally {
        setInFlightListRequest(cacheKey, null);
      }
    })();

    setInFlightListRequest(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Fetch distinct filter options with caching.
   */
  async getEmployeeFilters(options: { forceRefresh?: boolean } = {}): Promise<EmployeeFilterOptions> {
    if (!options.forceRefresh) {
      const cached = getCachedEmployeeFilters();
      if (
        cached &&
        isCacheFresh(cached, EMPLOYEE_FILTERS_FRESH_TTL_MS) &&
        Array.isArray(cached.data.display_orders)
      ) {
        return cached.data;
      }
    }

    const inFlight = getInFlightFiltersRequest();
    if (inFlight) {
      return inFlight;
    }

    const fetchPromise = (async () => {
      try {
        const res = await http.get<EmployeeFilterOptions>('/employees/filters');
        const data: EmployeeFilterOptions = {
          positions: Array.isArray(res.data?.positions) ? res.data.positions : [],
          divisions: Array.isArray(res.data?.divisions) ? res.data.divisions : [],
          display_orders: Array.isArray(res.data?.display_orders)
            ? res.data.display_orders.map((order) => Number(order)).filter(Number.isFinite)
            : [],
        };
        setCachedEmployeeFilters(data);
        return data;
      } finally {
        setInFlightFiltersRequest(null);
      }
    })();

    setInFlightFiltersRequest(fetchPromise);
    return fetchPromise;
  }

  /**
   * Fetch single employee details with caching.
   */
  async getEmployee(
    id: number | string,
    options: { forceRefresh?: boolean; signal?: AbortSignal } = {}
  ): Promise<Employee> {
    if (!options.forceRefresh) {
      const cached = getCachedEmployeeDetail(id);
      if (cached && isCacheFresh(cached, EMPLOYEE_DETAIL_FRESH_TTL_MS)) {
        return cached.data;
      }
    }

    const inFlight = getInFlightDetailRequest(id);
    if (inFlight) {
      return inFlight;
    }

    const fetchPromise = (async () => {
      try {
        const res = await http.get<{ data: Employee }>(`/employees/${id}`, {
          signal: options.signal,
          // skip automatic window redirect on 404/403 so component handles error state
          ...({ skipErrorRedirect: true } as Record<string, unknown>),
        });

        const employee = res.data?.data;
        if (!employee) {
          throw new Error('Data karyawan tidak ditemukan.');
        }

        setCachedEmployeeDetail(id, employee);
        return employee;
      } finally {
        setInFlightDetailRequest(id, null);
      }
    })();

    setInFlightDetailRequest(id, fetchPromise);
    return fetchPromise;
  }

  /**
   * Create an employee record using multipart/form-data.
   */
  async createEmployee(payload: EmployeeFormPayload): Promise<Employee> {
    const formData = new FormData();
    formData.append('employee_code', payload.employee_code);
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('phone', payload.phone);
    if (payload.slug && payload.slug.trim()) {
      formData.append('slug', payload.slug.trim());
    }
    formData.append('position', payload.position);
    if (payload.division !== undefined && payload.division !== null) {
      formData.append('division', payload.division.trim());
    }
    formData.append('employment_status', payload.employment_status);
    formData.append('display_order', String(payload.display_order));
    formData.append('is_published', payload.is_published ? '1' : '0');

    if (payload.id_card_image) {
      formData.append('id_card_image', payload.id_card_image);
    }

    const res = await http.post<{ message: string; data: Employee }>('/employees', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...({ skipErrorRedirect: true } as Record<string, unknown>),
    });

    const created = res.data?.data;
    // Invalidate caches
    invalidateEmployeeListCache();
    invalidateEmployeeFiltersCache();
    if (created?.id) {
      setCachedEmployeeDetail(created.id, created);
    }

    return created;
  }

  /**
   * Update an employee record using method spoofing (POST with _method=PUT) for multipart/form-data.
   */
  async updateEmployee(id: number | string, payload: EmployeeFormPayload): Promise<Employee> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('employee_code', payload.employee_code);
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('phone', payload.phone);
    if (payload.slug !== undefined && payload.slug !== null) {
      formData.append('slug', payload.slug.trim());
    }
    formData.append('position', payload.position);
    if (payload.division !== undefined && payload.division !== null) {
      formData.append('division', payload.division.trim());
    }
    formData.append('employment_status', payload.employment_status);
    formData.append('display_order', String(payload.display_order));
    formData.append('is_published', payload.is_published ? '1' : '0');

    if (payload.id_card_image) {
      formData.append('id_card_image', payload.id_card_image);
    }

    const res = await http.post<{ message: string; data: Employee }>(`/employees/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...({ skipErrorRedirect: true } as Record<string, unknown>),
    });

    const updated = res.data?.data;
    // Invalidate caches
    invalidateEmployeeListCache();
    invalidateEmployeeFiltersCache();
    invalidateEmployeeDetailCache(id);
    if (updated?.id) {
      setCachedEmployeeDetail(updated.id, updated);
    }

    return updated;
  }

  /**
   * Soft delete an employee record.
   */
  async deleteEmployee(id: number | string): Promise<void> {
    await http.delete(`/employees/${id}`, {
      ...({ skipErrorRedirect: true } as Record<string, unknown>),
    });

    invalidateAllEmployeeCaches();
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
