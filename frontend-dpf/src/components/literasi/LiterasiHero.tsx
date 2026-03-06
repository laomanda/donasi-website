import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

interface LiterasiHeroProps {
  t: (key: string, fallback?: string) => string;
}

export function LiterasiHero({ t }: LiterasiHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-50 pb-20 pt-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 font-heading text-xs font-semibold tracking-wide text-primary-700 shadow-sm border border-primary-100">
            <FontAwesomeIcon icon={faNewspaper} />
            {t("literasi.hero.badge")}
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-heading">
            {t("literasi.hero.title.leading")} <span className="text-brandGreen-600">{t("literasi.hero.title.highlight")}</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            {t("literasi.hero.subtitle")}
          </p>
        </div>
      </div>
    </section>
  );
}
