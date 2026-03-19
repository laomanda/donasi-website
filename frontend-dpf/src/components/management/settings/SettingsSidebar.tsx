import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../../../lib/i18n";
import { settingsDict, translate } from "../../../i18n/settings";

export function SettingsSidebar() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(settingsDict, locale, key, fallback);

  return (
    <aside className="space-y-6">
      <div className="sticky top-24 space-y-2 rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
        <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {t("settings.sidebar.title")}
        </p>
        <a 
          href="#account" 
          className="group flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors group-hover:text-brandGreen-600">
            <FontAwesomeIcon icon={faUser} />
          </div>
          {t("settings.sidebar.account")}
        </a>
        <a 
          href="#security" 
          className="group flex items-center gap-3 rounded-2xl bg-transparent px-5 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-100 transition-colors group-hover:text-emerald-500 group-hover:ring-emerald-100">
            <FontAwesomeIcon icon={faLock} />
          </div>
          {t("settings.sidebar.security")}
        </a>

        <div className="mt-6 border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 text-slate-400">
            <FontAwesomeIcon icon={faCircleInfo} className="text-sm" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {t("settings.sidebar.info")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SettingsSidebar;
