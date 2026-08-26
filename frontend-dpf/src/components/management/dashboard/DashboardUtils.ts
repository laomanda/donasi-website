import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faGaugeHigh,
  faBookOpen,
  faHeart,
  faImages,
  faSliders,
  faCameraRetro,
  faStore,
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
  faShieldHalved,
  faBookmark,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

import type { ToneKey } from "../StatCard";

export type DashboardRole = "superadmin" | "admin" | "editor" | "keuangan" | "mitra" | "custom";

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
  permission?: string;
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
  permissions?: { name?: string }[] | string[] | any;
};

export type PaginationMeta = {
  total?: number;
};

export const ROLE_LABEL: Record<DashboardRole, string> = {
  superadmin: "SuperAdmin",
  admin: "Admin",
  editor: "Editor",
  keuangan: "Keuangan",
  mitra: "Mitra",
  custom: "Staff",
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
  keuangan: {
    appName: "Keuangan DPF",
    accentRing: "focus-visible:ring-emerald-400",
    navActiveBg: "bg-slate-900",
    navActiveText: "text-white",
    navActiveIcon: "text-emerald-400",
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
  custom: {
    appName: "Manajemen DPF",
    accentRing: "focus-visible:ring-slate-400",
    navActiveBg: "bg-slate-900",
    navActiveText: "text-white",
    navActiveIcon: "text-slate-400",
    pillBg: "bg-slate-900",
    pillText: "text-slate-100",
  },
};

export const PERMISSION_TEMPLATES: Record<string, string[]> = {
  admin: [
    "manage donations",
    "manage pickup_requests",
    "manage consultations",
    "manage suggestions",
    "manage allocations",
    "view reports",
    "manage bank_accounts",
  ],
  keuangan: [
    "manage donations",
    "manage allocations",
    "view reports",
    "manage bank_accounts",
  ],
  editor: [
    "manage articles",
    "manage programs",
    "manage banners",
    "manage gallery dpf",
    "manage gallery mitra",
    "manage produk mitra",
    "manage tags",
    "manage partners",
    "manage organization",
  ],
  superadmin: [],
  mitra: [],
};

export type QuickAction = {
  permission: string;
  label: string;
  description: string;
  href: string;
  icon: IconProp;
  tone: ToneKey;
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Kelola Artikel",
    description: "AKSES PENUH MODUL",
    href: "/editor/articles",
    permission: "manage articles",
    icon: faBookOpen,
    tone: "blue",
  },
  {
    label: "Kelola Program",
    description: "AKSES PENUH MODUL",
    href: "/editor/programs",
    permission: "manage programs",
    icon: faHeart,
    tone: "rose",
  },
  {
    label: "Kelola Banner",
    description: "AKSES PENUH MODUL",
    href: "/editor/banners",
    permission: "manage banners",
    icon: faSliders,
    tone: "purple",
  },
  {
    label: "Kelola Gallery DPF",
    description: "AKSES PENUH MODUL",
    href: "/editor/gallery-dpf",
    permission: "manage gallery dpf",
    icon: faImages,
    tone: "teal",
  },
  {
    label: "Kelola Gallery Mitra",
    description: "AKSES PENUH MODUL",
    href: "/editor/gallery-mitra",
    permission: "manage gallery mitra",
    icon: faCameraRetro,
    tone: "teal",
  },
  {
    label: "Kelola Produk Mitra",
    description: "AKSES PENUH MODUL",
    href: "/editor/mitra-products",
    permission: "manage produk mitra",
    icon: faStore,
    tone: "teal",
  },
  {
    label: "Kelola Donasi",
    description: "AKSES PENUH MODUL",
    href: "/admin/donations",
    permission: "manage donations",
    icon: faReceipt,
    tone: "emerald",
  },
  {
    label: "Kelola Mitra",
    description: "AKSES PENUH MODUL",
    href: "/editor/partners",
    permission: "manage partners",
    icon: faHandshake,
    tone: "orange",
  },
  {
    label: "Kelola Organisasi",
    description: "AKSES PENUH MODUL",
    href: "/editor/organization-members",
    permission: "manage organization",
    icon: faSitemap,
    tone: "amber",
  },
  {
    label: "Kelola Rekening Bank",
    description: "AKSES PENUH MODUL",
    href: "/editor/bank-accounts",
    permission: "manage bank_accounts",
    icon: faBuildingColumns,
    tone: "slate",
  },
  {
    label: "Kelola Saran",
    description: "AKSES PENUH MODUL",
    href: "/admin/suggestions",
    permission: "manage suggestions",
    icon: faCommentDots,
    tone: "fuchsia",
  },
  {
    label: "Kelola Jemput Wakaf",
    description: "AKSES PENUH MODUL",
    href: "/admin/pickup-requests",
    permission: "manage pickup_requests",
    icon: faTruckRampBox,
    tone: "teal",
  },
  {
    label: "Kelola Konsultasi",
    description: "AKSES PENUH MODUL",
    href: "/admin/consultations",
    permission: "manage consultations",
    icon: faHeadset,
    tone: "sky",
  },
  {
    label: "Kelola Tag",
    description: "AKSES PENUH MODUL",
    href: "/editor/tags",
    permission: "manage tags",
    icon: faTags,
    tone: "pink",
  },
  {
    label: "Kelola Pengguna",
    description: "AKSES PENUH MODUL",
    href: "/superadmin/users",
    permission: "manage users",
    icon: faUserGroup,
    tone: "indigo",
  },
  {
    label: "Kelola Hak Akses",
    description: "AKSES PENUH MODUL",
    href: "/superadmin/roles",
    permission: "manage roles",
    icon: faShieldHalved,
    tone: "cyan",
  },
  {
    label: "Lihat Laporan",
    description: "AKSES PENUH MODUL",
    href: "/admin/reports/donations",
    permission: "view reports",
    icon: faChartLine,
    tone: "violet",
  },
  {
    label: "Kelola Alokasi",
    description: "AKSES PENUH MODUL",
    href: "/admin/allocations",
    permission: "manage allocations",
    icon: faHandshake,
    tone: "lime",
  },
];

export const NAV_SECTIONS_BY_ROLE: Record<DashboardRole, NavSection[]> = {
  editor: [
    {
      title: "Ringkasan",
      items: [
        { label: "Dashboard", href: "/editor/dashboard", icon: faGaugeHigh },
      ],
    },
    {
      title: "Konten",
      items: [
        { label: "Artikel", href: "/editor/articles", icon: faBookOpen, permission: "manage articles" },
        { label: "Program", href: "/editor/programs", icon: faHeart, permission: "manage programs" },
        { label: "Banner", href: "/editor/banners", icon: faSliders, permission: "manage banners" },
        { label: "Gallery DPF", href: "/editor/gallery-dpf", icon: faImages, permission: "manage gallery dpf" },
        { label: "Gallery Mitra", href: "/editor/gallery-mitra", icon: faCameraRetro, permission: "manage gallery mitra" },
        { label: "Produk Mitra", href: "/editor/mitra-products", icon: faStore, permission: "manage produk mitra" },
        { label: "Tags", href: "/editor/tags", icon: faTags, permission: "manage tags" },
      ],
    },
    {
      title: "Organisasi",
      items: [
        { label: "Mitra", href: "/editor/partners", icon: faHandshake, permission: "manage partners" },
        { label: "Struktur", href: "/editor/organization-members", icon: faSitemap, permission: "manage organization" },
        { label: "Rekening", href: "/editor/bank-accounts", icon: faBuildingColumns, permission: "manage bank_accounts" },
      ],
    },
    {
      title: "Alat",
      items: [
        { label: "Pengaturan", href: "/editor/settings", icon: faGear },
      ],
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
        { label: "Donasi", href: "/admin/donations", icon: faReceipt, permission: "manage donations" },
        { label: "Konfirmasi Donasi", href: "/admin/donation-confirmations", icon: faCheckCircle, permission: "manage donations" },
        { label: "Saran Wakaf", href: "/admin/suggestions", icon: faCommentDots, permission: "manage suggestions" },
        { label: "Jemput Wakaf", href: "/admin/pickup-requests", icon: faTruckRampBox, permission: "manage pickup_requests" },
        { label: "Konsultasi", href: "/admin/consultations", icon: faHeadset, permission: "manage consultations" },
      ],
    },
    {
      title: "Keuangan",
      items: [
        { label: "Laporan Donasi", href: "/admin/reports/donations", icon: faChartLine, permission: "view reports" },
        { label: "Penyaluran", href: "/admin/allocations", icon: faHandshake, permission: "manage allocations" },
      ],
    },
    {
      title: "Sistem",
      items: [
        { label: "Pengaturan", href: "/admin/settings", icon: faGears },
      ],
    },
  ],
  superadmin: [
    {
      title: "Ringkasan",
      items: [{ label: "Dashboard", href: "/superadmin/dashboard", icon: faGaugeHigh }],
    },
    {
      title: "Akses",
      items: [
        { label: "Pengguna", href: "/superadmin/users", icon: faUserGroup, permission: "manage users" },
        { label: "Roles", href: "/superadmin/roles", icon: faShieldHalved, permission: "manage roles" },
      ],
    },
    {
      title: "Laporan & Pembukuan",
      items: [
        { label: "Laporan Arus Kas", href: "/superadmin/reports/cashflow", icon: faCoins, permission: "view reports" },
        { label: "Laporan Donasi", href: "/superadmin/reports/donations", icon: faChartLine, permission: "view reports" },
      ],
    },
    {
      title: "Sistem",
      items: [
        { label: "Pengaturan", href: "/superadmin/settings", icon: faGear },
      ],
    },
  ],
  keuangan: [
    {
      title: "Ringkasan",
      items: [{ label: "Dashboard", href: "/keuangan/dashboard", icon: faGaugeHigh }],
    },
    {
      title: "Kas Masuk",
      items: [
        { label: "Donasi", href: "/keuangan/donations", icon: faReceipt, permission: "manage donations" },
        { label: "Konfirmasi Donasi", href: "/keuangan/donation-confirmations", icon: faCheckCircle, permission: "manage donations" },
      ],
    },
    {
      title: "Kas Keluar",
      items: [
        { label: "Penyaluran", href: "/keuangan/allocations", icon: faHandshake, permission: "manage allocations" },
      ],
    },
    {
      title: "Rekening",
      items: [
        { label: "Rekening Bank", href: "/keuangan/bank-accounts", icon: faBuildingColumns, permission: "manage bank_accounts" },
      ],
    },
    {
      title: "Laporan & Pembukuan",
      items: [
        { label: "Laporan Arus Kas", href: "/keuangan/reports/cashflow", icon: faCoins, permission: "view reports" },
        { label: "Laporan Donasi", href: "/keuangan/reports/donations", icon: faChartLine, permission: "view reports" },
      ],
    },
    {
      title: "Sistem",
      items: [
        { label: "Pengaturan", href: "/keuangan/settings", icon: faGear },
      ],
    },
  ],
  custom: [
    {
      title: "Ringkasan",
      items: [{ label: "Dashboard", href: "/management/dashboard", icon: faGaugeHigh }],
    },
    {
      title: "Konten",
      items: [
        { label: "Artikel", href: "/editor/articles", icon: faBookOpen, permission: "manage articles" },
        { label: "Program", href: "/editor/programs", icon: faHeart, permission: "manage programs" },
        { label: "Banner", href: "/editor/banners", icon: faSliders, permission: "manage banners" },
        { label: "Gallery DPF", href: "/editor/gallery-dpf", icon: faImages, permission: "manage gallery dpf" },
        { label: "Gallery Mitra", href: "/editor/gallery-mitra", icon: faCameraRetro, permission: "manage gallery mitra" },
        { label: "Produk Mitra", href: "/editor/mitra-products", icon: faStore, permission: "manage produk mitra" },
        { label: "Tags", href: "/editor/tags", icon: faTags, permission: "manage tags" },
      ],
    },
    {
      title: "Operasional",
      items: [
        { label: "Donasi", href: "/admin/donations", icon: faReceipt, permission: "manage donations" },
        { label: "Konfirmasi Donasi", href: "/admin/donation-confirmations", icon: faCheckCircle, permission: "manage donations" },
        { label: "Saran Wakaf", href: "/admin/suggestions", icon: faCommentDots, permission: "manage suggestions" },
        { label: "Jemput Wakaf", href: "/admin/pickup-requests", icon: faTruckRampBox, permission: "manage pickup_requests" },
        { label: "Konsultasi", href: "/admin/consultations", icon: faHeadset, permission: "manage consultations" },
      ],
    },
    {
      title: "Organisasi",
      items: [
        { label: "Mitra", href: "/editor/partners", icon: faHandshake, permission: "manage partners" },
        { label: "Struktur", href: "/editor/organization-members", icon: faSitemap, permission: "manage organization" },
        { label: "Rekening", href: "/editor/bank-accounts", icon: faBuildingColumns, permission: "manage bank_accounts" },
      ],
    },
    {
      title: "Keuangan",
      items: [
        { label: "Laporan Donasi", href: "/admin/reports/donations", icon: faChartLine, permission: "view reports" },
        { label: "Penyaluran", href: "/admin/allocations", icon: faHandshake, permission: "manage allocations" },
      ],
    },
    {
      title: "Akses",
      items: [
        { label: "Pengguna", href: "/superadmin/users", icon: faUserGroup, permission: "manage users" },
        { label: "Roles", href: "/superadmin/roles", icon: faShieldHalved, permission: "manage roles" },
      ],
    },
    {
      title: "Sistem",
      items: [
        { label: "Pengaturan", href: "/admin/settings", icon: faGear },
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
        { label: "Item Tersimpan", href: "/mitra/saved-items", icon: faBookmark },
        { label: "Bukti Penyaluran", href: "/mitra/allocations", icon: faHandshake },
        { label: "Riwayat Donasi", href: "/mitra/donations", icon: faReceipt },
      ],
    },
    {
      title: "Dukungan",
      items: [
        { label: "Pengaturan", href: "/mitra/settings", icon: faGear },
      ],
    },
  ],
};

export const normalizeRoleValue = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

export const resolveUserRoles = (user: StoredUser | null): DashboardRole[] => {
  if (!user) return [];
  const candidates: string[] = [];

  // 1. Spatie Roles are the primary single source of truth
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    user.roles.forEach((role) => {
      if (role && typeof role === "object" && typeof role.name === "string") {
        candidates.push(role.name);
      } else if (typeof role === "string") {
        candidates.push(role);
      }
    });
  } else if (typeof user.role_label === "string" && user.role_label.trim() !== "") {
    // 2. Only fallback to role_label if user.roles is completely empty
    candidates.push(user.role_label);
  }

  const normalized = new Set(candidates.map((value) => normalizeRoleValue(value)));
  const roles: DashboardRole[] = [];
  if (normalized.has("superadmin")) roles.push("superadmin");
  if (normalized.has("admin")) roles.push("admin");
  if (normalized.has("editor")) roles.push("editor");
  if (normalized.has("keuangan")) roles.push("keuangan");
  if (normalized.has("mitra")) roles.push("mitra");

  if (roles.length === 0 && candidates.length > 0) {
    roles.push("custom");
  }

  if (roles.length === 0) {
    const permissions = resolveUserPermissions(user);
    if (permissions.length > 0) {
      roles.push("custom");
    }
  }

  return roles;
};

export const resolveUserPermissions = (user: StoredUser | null): string[] => {
  if (!user) return [];
  const permissions: string[] = [];

  if (Array.isArray(user.permissions)) {
    user.permissions.forEach((p: any) => {
      if (typeof p === "string") permissions.push(p);
      else if (p && typeof p === "object" && typeof p.name === "string") {
        permissions.push(p.name);
      }
    });
  }

  if (Array.isArray(user.roles)) {
    user.roles.forEach((role: any) => {
      if (role && typeof role === "object" && Array.isArray(role.permissions)) {
        role.permissions.forEach((p: any) => {
          if (typeof p === "string") permissions.push(p);
          else if (p && typeof p === "object" && typeof p.name === "string") {
            permissions.push(p.name);
          }
        });
      }
    });
  }

  return Array.from(new Set(permissions));
};

export const buildNavSections = (roles: DashboardRole[], permissions: string[], t: any): NavSection[] => {
  const sections = new Map<string, NavItem[]>();
  const seen = new Set<string>();

  const isSuperAdmin = roles.includes("superadmin");
  const permissionSet = new Set(permissions);

  roles.forEach((role) => {
    NAV_SECTIONS_BY_ROLE[role].forEach((section) => {
      const bucket = sections.get(t(`nav.section.${section.title}`, section.title)) ?? [];
      section.items.forEach((item) => {
        if (seen.has(item.href)) return;

        if (!isSuperAdmin && item.permission && !permissionSet.has(item.permission)) return;

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
