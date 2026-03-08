export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const getProgramStatusLabel = (status: string | null | undefined) => {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "active") return { label: "Berjalan", tone: "green" as const };
  if (normalized === "completed" || normalized === "archived") return { label: "Tersalurkan", tone: "neutral" as const };
  return { label: "Draf", tone: "amber" as const };
};

export const badgeTone = (tone: "neutral" | "green" | "amber") => {
  if (tone === "green") return "bg-brandGreen-600 text-white ring-brandGreen-100";
  if (tone === "amber") return "bg-primary-500 text-white ring-primary-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
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

export const getUserStatusTone = (isActive: boolean) =>
  isActive
    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
    : "bg-red-500 text-white shadow-md shadow-red-500/20";

interface UserRoles {
  roles?: { id?: number; name: string }[];
  role_label?: string | null;
}

export const getRoleLabel = (user: UserRoles) => {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const roleNames = roles
    .map((r) => String(r?.name ?? "").trim())
    .filter(Boolean);

  if (roleNames.length) {
    return roleNames.map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(", ");
  }

  const label = String(user.role_label ?? "").trim();
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "-";
};

export const buildTrend = (base: number, multipliers: number[]) =>
  multipliers.map((mult) => Math.max(0, Math.round(base * mult)));
