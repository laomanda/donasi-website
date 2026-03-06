import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faClipboardCheck,
  faClock,
  faTruckRampBox,
  faShieldHalved,
  faStopwatch,
  faCircleDollarToSlot,
  faLocationArrow,
  faCertificate,
  faPaperPlane,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { PageHero } from "../components/PageHero";
import { useLang } from "../lib/i18n";
import { serviceDict } from "../components/services/ServiceI18n";
import { translate } from "../lib/i18n-utils";
import { StatLine } from "../components/services/shared/ServiceUI";
import { ServiceSteps } from "../components/services/shared/ServiceSteps";
import { ServiceFaq } from "../components/services/shared/ServiceFaq";
import { ServiceGrid } from "../components/services/layanan/ServiceGrid";
import { SuggestionForm } from "../components/services/layanan/SuggestionForm";

const LAYANAN_STEPS = [
  { titleKey: "layanan.steps.1.title", descKey: "layanan.steps.1.desc", icon: faClipboardCheck },
  { titleKey: "layanan.steps.2.title", descKey: "layanan.steps.2.desc", icon: faClock },
  { titleKey: "layanan.steps.3.title", descKey: "layanan.steps.3.desc", icon: faTruckRampBox },
  { titleKey: "layanan.steps.4.title", descKey: "layanan.steps.4.desc", icon: faPaperPlane },
  { titleKey: "layanan.steps.5.title", descKey: "layanan.steps.5.desc", icon: faFileLines },
];

const LAYANAN_FAQS = [
  { qKey: "layanan.faq.q1", aKey: "layanan.faq.a1" },
  { qKey: "layanan.faq.q2", aKey: "layanan.faq.a2" },
  { qKey: "layanan.faq.q3", aKey: "layanan.faq.a3" },
  { qKey: "layanan.faq.q4", aKey: "layanan.faq.a4" },
  { qKey: "layanan.faq.q5", aKey: "layanan.faq.a5" },
];

function LayananPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(serviceDict, locale, key, fallback);

  return (
    <LandingLayout>
      {/* HERO */}
      <PageHero
        badge={t("layanan.hero.badge")}
        title={
          <>
            {t("layanan.hero.title.leading")}{" "}
            <span className="text-primary-600">{t("layanan.hero.title.highlight")}</span>
          </>
        }
        subtitle={t("layanan.hero.subtitle")}
        breadcrumb={[
          { label: t("nav.services", "Layanan") }
        ]}
        rightElement={
          <div className="rounded-[32px] border border-white/60 bg-white/40 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg">
              <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">{t("layanan.hero.trust.badge")}</p>
                <p className="text-base font-bold leading-tight">{t("layanan.hero.trust.title")}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <StatLine label={t("layanan.hero.stats.1.label")} value={t("layanan.hero.stats.1.value")} icon={faStopwatch} />
              <StatLine label={t("layanan.hero.stats.2.label")} value={t("layanan.hero.stats.2.value")} icon={faCircleDollarToSlot} />
              <StatLine label={t("layanan.hero.stats.3.label")} value={t("layanan.hero.stats.3.value")} icon={faLocationArrow} />
              <StatLine label={t("layanan.hero.stats.4.label")} value={t("layanan.hero.stats.4.value")} icon={faCertificate} />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jemput-wakaf"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
              >
                <FontAwesomeIcon icon={faTruckRampBox} />
                {t("layanan.hero.cta.pickup")}
              </Link>
              <a
                href="#layanan"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white/80 px-6 py-3 text-sm font-bold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                <FontAwesomeIcon icon={faArrowRight} />
                {t("layanan.hero.cta.all")}
              </a>
            </div>
          </div>
        }
      />

      {/* GRID LAYANAN */}
      <ServiceGrid 
        translate={t} 
        badge={t("layanan.services.badge")}
        heading={t("layanan.services.heading")}
        subtitle={t("layanan.services.subtitle")}
      />

      {/* ALUR */}
      <ServiceSteps 
        steps={LAYANAN_STEPS}
        badge={t("layanan.steps.badge")}
        heading={t("layanan.steps.heading")}
        translate={t}
        icon={faClock}
      />

      {/* FAQ & SUGGESTIONS */}
      <section className="bg-slate-50 pt-16 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr,1fr]">
            {/* LEFT: FAQ */}
            <ServiceFaq 
              faqs={LAYANAN_FAQS}
              badge={t("layanan.faq.badge")}
              heading={t("layanan.faq.heading")}
              translate={t}
            />

            {/* RIGHT: SUGGESTION FORM */}
            <SuggestionForm translate={t} />
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

export default LayananPage;
export { LayananPage };


