import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruckRampBox,
  faCalendarCheck,
  faHandHoldingHeart,
  faPaperPlane,
  faClock,
  faShieldHalved,
  faCheckCircle,
  faLocationDot,
  faMapMarkedAlt,
  faClipboardCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { PageHero } from "../components/PageHero";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";
import { HeroTrustBadge, ServiceBenefits } from "../components/services/shared/ServiceUI";
import { ServiceSteps } from "../components/services/shared/ServiceSteps";
import { JemputWakafForm } from "../components/services/pickup/JemputWakafForm";



const JEMPUT_BENEFITS = [
  { titleKey: "jemput.benefits.1.title", descKey: "jemput.benefits.1.desc", icon: faShieldHalved },
  { titleKey: "jemput.benefits.2.title", descKey: "jemput.benefits.2.desc", icon: faClock },
  { titleKey: "jemput.benefits.3.title", descKey: "jemput.benefits.3.desc", icon: faMapMarkedAlt },
  { titleKey: "jemput.benefits.4.title", descKey: "jemput.benefits.4.desc", icon: faClipboardCheck },
];

const JEMPUT_STEPS = [
  { titleKey: "jemput.steps.1.title", descKey: "jemput.steps.1.desc", icon: faTruckRampBox },
  { titleKey: "jemput.steps.2.title", descKey: "jemput.steps.2.desc", icon: faCalendarCheck },
  { titleKey: "jemput.steps.3.title", descKey: "jemput.steps.3.desc", icon: faHandHoldingHeart },
  { titleKey: "jemput.steps.4.title", descKey: "jemput.steps.4.desc", icon: faPaperPlane },
];

function JemputWakafPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);

  return (
    <LandingLayout footerWaveBgClassName="bg-slate-50">
      <PageHero
        fullHeight
        badge={t("jemput.hero.badge")}
        title={
          <>
            {t("jemput.hero.title.leading")}{" "}
            <span className="text-primary-500">{t("jemput.hero.title.highlight")}</span>{" "}
            {t("jemput.hero.title.trailing")}
          </>
        }
        subtitle={t("jemput.hero.subtitle")}
        breadcrumb={[
          { label: t("nav.services", "Layanan"), href: "/layanan" },
          { label: t("jemput.hero.badge", "Jemput Wakaf") },
        ]}
        rightElement={
          <HeroTrustBadge
            size="lg"
            icon={faShieldHalved}
            badge={t("jemput.hero.trust.badge")}
            title={t("jemput.hero.trust.title")}
            pills={[
              { icon: faClock, label: t("jemput.hero.pills.1") },
              { icon: faCheckCircle, label: t("jemput.hero.pills.2") },
              { icon: faLocationDot, label: t("jemput.hero.pills.3") },
              { icon: faClipboardCheck, label: t("jemput.hero.pills.4") },
            ]}
          />
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#form-jemput"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
          >
            <FontAwesomeIcon icon={faTruckRampBox} />
            {t("jemput.hero.cta.submit")}
          </a>
          <a
            href="#alur-jemput"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-50"
          >
            <FontAwesomeIcon icon={faArrowRight} />
            {t("jemput.hero.cta.flow")}
          </a>
        </div>
      </PageHero>

      <ServiceBenefits
        badge={t("jemput.benefits.badge")}
        heading={t("jemput.benefits.heading")}
        subtitle={t("jemput.benefits.subtitle")}
        benefits={JEMPUT_BENEFITS.map(b => ({ ...b, titleKey: t(b.titleKey), descKey: t(b.descKey) }))}
      />

      {/* FORM SECTION */}
      <section id="form-jemput" className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <JemputWakafForm translate={t} locale={locale} />
        </div>
      </section>

      {/* STEPS SECTION */}
      <ServiceSteps
        id="alur-jemput"
        steps={JEMPUT_STEPS}
        badge={t("jemput.steps.badge")}
        heading={t("jemput.steps.heading")}
        translate={t}
        icon={faTruckRampBox}
        cols={4}
      />
    </LandingLayout>
  );
}

export default JemputWakafPage;
export { JemputWakafPage };
