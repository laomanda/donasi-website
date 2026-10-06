import axios from 'axios';
import http from '@/lib/http';
import type { PublicEmployee, PublicEmployeeFilters, PublicEmployeeListResponse } from '@/types/publicEmployee';

type ListParams = { q?: string; position?: string; division?: string; page?: number };
const listRequests = new Map<string, Promise<PublicEmployeeListResponse>>();
let filtersRequest: Promise<PublicEmployeeFilters> | null = null;
const detailRequests = new Map<string, Promise<PublicEmployee>>();

export const isPublicNotFound = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404;

export const publicEmployeeService = {
  async list(params: ListParams): Promise<PublicEmployeeListResponse> {
    const key = JSON.stringify(params);
    const existing = listRequests.get(key);
    if (existing) return existing;
    const request = http.get<PublicEmployeeListResponse>('/public/employees', {
      params: { q: params.q || undefined, position: params.position || undefined, division: params.division || undefined, page: params.page ?? 1, per_page: 12 },
      skipErrorRedirect: true,
    } as never).then((response) => response.data);
    listRequests.set(key, request);
    return request.finally(() => listRequests.delete(key));
  },
  async filters(): Promise<PublicEmployeeFilters> {
    if (filtersRequest) return filtersRequest;
    filtersRequest = http.get<PublicEmployeeFilters>('/public/employees/filters', { skipErrorRedirect: true } as never).then((response) => response.data);
    return filtersRequest.finally(() => { filtersRequest = null; });
  },
  async detail(slug: string): Promise<PublicEmployee> {
    const existing = detailRequests.get(slug);
    if (existing) return existing;
    const request = http.get<{ data: PublicEmployee }>(`/public/employees/${encodeURIComponent(slug)}`, { skipErrorRedirect: true } as never).then((response) => response.data.data);
    detailRequests.set(slug, request);
    return request.finally(() => detailRequests.delete(slug));
  },
};

