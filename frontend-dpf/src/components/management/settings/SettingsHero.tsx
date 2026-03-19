import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import type { DashboardRole } from "../../../components/management/dashboard/DashboardUtils";
import { useLang } from "../../../lib/i18n";
import { settingsDict, translate } from "../../../i18n/settings";

interface SettingsHeroProps {
  role: DashboardRole;
  displayName: string;
  displayEmail: string;
  roleLabel: (role: DashboardRole) => string;
}

export function SettingsHero({ role, displayName, displayEmail, roleLabel }: SettingsHeroProps) {
  const navigate = useNavigate();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(settingsDict, locale, key, fallback);

  return (
    <div className="relative overflow-hidden rounded-[40px] bg-slate-900 shadow-2xl">
      <div className="absolute inset-0 bg-brandGreen-600" />
      <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      
      <div className="relative z-10 px-8 py-10 md:px-12 md:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          {/* Avatar Section */}
          <div className="group relative shrink-0">
             <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-white text-3xl font-black text-brandGreen-600 shadow-xl transition-transform">
                {displayName.charAt(0).toUpperCase()}
             </div>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <h1 className="font-heading text-4xl font-black tracking-tight text-white md:text-6xl text-shadow-sm">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FontAwesomeIcon icon={faBriefcase} className="text-emerald-400" />
                {roleLabel(role)}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FontAwesomeIcon icon={faGlobe} className="text-emerald-400" />
                {displayEmail}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/${role}/dashboard`)}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-sm font-bold text-brandGreen-600 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("settings.hero.back_to_dashboard")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsHero;
