export type EmploymentStatus = 'active' | 'inactive';

export interface Employee {
  id: number;
  employee_code: string;
  slug: string;
  name: string;
  position: string;
  division: string | null;
  id_card_image: string;
  id_card_image_url: string;
  employment_status: EmploymentStatus;
  employment_status_label?: string;
  display_order: number | null;
  is_published: boolean;
  public_url: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmployeeListParams {
  q?: string;
  position?: string;
  division?: string;
  employment_status?: string;
  is_published?: boolean | string;
  page?: number;
  per_page?: number;
}

export interface EmployeeFilterOptions {
  positions: string[];
  divisions: string[];
}

export interface EmployeePaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: EmployeePaginationMeta;
}

export interface EmployeeFormPayload {
  employee_code: string;
  name: string;
  slug?: string;
  position: string;
  division?: string;
  employment_status: EmploymentStatus;
  display_order: number;
  is_published: boolean;
  id_card_image?: File | null;
}

export interface EmployeeFormErrors {
  employee_code?: string;
  name?: string;
  slug?: string;
  position?: string;
  division?: string;
  employment_status?: string;
  display_order?: string;
  is_published?: string;
  id_card_image?: string;
  general?: string;
}
