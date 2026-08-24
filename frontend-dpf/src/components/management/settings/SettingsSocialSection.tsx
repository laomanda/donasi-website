import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faCircleCheck, faCircleInfo, faGears } from "@fortawesome/free-solid-svg-icons";
import type { DashboardRole } from "../../../components/management/dashboard/DashboardUtils";
import { useLang } from "../../../lib/i18n";
import { settingsDict, translate } from "../../../i18n/settings";

type SocialSettingsState = {
  instagramEnabled: boolean;
  youtubeEnabled: boolean;
};

type SettingsSocialSectionProps = {
  role?: DashboardRole;
  value: SocialSettingsState;
  loading: boolean;
  saving: boolean;
  onToggle: (key: keyof SocialSettingsState, checked: boolean) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
};

export function SettingsSocialSection({
  role,
  value,
  loading,
  saving,
  onToggle,
  onSave,
}: SettingsSocialSectionProps) {
  const { locale: rawLocale } = useLang();
  const locale = role === "mitra" ? rawLocale : "id";
  const t = (key: string, fallback?: string) => translate(settingsDict, locale, key, fallback);
  const disabled = loading || saving;

  return (
    <section id="social" className="scroll-mt-24 space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
          <FontAwesomeIcon icon={faGears} className="text-lg" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">{t("settings.social.title")}</h2>
          <p className="text-sm font-medium text-slate-500">{t("settings.social.subtitle")}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={onSave} className="space-y-6">
          <p className="text-sm text-slate-500">{t("settings.social.helper")}</p>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 p-5">
                  <div className="h-4 w-28 rounded-full bg-slate-100 animate-pulse" />
                  <div className="mt-4 h-3 w-full rounded-full bg-slate-100 animate-pulse" />
                  <div className="mt-2 h-3 w-2/3 rounded-full bg-slate-100 animate-pulse" />
                  <div className="mt-5 h-14 rounded-2xl bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  key: "instagramEnabled",
                  title: t("settings.social.instagram.title"),
                  description: t("settings.social.instagram.description"),
                  icon: faInstagram,
                  accent: "text-pink-600",
                },
                {
                  key: "youtubeEnabled",
                  title: t("settings.social.youtube.title"),
                  description: t("settings.social.youtube.description"),
                  icon: faYoutube,
                  accent: "text-red-600",
                },
              ].map((item) => {
                const checked = value[item.key as keyof SocialSettingsState];
                return (
                  <label
                    key={item.key}
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                      checked ? "border-brandGreen-200 bg-brandGreen-50/30" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onToggle(item.key as keyof SocialSettingsState, e.target.checked)}
                      className="mt-1 h-5 w-5 rounded accent-brandGreen-600"
                      disabled={disabled}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={item.icon} className={`text-lg ${item.accent}`} />
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                            checked
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <FontAwesomeIcon icon={checked ? faCircleCheck : faCircleInfo} />
                          {checked ? t("settings.social.enabled") : t("settings.social.disabled")}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-brandGreen-600 px-10 text-sm font-bold text-white shadow-xl shadow-brandGreen-600/20 transition-all hover:bg-brandGreen-700 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
            >
              <FontAwesomeIcon icon={saving ? faCircleInfo : faCircleCheck} className={saving ? "animate-spin" : ""} />
              {saving ? t("settings.social.saving") : t("settings.social.save")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SettingsSocialSection;
