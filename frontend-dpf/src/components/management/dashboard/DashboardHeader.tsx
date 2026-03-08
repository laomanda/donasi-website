import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import type { DashboardRole, RoleTheme } from "./DashboardUtils";
import { DashboardSearch } from "./DashboardSearch";
import { DashboardWorkClock } from "./DashboardWorkClock";
import { DashboardLangSwitcher } from "./DashboardLangSwitcher";
import { DashboardUserMenu } from "./DashboardUserMenu";

interface DashboardHeaderProps {
  role: DashboardRole;
  theme: RoleTheme;
  onOpenSidebar: () => void;
  isSearchEnabled: boolean;
  query: string;
  setQuery: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  showClock: boolean;
  now: Date;
  locale: string;
  setLocale: (l: "id" | "en") => void;
  langOpen: boolean;
  setLangOpen: (o: boolean) => void;
  userName: string | null;
  userEmail: string | null;
  userRoleLabel: string | null;
  userMenuOpen: boolean;
  setUserMenuOpen: (o: boolean) => void;
  onLogout: () => void;
  t: (key: string, fallback?: string) => string;
}

export function DashboardHeader({
  role,
  theme,
  onOpenSidebar,
  isSearchEnabled,
  query,
  setQuery,
  onSearchSubmit,
  showClock,
  now,
  locale,
  setLocale,
  langOpen,
  setLangOpen,
  userName,
  userEmail,
  userRoleLabel,
  userMenuOpen,
  setUserMenuOpen,
  onLogout,
  t,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:max-w-none lg:px-8">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          onClick={onOpenSidebar}
          aria-label={t("nav.open", "Buka sidebar")}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {isSearchEnabled && (
            <DashboardSearch
              query={query}
              setQuery={setQuery}
              onSubmit={onSearchSubmit}
              placeholder={t("nav.search", "Cari Cepat...")}
            />
          )}

          {showClock && (
            <DashboardWorkClock
              now={now}
              showStatus={role !== "mitra"}
              locale={locale}
              className="hidden min-w-0 lg:flex"
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {role === "mitra" && (
            <DashboardLangSwitcher
              locale={locale}
              setLocale={setLocale}
              langOpen={langOpen}
              setLangOpen={setLangOpen}
            />
          )}

          <DashboardUserMenu
            role={role}
            theme={theme}
            userName={userName}
            userEmail={userEmail}
            userRoleLabel={userRoleLabel}
            userMenuOpen={userMenuOpen}
            setUserMenuOpen={setUserMenuOpen}
            onLogout={onLogout}
            t={t}
          />
        </div>
      </div>
    </header>
  );
}
