export type SearchRole = "editor" | "admin" | "superadmin";

export type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

export type Article = {
  id: number;
  title: string;
  category?: string | null;
  excerpt?: string | null;
  status?: string | null;
  thumbnail_path?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type Program = {
  id: number;
  title: string;
  category?: string | null;
  short_description?: string | null;
  status?: string | null;
  thumbnail_path?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type Partner = {
  id: number;
  name: string;
  logo_path?: string | null;
  url?: string | null;
  order?: number | null;
  is_active?: boolean | null;
};

export type OrganizationMember = {
  id: number;
  name: string;
  position_title: string;
  group: string;
  photo_path?: string | null;
  is_active?: boolean | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type DonationStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | string;

export type Donation = {
  id: number;
  donation_code?: string | null;
  donor_name?: string | null;
  amount?: number | string | null;
  status?: DonationStatus | null;
  payment_source?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  program?: { id?: number; title?: string | null } | null;
};

export type EditorTaskStatus = "open" | "in_progress" | "done" | "cancelled" | string;
export type EditorTaskPriority = "low" | "normal" | "high" | string;

export type EditorTask = {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: EditorTaskStatus | null;
  priority?: EditorTaskPriority | null;
  due_at?: string | null;
  created_at?: string | null;
  assignee?: { id?: number; name?: string | null; email?: string | null } | null;
  creator?: { id?: number; name?: string | null; email?: string | null } | null;
};

export type PickupStatus = "baru" | "dijadwalkan" | "selesai" | "dibatalkan" | string;

export type PickupRequest = {
  id: number;
  donor_name?: string | null;
  donor_phone?: string | null;
  city?: string | null;
  district?: string | null;
  zakat_type?: string | null;
  status?: PickupStatus | null;
  created_at?: string | null;
};

export type ConsultationStatus = "baru" | "dibalas" | "ditutup" | string;

export type Consultation = {
  id: number;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  topic?: string | null;
  message?: string | null;
  status?: ConsultationStatus | null;
  created_at?: string | null;
};

export type BankAccount = {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_visible_public: boolean;
  order?: number | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at?: string | null;
  roles?: { id?: number; name: string }[];
  role_label?: string | null;
};

export type LoadState<T> = {
  data: T[];
  total: number;
  loading: boolean;
  error: string | null;
};

export type Tone = "slate" | "primary" | "green" | "sky" | "amber" | "red";
export type BadgeTone = "neutral" | "green" | "amber" | "red" | "sky";
