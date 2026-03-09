import { resolveBackendBaseUrl } from "./urls";
import type { 
  DonationStatus, 
  EditorTaskStatus, 
  EditorTaskPriority, 
  PickupStatus, 
  ConsultationStatus, 
  User,
  Tone,
  BadgeTone
} from "../types/search";

export const createInitialState = <T>() => ({
  data: [] as T[],
  total: 0,
  loading: false,
  error: null as string | null,
});

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

export const resolveStorageUrl = (path: string | null | undefined) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${resolveBackendBaseUrl()}/storage/${clean}`;
};

export const badgeTone = (tone: BadgeTone) => {
  if (tone === "green") return "bg-brandGreen-600 text-white ring-brandGreen-600/20";
  if (tone === "sky") return "bg-sky-600 text-white ring-sky-600/20";
  if (tone === "amber") return "bg-amber-600 text-white ring-amber-600/20";
  if (tone === "red") return "bg-red-600 text-white ring-red-600/20";
  return "bg-slate-600 text-white ring-slate-600/20";
};

export const sectionBadgeTone = (tone: Tone) => {
  if (tone === "primary") return "bg-primary-600 text-white ring-primary-600/20";
  if (tone === "green") return "bg-brandGreen-600 text-white ring-brandGreen-600/20";
  if (tone === "sky") return "bg-sky-600 text-white ring-sky-600/20";
  if (tone === "amber") return "bg-amber-600 text-white ring-amber-600/20";
  if (tone === "red") return "bg-red-600 text-white ring-red-600/20";
  return "bg-slate-600 text-white ring-slate-600/20";
};

export const donationStatusLabel = (status: DonationStatus) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "paid") return { label: "Lunas", tone: "green" as const };
  if (value === "pending") return { label: "Menunggu", tone: "amber" as const };
  if (value === "failed" || value === "cancelled") return { label: "Gagal", tone: "red" as const };
  if (value === "expired") return { label: "Kedaluwarsa", tone: "neutral" as const };
  return { label: String(status || "-"), tone: "neutral" as const };
};

export const articleStatusLabel = (status: string) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "published") return { label: "Terbit", tone: "green" as const };
  if (value === "review") return { label: "Menunggu peninjauan", tone: "amber" as const };
  return { label: "Draf", tone: "neutral" as const };
};

export const programStatusLabel = (status: string) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "active") return { label: "Berjalan", tone: "green" as const };
  if (value === "completed" || value === "archived") return { label: "Tersalurkan", tone: "neutral" as const };
  return { label: "Segera", tone: "amber" as const };
};

export const editorTaskStatusLabel = (status: EditorTaskStatus) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "done") return { label: "Selesai", tone: "green" as const };
  if (value === "in_progress") return { label: "Dikerjakan", tone: "sky" as const };
  if (value === "open") return { label: "Baru", tone: "amber" as const };
  if (value === "cancelled") return { label: "Dibatalkan", tone: "red" as const };
  return { label: String(status || "-"), tone: "neutral" as const };
};

export const editorTaskPriorityLabel = (priority: EditorTaskPriority) => {
  const value = String(priority ?? "").toLowerCase();
  if (value === "high") return "Tinggi";
  if (value === "low") return "Rendah";
  return "Normal";
};

export const pickupStatusLabel = (status: PickupStatus) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "baru") return { label: "Baru", tone: "amber" as const };
  if (value === "dijadwalkan") return { label: "Dijadwalkan", tone: "sky" as const };
  if (value === "selesai") return { label: "Selesai", tone: "green" as const };
  if (value === "dibatalkan") return { label: "Dibatalkan", tone: "red" as const };
  return { label: String(status || "-"), tone: "neutral" as const };
};

export const consultationStatusLabel = (status: ConsultationStatus) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "baru") return { label: "Baru", tone: "amber" as const };
  if (value === "dibalas") return { label: "Dibalas", tone: "green" as const };
  if (value === "ditutup") return { label: "Ditutup", tone: "neutral" as const };
  return { label: String(status || "-"), tone: "neutral" as const };
};

export const getUserRoleLabel = (user: User) => {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const roleNames = roles.map((r) => String(r?.name ?? "").trim()).filter(Boolean);
  if (roleNames.length) return roleNames.join(", ");
  const label = String(user.role_label ?? "").trim();
  return label || "-";
};

export const toneStyles: Record<Tone, { border: string; icon: string; ring: string }> = {
  slate: {
    border: "border-l-slate-200",
    icon: "border-slate-200 bg-white text-slate-700",
    ring: "ring-slate-200",
  },
  primary: {
    border: "border-l-primary-300",
    icon: "border-primary-100 bg-primary-50 text-primary-700",
    ring: "ring-primary-100",
  },
  green: {
    border: "border-l-brandGreen-300",
    icon: "border-brandGreen-100 bg-brandGreen-50 text-brandGreen-700",
    ring: "ring-brandGreen-100",
  },
  sky: {
    border: "border-l-sky-300",
    icon: "border-sky-100 bg-sky-50 text-sky-700",
    ring: "ring-sky-100",
  },
  amber: {
    border: "border-l-amber-300",
    icon: "border-amber-100 bg-amber-50 text-amber-700",
    ring: "ring-amber-100",
  },
  red: {
    border: "border-l-red-300",
    icon: "border-red-100 bg-red-50 text-red-700",
    ring: "ring-red-100",
  },
};
