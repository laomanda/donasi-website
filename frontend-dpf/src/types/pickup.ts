export type PickupStatus = "baru" | "dijadwalkan" | "selesai" | "dibatalkan" | string;

export interface PickupRequest {
  id: number;
  donor_name: string;
  donor_phone: string;
  address_full: string;
  city: string;
  district: string;
  zakat_type: string;
  estimation?: string | null;
  preferred_time?: string | null;
  status?: PickupStatus | null;
  assigned_officer?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PaginationPayload<T> {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}
