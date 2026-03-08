import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faGaugeHigh,
  faListCheck,
  faBookOpen,
  faHeart,
  faImage,
  faTags,
  faHandshake,
  faSitemap,
  faBuildingColumns,
  faGear,
  faReceipt,
  faCheckCircle,
  faCommentDots,
  faTruckRampBox,
  faHeadset,
  faChartLine,
  faGears,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export type DashboardRole = "superadmin" | "admin" | "editor" | "mitra";

export type RoleTheme = {
  appName: string;
  accentRing: string;
  navActiveBg: string;
  navActiveText: string;
  navActiveIcon: string;
  pillBg: string;
  pillText: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: IconProp;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export type StoredUser = {
  id?: unknown;
  name?: unknown;
  email?: unknown;
  role_label?: unknown;
  roles?: { name?: unknown }[] | unknown;
};

export type PaginationMeta = {
  total?: number;
};

export const ROLE_LABEL: Record<DashboardRole, string> = {
  superadmin: "SuperAdmin",
  admin: "Admin",
  editor: "Editor",
  mitra: "Mitra",
};

export const ROLE_THEME: Record<DashboardRole, RoleTheme> = {
  superadmin: {
    appName: "Manajemen DPF",
    accentRing: "focus-visible:ring-brandGreen-400",
    navActiveBg: "bg-slate-900",
    navActiveText: "text-white",
    navActiveIcon: "text-brandGreen-400",
    pillBg: "bg-slate-900",
    pillText: "text-slate-100",
  },
  admin: {
    appName: "Manajemen DPF",
    accentRing: "focus-visible:ring-brandGreen-400",
    navActiveBg: "bg-slate-900",
    navActiveText: "text-white",
    navActiveIcon: "text-brandGreen-400",
    pillBg: "bg-slate-900",
    pillText: "text-slate-100",
  },
  editor: {
    appName: "Manajemen DPF",
    accentRing: "focus-visible:ring-brandGreen-400",
    navActiveBg: "bg-slate-900",
    navActiveText: "text-white",
    navActiveIcon: "text-brandGreen-400",
    pillBg: "bg-slate-900",
    pillText: "text-slate-100",
  },
  mitra: {
    appName: "Dashboard Mitra",
    accentRing: "focus-visible:ring-brandGreen-400",
    navActiveBg: "bg-slate-900",
    navActiveText: "text-white",
    navActiveIcon: "text-brandGreen-400",
    pillBg: "bg-slate-900",
    pillText: "text-slate-100",
  },
};

export const NAV_SECTIONS_BY_ROLE: Record<DashboardRole, NavSection[]> = {
  editor: [
    {
      title: "Ringkasan",
      items: [
        { label: "Dashboard", href: "/editor/dashboard", icon: faGaugeHigh },
        { label: "Tugas Editor", href: "/editor/tasks", icon: faListCheck },
      ],
    },
    {
      title: "Konten",
      items: [
        { label: "Artikel", href: "/editor/articles", icon: faBookOpen },
        { label: "Program", href: "/editor/programs", icon: faHeart },
        { label: "Banner", href: "/editor/banners", icon: faImage },
        { label: "Tags", href: "/editor/tags", icon: faTags },
      ],
    },
    {
      title: "Organisasi",
      items: [
        { label: "Mitra", href: "/editor/partners", icon: faHandshake },
        { label: "Struktur", href: "/editor/organization-members", icon: faSitemap },
        { label: "Rekening", href: "/editor/bank-accounts", icon: faBuildingColumns },
      ],
    },
    {
      title: "Alat",
      items: [{ label: "Pengaturan", href: "/editor/settings", icon: faGear }],
    },
  ],
  admin: [
    {
      title: "Ringkasan",
      items: [{ label: "Dashboard", href: "/admin/dashboard", icon: faGaugeHigh }],
    },
    {
      title: "Operasional",
      items: [
        { label: "Donasi", href: "/admin/donations", icon: faReceipt },
        { label: "Konfirmasi Donasi", href: "/admin/donation-confirmations", icon: faCheckCircle },
        { label: "Saran Wakaf", href: "/admin/suggestions", icon: faCommentDots },
        { label: "Editor Tasks", href: "/admin/editor-tasks", icon: faListCheck },
        { label: "Jemput Wakaf", href: "/admin/pickup-requests", icon: faTruckRampBox },
        { label: "Konsultasi", href: "/admin/consultations", icon: faHeadset },
      ],
    },
    {
      title: "Keuangan",
      items: [
        { label: "Laporan Donasi", href: "/admin/reports/donations", icon: faChartLine },
        { label: "Alokasi", href: "/admin/allocations", icon: faHandshake },
      ],
    },
    {
      title: "Sistem",
      items: [{ label: "Pengaturan", href: "/admin/settings", icon: faGears }],
    },
  ],
  superadmin: [
    {
      title: "Ringkasan",
      items: [{ label: "Dashboard", href: "/superadmin/dashboard", icon: faGaugeHigh }],
    },
    {
      title: "Akses",
      items: [{ label: "Pengguna", href: "/superadmin/users", icon: faUserGroup }],
    },
    {
      title: "Laporan",
      items: [{ label: "Laporan Donasi", href: "/superadmin/reports/donations", icon: faChartLine }],
    },
    {
      title: "Sistem",
      items: [
        { label: "Tugas Editor", href: "/superadmin/editor-tasks", icon: faListCheck },
        { label: "Pengaturan", href: "/superadmin/settings", icon: faGear },
      ],
    },
  ],
  mitra: [
    {
      title: "Ringkasan",
      items: [{ label: "Dashboard", href: "/mitra/dashboard", icon: faGaugeHigh }],
    },
    {
      title: "Transparansi",
      items: [
        { label: "Bukti Alokasi", href: "/mitra/allocations", icon: faHandshake },
        { label: "Riwayat Donasi", href: "/mitra/donations", icon: faReceipt },
      ],
    },
    {
      title: "Dukungan",
      items: [{ label: "Pengaturan", href: "/mitra/settings", icon: faGear }],
    },
  ],
};

export const normalizeRoleValue = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

export const resolveUserRoles = (user: StoredUser | null): DashboardRole[] => {
  if (!user) return [];
  const candidates: string[] = [];

  if (Array.isArray(user.roles)) {
    user.roles.forEach((role) => {
      if (role && typeof role === "object" && typeof role.name === "string") {
        candidates.push(role.name);
      }
    });
  }

  if (typeof user.role_label === "string") {
    candidates.push(user.role_label);
  }

  const normalized = new Set(candidates.map((value) => normalizeRoleValue(value)));
  const roles: DashboardRole[] = [];
  if (normalized.has("superadmin")) roles.push("superadmin");
  if (normalized.has("admin")) roles.push("admin");
  if (normalized.has("editor")) roles.push("editor");
  if (normalized.has("mitra")) roles.push("mitra");
  return roles;
};

export const buildNavSections = (roles: DashboardRole[], t: any): NavSection[] => {
  const sections = new Map<string, NavItem[]>();
  const seen = new Set<string>();

  const isSuperAdmin = roles.includes("superadmin");

  roles.forEach((role) => {
    NAV_SECTIONS_BY_ROLE[role].forEach((section) => {
      const bucket = sections.get(t(`nav.section.${section.title}`, section.title)) ?? [];
      section.items.forEach((item) => {
        if (seen.has(item.href)) return;
        if (isSuperAdmin && item.href.includes("suggestions")) return;
        seen.add(item.href);
        bucket.push({
          ...item,
          label: t(`nav.item.${item.label}`, item.label),
        });
      });
      sections.set(t(`nav.section.${section.title}`, section.title), bucket);
    });
  });

  return Array.from(sections.entries())
    .map(([title, items]) => ({ title, items }))
    .filter((section) => section.items.length);
};

export const formatTimeHHMM = (value: number) => String(value).padStart(2, "0");

export const getJakartaTimeParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return {
    hour: Number.isNaN(hour) ? 0 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
  };
};

export const normalizeCount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
};
