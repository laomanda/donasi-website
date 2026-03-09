export type ConsultationStatus = "baru" | "dibalas" | "ditutup" | string;

export interface Consultation {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  topic: string;
  message: string;
  status?: ConsultationStatus | null;
  admin_notes?: string | null;
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
