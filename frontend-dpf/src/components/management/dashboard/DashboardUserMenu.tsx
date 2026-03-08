import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faGear, faArrowRotateRight, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import type { DashboardRole, RoleTheme } from "./DashboardUtils";
import { ROLE_LABEL } from "./DashboardUtils";


interface DashboardUserMenuProps {
  role: DashboardRole;
  theme: RoleTheme;
  userName: string | null;
  userEmail: string | null;
  userRoleLabel: string | null;
  userMenuOpen: boolean;
  setUserMenuOpen: (o: boolean) => void;
  onLogout: () => void;
  t: (key: string, fallback?: string) => string;
}

export function DashboardUserMenu({
  role,
  theme,
  userName,
  userEmail,
  userRoleLabel,
  userMenuOpen,
  setUserMenuOpen,
  onLogout,
  t,
}: DashboardUserMenuProps) {
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen, setUserMenuOpen]);

  const displayName = userName ?? ROLE_LABEL[role];

  return (
    <div ref={userMenuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className={`inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 ${theme.accentRing}`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
          {displayName.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:block">{displayName}</span>
        <FontAwesomeIcon icon={faChevronDown} className="text-xs text-slate-400" />
      </button>

      {userMenuOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="px-4 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{t("account.title", "Akun")}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{userEmail ?? "-"}</p>
              </div>
              <div className="shrink-0">
                <div className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ring-slate-800/70 ${theme.pillBg} ${theme.pillText}`}>
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
                <span className="block text-sm font-semibold text-slate-800 group-hover:text-slate-900">{t("account.settings", "Pengaturan")}</span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{t("account.settings_desc", "Pengaturan akun.")}</span>
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
                <span className="block text-sm font-semibold text-slate-800 group-hover:text-slate-900">{t("account.refresh", "Muat ulang halaman")}</span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{t("account.refresh_desc", "Muat ulang data terbaru.")}</span>
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
                <span className="block text-sm font-semibold text-red-700 group-hover:text-red-800">{t("account.logout", "Keluar")}</span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-red-600">{t("account.logout_desc", "Keluar dari dashboard.")}</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
