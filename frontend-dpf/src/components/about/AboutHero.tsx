import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faHandHoldingHeart,
  faShieldHalved,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { PageHero } from "../PageHero";

type AboutHeroProps = {
  t: (key: string, fallback?: string) => string;
};

export function AboutHero({ t }: AboutHeroProps) {
  return (
    <PageHero
      badge={t("about.hero.badge")}
      title={
        <>
          {t("about.hero.title.leading")}{" "}
          <span className="text-primary-600">{t("about.hero.title.highlight")}</span>{" "}
          {t("about.hero.title.trailing")}
        </>
      }
      subtitle={t("about.hero.subtitle")}
      breadcrumb={[
        { label: t("landing.navbar.about", "Tentang Kami") }
      ]}
      rightElement={
        <div className="rounded-[32px] border border-white/60 bg-white/40 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg">
            <FontAwesomeIcon icon={faHandHoldingHeart} className="text-lg" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">{t("about.hero.mandate.badge")}</p>
              <p className="text-base font-bold leading-tight">{t("about.hero.mandate.title")}</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <StatLine label={t("about.hero.stats.1.label")} value={t("about.hero.stats.1.value")} />
            <StatLine label={t("about.hero.stats.2.label")} value={t("about.hero.stats.2.value")} />
            <StatLine label={t("about.hero.stats.3.label")} value={t("about.hero.stats.3.value")} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#legalitas"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
            >
              <FontAwesomeIcon icon={faShieldHalved} />
              {t("about.hero.cta.legal")}
            </a>
            <a
              href="#visi-misi"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white/80 px-6 py-3 text-sm font-bold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <FontAwesomeIcon icon={faArrowRight} />
              {t("about.hero.cta.vision")}
            </a>
          </div>
        </div>
      }
    />
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <FontAwesomeIcon icon={faStar} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="text-sm font-heading font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
