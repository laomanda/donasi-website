export type DonationStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | string;

export type Donation = {
  id: number;
  donation_code?: string | null;
  donor_name?: string | null;
  donor_email?: string | null;
  donor_phone?: string | null;
  amount?: number | string | null;
  status?: DonationStatus | null;
  payment_source?: string | null;
  payment_method?: string | null;
  payment_channel?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  program?: { id?: number; title?: string | null } | null;
  donor_qualification?: string;
};

export const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

export const formatCount = (value: number | undefined) =>
  new Intl.NumberFormat("id-ID").format(Number.isFinite(Number(value)) ? Number(value) : 0);

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

export const getStatusTone = (status: DonationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return "bg-emerald-600 text-white ring-emerald-700/60";
  if (s === "pending") return "bg-amber-500 text-white ring-amber-600/60";
  if (s === "failed" || s === "cancelled") return "bg-rose-600 text-white ring-rose-700/60";
  if (s === "expired") return "bg-slate-400 text-white ring-slate-500/60";
  return "bg-slate-300 text-white ring-slate-400/60";
};

export const getStatusLabel = (status: DonationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return "Lunas";
  if (s === "pending") return "Menunggu";
  if (s === "failed") return "Gagal";
  if (s === "expired") return "Kedaluwarsa";
  if (s === "cancelled") return "Dibatalkan";
  return String(status || "-");
};

export const normalizeSourceLabel = (value: string | null | undefined) => {
  const s = String(value ?? "").trim().toLowerCase();
  if (!s) return "-";
  if (s === "midtrans") return "Midtrans";
  if (s === "manual") return "Manual";
  return value ?? "-";
};

export type ReportColumn = "donor" | "qualification" | "program" | "source" | "status" | "nominal" | "time";

export const ALL_COLUMNS: { id: ReportColumn; label: string; mandatory?: boolean }[] = [
  { id: "donor", label: "Donatur" },
  { id: "qualification", label: "Kualifikasi" },
  { id: "program", label: "Program" },
  { id: "source", label: "Sumber" },
  { id: "status", label: "Status" },
  { id: "nominal", label: "Nominal" },
  { id: "time", label: "Waktu" },
];
