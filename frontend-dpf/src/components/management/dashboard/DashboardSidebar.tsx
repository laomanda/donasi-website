import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { dpfIcon } from "@/assets/brand";
import type { DashboardRole, RoleTheme, NavSection } from "./DashboardUtils";

interface SidebarContentProps {
  role: DashboardRole;
  theme: RoleTheme;
  navSections: NavSection[];
  badgeCounts?: Record<string, number>;
  onClose?: () => void;
  showClose?: boolean;
  t: (key: string, fallback?: string) => string;
}

export function SidebarContent({
  role,
  theme,
  navSections,
  badgeCounts,
  onClose,
  showClose,
  t,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between gap-3 px-6 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900">
            <img src={dpfIcon} alt="DPF" className="h-7 w-7 rounded-full border border-slate-400/80 object-contain" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">DPF</p>
            <p className="truncate font-heading text-base font-semibold text-white">{t(`role.${role}`, role)}</p>
          </div>
        </div>

        {showClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.close", "Tutup sidebar")}
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
          {t(`app.${role}`, theme.appName)}
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

interface DashboardSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
  role: DashboardRole;
  theme: RoleTheme;
  navSections: NavSection[];
  badgeCounts?: Record<string, number>;
  t: (key: string, fallback?: string) => string;
}

export function DashboardSidebar({
  mobileOpen,
  setMobileOpen,
  role,
  theme,
  navSections,
  badgeCounts,
  t,
}: DashboardSidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={t("nav.close", "Tutup sidebar")}
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-slate-950 shadow-2xl">
            <SidebarContent
              role={role}
              theme={theme}
              navSections={navSections}
              badgeCounts={badgeCounts}
              onClose={() => setMobileOpen(false)}
              showClose
              t={t}
            />
          </aside>
        </div>
      )}

      <aside className="hidden w-72 shrink-0 border-r border-slate-900/40 bg-slate-950 lg:sticky lg:top-0 lg:block lg:h-screen">
        <SidebarContent
          role={role}
          theme={theme}
          navSections={navSections}
          badgeCounts={badgeCounts}
          t={t}
        />
      </aside>
    </>
  );
}
