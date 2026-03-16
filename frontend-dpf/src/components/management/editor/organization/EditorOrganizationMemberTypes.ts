export { resolveStorageUrl } from "@/lib/urls";

export type OrganizationMember = {
  id: number;
  name: string;
  position_title: string;
  group: string;
  photo_path?: string | null;
  email?: string | null;
  phone?: string | null;
  show_contact: boolean;
  order: number;
  is_active: boolean;
  updated_at?: string | null;
  created_at?: string | null;
};

export type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

export const GROUP_SUGGESTIONS = ["Pembina", "Pengawas", "Pengurus", "Staff", "Relawan", "Lainnya"];

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};



export const getStatusTone = (active: boolean) =>
  active ? "bg-emerald-600 text-white ring-emerald-600" : "bg-red-600 text-white ring-red-600";
export const groupTone = "bg-slate-800 text-white ring-slate-800";
