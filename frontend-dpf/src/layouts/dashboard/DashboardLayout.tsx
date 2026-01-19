import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRotateRight,
  faBars,
  faBookOpen,
  faBuildingColumns,
  faChartLine,
  faChevronDown,
  faClipboardCheck,
  faClock,
  faGear,
  faGears,
  faGaugeHigh,
  faHandshake,
  faHeadset,
  faHeart,
  faImage,
  faListCheck,
  faMagnifyingGlass,
  faReceipt,
  faRightFromBracket,
  faSitemap,
  faTruckRampBox,
  faUserGroup,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import dpfLogo from "../../brand/dpf-icon.png";
import http from "../../lib/http";
import { clearAuthToken, clearAuthUser, getAuthToken, getAuthUser } from "../../lib/auth";
import { readShowClock, SETTINGS_EVENT } from "../../lib/settings";
import { resolveApiBaseUrl } from "../../lib/urls";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

export type DashboardRole = "superadmin" | "admin" | "editor";

type RoleTheme = {
  appName: string;
  accentRing: string;
  navActiveBg: string;
  navActiveText: string;
  navActiveIcon: string;
  pillBg: string;
  pillText: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: IconProp;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

type StoredUser = {
  id?: unknown;
  name?: unknown;
  email?: unknown;
  role_label?: unknown;
  roles?: { name?: unknown }[] | unknown;
};

type PaginationMeta = {
  total?: number;
};

const ROLE_LABEL: Record<DashboardRole, string> = {
  superadmin: "SuperAdmin",
  admin: "Admin",
  editor: "Editor",
};

const ROLE_THEME: Record<DashboardRole, RoleTheme> = {
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
};

const NAV_SECTIONS_BY_ROLE: Record<DashboardRole, NavSection[]> = {
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
      ],
    },
    {
      title: "Organisasi",
      items: [
        { label: "Mitra", href: "/editor/partners", icon: faHandshake },
        { label: "Struktur", href: "/editor/organization-members", icon: faSitemap },
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
      title: "Konten",
      items: [{ label: "Banner", href: "/admin/banners", icon: faImage }],
    },
    {
      title: "Operasional",
      items: [
        { label: "Donasi", href: "/admin/donations", icon: faReceipt },
        { label: "Konfirmasi Donasi", href: "/admin/donation-confirmations", icon: faClipboardCheck },
        { label: "Tugas Editor", href: "/admin/editor-tasks", icon: faListCheck },
        { label: "Jemput Wakaf", href: "/admin/pickup-requests", icon: faTruckRampBox },
        { label: "Konsultasi", href: "/admin/consultations", icon: faHeadset },
      ],
    },
    {
      title: "Keuangan",
      items: [
        { label: "Laporan Donasi", href: "/admin/reports/donations", icon: faChartLine },
        { label: "Rekening", href: "/admin/bank-accounts", icon: faBuildingColumns },
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
      items: [
        { label: "Pengguna", href: "/superadmin/users", icon: faUserGroup },
      ],
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
};

const normalizeRoleValue = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

const resolveUserRoles = (user: StoredUser | null): DashboardRole[] => {
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
  return roles;
};

const buildNavSections = (roles: DashboardRole[]): NavSection[] => {
  const sections = new Map<string, NavItem[]>();
  const seen = new Set<string>();

  roles.forEach((role) => {
    NAV_SECTIONS_BY_ROLE[role].forEach((section) => {
      const bucket = sections.get(section.title) ?? [];
      section.items.forEach((item) => {
        if (seen.has(item.href)) return;
        seen.add(item.href);
        bucket.push(item);
      });
      sections.set(section.title, bucket);
    });
  });

  return Array.from(sections.entries())
    .map(([title, items]) => ({ title, items }))
    .filter((section) => section.items.length);
};

const formatTimeHHMM = (value: number) => String(value).padStart(2, "0");

const getJakartaTimeParts = (date: Date) => {
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

const normalizeCount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
};

type DashboardLayoutProps = PropsWithChildren<{
  role: DashboardRole;
}>;

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = ROLE_THEME[role];
  const storedUser = useMemo(() => getAuthUser() as StoredUser | null, []);
  const userRoles = useMemo(() => resolveUserRoles(storedUser), [storedUser]);
  const navSections = useMemo(() => {
    const roles = userRoles.length ? userRoles : [role];
    return buildNavSections(roles);
  }, [role, userRoles]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [showClock, setShowClock] = useState(() => readShowClock());
  const [adminBadgeCounts, setAdminBadgeCounts] = useState<Record<string, number>>({});
  const [editorBadgeCounts, setEditorBadgeCounts] = useState<Record<string, number>>({});

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userName = typeof storedUser?.name === "string" ? storedUser.name : null;
  const userEmail = typeof storedUser?.email === "string" ? storedUser.email : null;
  const userRoleLabel = typeof storedUser?.role_label === "string" ? storedUser.role_label : null;

  useEffect(() => {
    setMobileSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (role !== "admin") return;
    let active = true;

    const loadCounts = async () => {
      try {
        const [donationsRes, pickupsRes, consultationsRes] = await Promise.all([
          http.get<PaginationMeta>("/admin/donations", {
            params: { status: "pending", payment_source: "manual", per_page: 1 },
          }),
          http.get<PaginationMeta>("/admin/pickup-requests", {
            params: { status: "baru", per_page: 1 },
          }),
          http.get<PaginationMeta>("/admin/consultations", {
            params: { status: "baru", per_page: 1 },
          }),
        ]);

        if (!active) return;
        const donationCount = normalizeCount(donationsRes.data?.total);
        const pickupCount = normalizeCount(pickupsRes.data?.total);
        const consultationCount = normalizeCount(consultationsRes.data?.total);
        setAdminBadgeCounts({
          "/admin/donation-confirmations": donationCount,
          "/admin/pickup-requests": pickupCount,
          "/admin/consultations": consultationCount,
        });
      } catch {
        if (!active) return;
      }
    };

    void loadCounts();
    return () => {
      active = false;
    };
  }, [role, location.pathname]);

  useEffect(() => {
    if (role !== "admin") return;
    let active = true;

    const loadCounts = async () => {
      try {
        const [donationsRes, pickupsRes, consultationsRes] = await Promise.all([
          http.get<PaginationMeta>("/admin/donations", {
            params: { status: "pending", payment_source: "manual", per_page: 1 },
          }),
          http.get<PaginationMeta>("/admin/pickup-requests", {
            params: { status: "baru", per_page: 1 },
          }),
          http.get<PaginationMeta>("/admin/consultations", {
            params: { status: "baru", per_page: 1 },
          }),
        ]);

        if (!active) return;
        const donationCount = normalizeCount(donationsRes.data?.total);
        const pickupCount = normalizeCount(pickupsRes.data?.total);
        const consultationCount = normalizeCount(consultationsRes.data?.total);
        setAdminBadgeCounts({
          "/admin/donation-confirmations": donationCount,
          "/admin/pickup-requests": pickupCount,
          "/admin/consultations": consultationCount,
        });
      } catch {
        if (!active) return;
      }
    };

    const intervalId = window.setInterval(loadCounts, 60_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [role]);

  useEffect(() => {
    if (role !== "editor") return;
    let active = true;
    let pollId: number | null = null;
    let echo: Echo<any> | null = null;
    let channelName: string | null = null;

    const applyCount = (count: number) => {
      if (!active) return;
      setEditorBadgeCounts({
        "/editor/tasks": count,
      });
    };

    const loadCounts = async () => {
      try {
        const tasksRes = await http.get<PaginationMeta>("/editor/tasks", {
          params: { status: "open", per_page: 1 },
        });

        if (!active) return;
        const taskCount = normalizeCount(tasksRes.data?.total);
        applyCount(taskCount);
      } catch {
        if (!active) return;
      }
    };

    void loadCounts();

    if (typeof window === "undefined") {
      return () => {
        active = false;
      };
    }

    const token = getAuthToken();
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY as string | undefined;
    const userIdRaw = (storedUser as StoredUser | null)?.id;
    const userId = typeof userIdRaw === "number" ? userIdRaw : Number(userIdRaw);

    const fallbackInterval = 5_000;

    if (!token || !pusherKey || !Number.isFinite(userId)) {
      pollId = window.setInterval(loadCounts, fallbackInterval);
      return () => {
        active = false;
        if (pollId) window.clearInterval(pollId);
      };
    }

    const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER as string | undefined;
    const host = import.meta.env.VITE_PUSHER_HOST as string | undefined;
    const portValue = import.meta.env.VITE_PUSHER_PORT as string | undefined;
    const scheme = (import.meta.env.VITE_PUSHER_APP_SCHEME as string | undefined) ?? "https";
    const port = Number(portValue || (scheme === "https" ? 443 : 80));

    (window as any).Pusher = Pusher;
    echo = new Echo({
      broadcaster: "pusher",
      key: pusherKey,
      cluster,
      forceTLS: scheme === "https",
      wsHost: host || undefined,
      wsPort: host ? port : undefined,
      wssPort: host ? port : undefined,
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${resolveApiBaseUrl()}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    channelName = `editor-tasks.${userId}`;
    echo.private(channelName).listen(".tasks.count", (payload: { count?: number }) => {
      applyCount(normalizeCount(payload?.count));
    });

    echo.connector?.pusher?.connection.bind("connected", () => {
      if (!active) return;
      if (pollId) {
        window.clearInterval(pollId);
        pollId = null;
      }
      void loadCounts();
    });

    echo.connector?.pusher?.connection.bind("error", () => {
      if (!active) return;
      if (!pollId) pollId = window.setInterval(loadCounts, fallbackInterval);
    });

    return () => {
      active = false;
      if (echo && channelName) {
        echo.leave(channelName);
      }
      if (echo) echo.disconnect();
      if (pollId) window.clearInterval(pollId);
    };
  }, [role, storedUser]);

  useEffect(() => {
    const onSync = () => setShowClock(readShowClock());
    window.addEventListener(SETTINGS_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;

    const onClick = (event: MouseEvent) => {
      const el = userMenuRef.current;
      if (!el) return;
      if (event.target instanceof Node && el.contains(event.target)) return;
      setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  const onLogout = async () => {
    try {
      await http.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAuthToken();
      clearAuthUser();
      navigate("/login", { replace: true });
    }
  };

  const onSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    navigate(`/${role}/search?q=${encodeURIComponent(value)}`);
  };

  const routeSearchQuery = useMemo(() => {
    if (!location.pathname.endsWith("/search")) return null;
    return (new URLSearchParams(location.search).get("q") ?? "").trim();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (routeSearchQuery === null) return;
    setQuery(routeSearchQuery);
  }, [routeSearchQuery]);

  return (
    <div className="dashboard-shell min-h-screen font-body text-slate-900 antialiased">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Tutup sidebar"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-slate-950 shadow-2xl">
            <SidebarContent
              role={role}
              theme={theme}
              navSections={navSections}
              badgeCounts={role === "admin" ? adminBadgeCounts : role === "editor" ? editorBadgeCounts : undefined}
              onClose={() => setMobileSidebarOpen(false)}
              showClose
            />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-900/40 bg-slate-950 lg:sticky lg:top-0 lg:block lg:h-screen">
          <SidebarContent
            role={role}
            theme={theme}
            navSections={navSections}
            badgeCounts={role === "admin" ? adminBadgeCounts : role === "editor" ? editorBadgeCounts : undefined}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:max-w-none lg:px-8">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Buka sidebar"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <form onSubmit={onSearchSubmit} className="min-w-0 flex-1 lg:max-w-md">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                    </span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari Cepat..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                    />
                  </div>
                </form>

                {showClock ? <WorkClock now={now} className="hidden min-w-0 lg:flex" /> : null}
              </div>

              <div ref={userMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={`inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 ${theme.accentRing}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    {(userName ?? ROLE_LABEL[role]).slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[10rem] truncate sm:block">{userName ?? ROLE_LABEL[role]}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    <div className="px-4 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Akun</p>

                      <div className="mt-3 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                          {(userName ?? ROLE_LABEL[role]).slice(0, 1).toUpperCase()}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">{userName ?? ROLE_LABEL[role]}</p>
                          <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{userEmail ?? "-"}</p>
                        </div>

                        <div className="shrink-0">
                          <div
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ring-slate-800/70 ${theme.pillBg} ${theme.pillText}`}
                          >
                            {userRoleLabel ?? ROLE_LABEL[role]}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => navigate(`/${role}/settings`)}
                        className="group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 transition group-hover:bg-white group-hover:ring-slate-300">
                          <FontAwesomeIcon icon={faGear} className="text-sm" />
                        </span>
                        <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                          Pengaturan
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
                          Pengaturan akun.
                        </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 transition group-hover:bg-white group-hover:ring-slate-300">
                          <FontAwesomeIcon icon={faArrowRotateRight} className="text-sm" />
                        </span>
                        <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                          Muat ulang halaman
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
                          Muat ulang data terbaru.
                        </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={onLogout}
                        className="group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-red-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 transition group-hover:bg-red-100 group-hover:ring-red-200">
                          <FontAwesomeIcon icon={faRightFromBracket} className="text-sm" />
                        </span>
                        <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-red-700 group-hover:text-red-800">Keluar</span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-red-600">
                          Keluar dari dashboard.
                        </span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:max-w-none lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  role,
  theme,
  navSections,
  badgeCounts,
  onClose,
  showClose,
}: {
  role: DashboardRole;
  theme: RoleTheme;
  navSections: NavSection[];
  badgeCounts?: Record<string, number>;
  onClose?: () => void;
  showClose?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between gap-3 px-6 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900">
            <img src={dpfLogo} alt="DPF" className="h-7 w-7 rounded-full border border-slate-400/80 object-contain" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">DPF</p>
            <p className="truncate font-heading text-base font-semibold text-white">{ROLE_LABEL[role]}</p>
          </div>
        </div>

        {showClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        ) : null}
      </div>

      <div className="px-6 pb-3">
        <div
          className={`inline-flex items-center rounded-full border border-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${theme.pillBg} ${theme.pillText}`}
        >
          {theme.appName}
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-4 pb-6">
        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-xl border-l-2 border-transparent px-4 py-2.5 text-sm font-semibold transition",
                        isActive
                          ? `${theme.navActiveBg} ${theme.navActiveText} border-brandGreen-500 shadow-sm`
                          : "text-slate-300 hover:border-slate-700 hover:bg-slate-900/60 hover:text-white",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={[
                            "w-5 text-sm transition",
                            isActive ? theme.navActiveIcon : "text-slate-500 group-hover:text-slate-200",
                          ].join(" ")}
                        />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {badgeCounts && badgeCounts[item.href] > 0 ? (
                          <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            {badgeCounts[item.href] > 99 ? "99+" : badgeCounts[item.href]}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

function WorkClock({ now, className }: { now: Date; className?: string }) {
  const { hour, minute } = getJakartaTimeParts(now);
  const minutesTotal = hour * 60 + minute;

  const isWorkHours = minutesTotal >= 9 * 60 && minutesTotal < 18 * 60 + 5;
  const tone = isWorkHours
    ? "bg-emerald-600 text-white ring-emerald-700/80"
    : "bg-rose-600 text-white ring-rose-700/80";
  const message = isWorkHours ? "Semangat Bekerja" : "Opss Anda Lembur, Lanjut Besok Yuk";

  return (
    <div className={["flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1", tone, className].join(" ")}>
      <FontAwesomeIcon icon={faClock} />
      <span className="font-bold tabular-nums">
        {formatTimeHHMM(hour)}:{formatTimeHHMM(minute)} WIB
      </span>
      <span className="text-[10px] font-bold opacity-70">|</span>
      <span className="min-w-0 max-w-[240px] truncate text-[11px] font-semibold">{message}</span>
    </div>
  );
}
