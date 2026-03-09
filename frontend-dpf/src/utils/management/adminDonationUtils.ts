export const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

export const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value);

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

export const getStatusTone = (status: string) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  if (s === "pending") return "bg-amber-500 text-white shadow-md shadow-amber-500/20";
  if (s === "failed" || s === "cancelled") return "bg-rose-600 text-white shadow-md shadow-rose-600/20";
  if (s === "expired") return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
  if (s === "active") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
};

export const getStatusLabel = (status: string) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return "Lunas";
  if (s === "pending") return "Menunggu";
  if (s === "failed") return "Gagal";
  if (s === "expired") return "Kedaluwarsa";
  if (s === "cancelled") return "Dibatalkan";
  if (s === "active") return "Aktif";
  return String(status || "-");
};

export const normalizeSourceLabel = (source: string | null | undefined) => {
  const s = String(source ?? "").toLowerCase();
  if (s === "midtrans") return "Midtrans";
  if (s === "manual") return "Manual";
  return source || "Misteri";
};
