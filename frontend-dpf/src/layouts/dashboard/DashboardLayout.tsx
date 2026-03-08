import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { PropsWithChildren } from "react";

import http from "../../lib/http";
import { clearAuthToken, clearAuthUser, getAuthUser } from "../../lib/auth";
import { readShowClock, SETTINGS_EVENT } from "../../lib/settings";
import { useLang } from "../../lib/i18n";
import { mitraDict, translate } from "../../i18n/mitra";

import * as Utils from "../../components/management/dashboard/DashboardUtils";
import { DashboardSidebar } from "../../components/management/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/management/dashboard/DashboardHeader";

type DashboardLayoutProps = PropsWithChildren<{
  role: Utils.DashboardRole;
}>;

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, setLocale } = useLang();
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);

  const theme = Utils.ROLE_THEME[role];
  const isSearchEnabled = role === "editor" || role === "superadmin" || role === "admin";
  const storedUser = useMemo(() => getAuthUser() as Utils.StoredUser | null, []);
  const userRoles = useMemo(() => Utils.resolveUserRoles(storedUser), [storedUser]);
  const navSections = useMemo(() => {
    const roles = userRoles.length ? userRoles : [role];
    return Utils.buildNavSections(roles, t);
  }, [role, userRoles, locale]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [showClock, setShowClock] = useState(() => readShowClock());
  const [adminBadgeCounts, setAdminBadgeCounts] = useState<Record<string, number>>({});
  const [editorBadgeCounts, setEditorBadgeCounts] = useState<Record<string, number>>({});

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
    if (role !== "admin" && role !== "superadmin") return;
    let active = true;
    let pollId: number | null = null;

    const applyCounts = (values: {
      donationCount?: number;
      pickupCount?: number;
      consultationCount?: number;
      suggestionCount?: number;
    }) => {
      if (!active) return;
      setAdminBadgeCounts((prev) => ({
        ...prev,
        ...(values.donationCount !== undefined ? { "/admin/donation-confirmations": values.donationCount } : {}),
        ...(values.pickupCount !== undefined ? { "/admin/pickup-requests": values.pickupCount } : {}),
        ...(values.consultationCount !== undefined ? { "/admin/consultations": values.consultationCount } : {}),
        ...(values.suggestionCount !== undefined ? { "/admin/suggestions": values.suggestionCount } : {}),
      }));
    };

    const loadCounts = async () => {
      try {
        const promises: Promise<any>[] = [
          http.get<Utils.PaginationMeta>("/admin/donations", {
            params: { status: "pending", payment_source: "manual", per_page: 1 },
          }),
          http.get<Utils.PaginationMeta>("/admin/pickup-requests", {
            params: { status: "baru", per_page: 1 },
          }),
          http.get<Utils.PaginationMeta>("/admin/consultations", {
            params: { status: "baru", per_page: 1 },
          }),
        ];

        if (role === "admin") {
          promises.push(
            http.get<Utils.PaginationMeta>("/admin/suggestions", {
              params: { status: "baru", per_page: 1 },
            })
          );
        }

        const results = await Promise.all(promises);
        const [donationsRes, pickupsRes, consultationsRes, suggestionsRes] = results;

        if (!active) return;
        applyCounts({
          donationCount: Utils.normalizeCount(donationsRes.data?.total),
          pickupCount: Utils.normalizeCount(pickupsRes.data?.total),
          consultationCount: Utils.normalizeCount(consultationsRes.data?.total),
          suggestionCount: suggestionsRes ? Utils.normalizeCount(suggestionsRes.data?.total) : undefined,
        });
      } catch {
        if (!active) return;
      }
    };

    void loadCounts();

    const fallbackInterval = 30_000;
    pollId = window.setInterval(loadCounts, fallbackInterval);

    const onRefresh = () => void loadCounts();
    window.addEventListener("refresh-badges", onRefresh);

    return () => {
      active = false;
      if (pollId) window.clearInterval(pollId);
      window.removeEventListener("refresh-badges", onRefresh);
    };
  }, [role]);

  useEffect(() => {
    if (role !== "editor") return;
    let active = true;
    let pollId: number | null = null;

    const applyCount = (count: number) => {
      if (!active) return;
      setEditorBadgeCounts({
        "/editor/tasks": count,
      });
    };

    const loadCounts = async () => {
      try {
        const tasksRes = await http.get<Utils.PaginationMeta>("/editor/tasks", {
          params: { status: "open", per_page: 1 },
        });

        if (!active) return;
        const taskCount = Utils.normalizeCount(tasksRes.data?.total);
        applyCount(taskCount);
      } catch {
        if (!active) return;
      }
    };

    void loadCounts();

    const fallbackInterval = 5_000;
    pollId = window.setInterval(loadCounts, fallbackInterval);

    return () => {
      active = false;
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
    if (!isSearchEnabled) return;
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

  const currentBadgeCounts = (role === "admin" || role === "superadmin") ? adminBadgeCounts : role === "editor" ? editorBadgeCounts : undefined;

  return (
    <div className="dashboard-shell min-h-screen font-body text-slate-900 antialiased">
      <div className="flex min-h-screen">
        <DashboardSidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          role={role}
          theme={theme}
          navSections={navSections}
          badgeCounts={currentBadgeCounts}
          t={t}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            role={role}
            theme={theme}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
            isSearchEnabled={isSearchEnabled}
            query={query}
            setQuery={setQuery}
            onSearchSubmit={onSearchSubmit}
            showClock={showClock}
            now={now}
            locale={locale}
            setLocale={setLocale}
            langOpen={langOpen}
            setLangOpen={setLangOpen}
            userName={userName}
            userEmail={userEmail}
            userRoleLabel={userRoleLabel}
            userMenuOpen={userMenuOpen}
            setUserMenuOpen={setUserMenuOpen}
            onLogout={onLogout}
            t={t}
          />

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:max-w-none lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}