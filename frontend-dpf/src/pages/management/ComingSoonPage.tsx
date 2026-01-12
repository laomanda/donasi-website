import { Link } from "react-router-dom";
import { useLang } from "../../lib/i18n";
import { landingDict, translate as translateLanding } from "../../i18n/landing";

export function ComingSoonPage({ title, description }: { title: string; description?: string }) {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
  const descText = description ?? t("management.comingSoon.defaultDesc");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{t("management.comingSoon.badge")}</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{descText}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {t("management.comingSoon.back")}
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            {t("management.comingSoon.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonPage;
