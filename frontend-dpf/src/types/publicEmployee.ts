export type PublicEmploymentStatus = 'active' | 'inactive' | string;

export interface PublicEmployee {
  employee_code: string;
  slug: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  position: string;
  division: string | null;
  employment_status: PublicEmploymentStatus;
  employment_status_label?: string | null;
  id_card_image_url: string | null;
  public_url: string;
}

export interface PublicEmployeePagination {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PublicEmployeeListResponse {
  data: PublicEmployee[];
  meta: PublicEmployeePagination;
}

export interface PublicEmployeeFilters {
  positions: string[];
  divisions: string[];
}

