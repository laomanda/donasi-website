export type AdminDashboardStats = {
  programs?: number;
  active_programs?: number;
  articles_total?: number;
  donations_paid?: number;
  monthly_donations?: number;
  allocations_total?: number;
  available_balance?: number;
  donations_pending_count?: number;
  donations_pending_amount?: number;
  pickup_pending?: number;
  pickup_success?: number;
  consultation_new?: number;
  consultation_replied?: number;
  bank_accounts_total?: number;
  banners_total?: number;
  partners_total?: number;
  organization_total?: number;
  suggestions_replied?: number;
  donations_confirmed_count?: number;
  users_total?: number;
};

export type AdminDonationItem = {
  id?: number;
  donor_name?: string | null;
  amount?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  program?: { title?: string | null } | null;
};

export type AdminAllocationItem = {
  id?: number;
  amount?: number | string | null;
  description?: string | null;
  created_at?: string | null;
  program?: { id?: number; title?: string | null } | null;
  user?: { id?: number; name?: string | null } | null;
  donation?: { id?: number; donor_name?: string | null } | null;
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
  recent_allocations?: AdminAllocationItem[];
  upcoming_pickups?: PickupRequestItem[];
  urgent_consultations?: ConsultationItem[];
  highlight_programs?: unknown[];
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

