export type AdminDashboardStats = {
  donations_paid?: number;
  monthly_donations?: number;
  pickup_pending?: number;
  consultation_new?: number;
};

export type AdminDonationItem = {
  id?: number;
  donor_name?: string | null;
  amount?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  program?: { title?: string | null } | null;
};

export type PickupRequestItem = {
  id: number;
  donor_name?: string;
  district?: string;
  preferred_time?: string;
  status: string;
  created_at?: string;
};

export type ConsultationItem = {
  id: number;
  name?: string;
  topic?: string;
  created_at?: string;
};

export type AdminDashboardPayload = {
  stats?: AdminDashboardStats;
  recent_donations?: AdminDonationItem[];
  upcoming_pickups?: PickupRequestItem[];
  urgent_consultations?: ConsultationItem[];
};

export type SuperAdminStats = {
  users_total?: number;
  users_active?: number;
  users_inactive?: number;
  programs_total?: number;
  articles_total?: number;
  donations_paid?: number;
  donations_pending?: number;
};

export type RoleCount = {
  id?: number;
  name: string;
  users_count?: number;
};

export type TopProgram = {
  id: number;
  title: string;
  status?: string | null;
  donations_paid?: number;
};

export type SuperAdminDashboardPayload = {
  stats?: SuperAdminStats;
  roles?: RoleCount[];
  latest_users?: unknown;
  top_programs?: TopProgram[];
};

