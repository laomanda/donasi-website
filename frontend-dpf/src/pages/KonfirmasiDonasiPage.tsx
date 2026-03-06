import {
  faClipboardCheck,
  faShieldHeart,
  faListCheck,
  faUserCheck,
  faCertificate,
  faShieldHalved,
  faClock,
  faMoneyBillWave,
  faHeadset,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { PageHero } from "../components/PageHero";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";
import { HeroTrustBadge, ServiceBenefits } from "../components/services/shared/ServiceUI";
import { ServiceSteps } from "../components/services/shared/ServiceSteps";
import { KonfirmasiDonasiForm } from "../components/services/confirm/KonfirmasiDonasiForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const KONFIRMASI_BENEFITS = [
  { titleKey: "konfirmasi.benefits.1.title", descKey: "konfirmasi.benefits.1.desc", icon: faClock },
  { titleKey: "konfirmasi.benefits.2.title", descKey: "konfirmasi.benefits.2.desc", icon: faShieldHalved },
  { titleKey: "konfirmasi.benefits.3.title", descKey: "konfirmasi.benefits.3.desc", icon: faHeadset },
];

const KONFIRMASI_STEPS = [
  { titleKey: "konfirmasi.steps.1.title", descKey: "konfirmasi.steps.1.desc", icon: faListCheck },
  { titleKey: "konfirmasi.steps.2.title", descKey: "konfirmasi.steps.2.desc", icon: faUserCheck },
  { titleKey: "konfirmasi.steps.3.title", descKey: "konfirmasi.steps.3.desc", icon: faCertificate },
];

function KonfirmasiDonasiPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);

  return (
    <LandingLayout footerWaveBgClassName="bg-slate-50">
      <PageHero
        fullHeight
        badge={t("konfirmasi.hero.badge")}
        title={
          <>
            {t("konfirmasi.hero.title.leading")}{" "}
            <span className="text-primary-500">{t("konfirmasi.hero.title.highlight")}</span>{" "}
            {t("konfirmasi.hero.title.trailing")}
          </>
        }
        subtitle={t("konfirmasi.hero.subtitle")}
        breadcrumb={[
          { label: t("nav.services", "Layanan"), href: "/layanan" },
          { label: t("konfirmasi.hero.badge", "Konfirmasi Donasi") }
        ]}
        rightElement={
          <HeroTrustBadge
            size="md"
            icon={faShieldHalved}
            badge={t("konfirmasi.hero.trust.badge")}
            title={t("konfirmasi.hero.trust.title")}
            pills={[
              { icon: faClock, label: t("konfirmasi.hero.pills.1") },
              { icon: faMoneyBillWave, label: t("konfirmasi.hero.pills.2") },
              { icon: faShieldHeart, label: t("konfirmasi.hero.pills.3") },
              { icon: faHeadset, label: t("konfirmasi.hero.pills.4") },
            ]}
          />
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#form-konfirmasi"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
          >
            <FontAwesomeIcon icon={faClipboardCheck} />
            {t("konfirmasi.hero.cta.form")}
          </a>
          <a
            href="#alur-konfirmasi"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-50"
          >
            <FontAwesomeIcon icon={faArrowRight} />
            {t("konfirmasi.hero.cta.flow")}
          </a>
        </div>
      </PageHero>

      <ServiceBenefits
        badge={t("konfirmasi.benefits.badge")}
        heading={t("konfirmasi.benefits.heading")}
        subtitle={t("konfirmasi.benefits.subtitle")}
        benefits={KONFIRMASI_BENEFITS.map(b => ({ ...b, titleKey: t(b.titleKey), descKey: t(b.descKey) }))}
        cols={3}
      />

      <section id="form-konfirmasi" className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <KonfirmasiDonasiForm translate={t} locale={locale} />
        </div>
      </section>

      <ServiceSteps
        id="alur-konfirmasi"
        steps={KONFIRMASI_STEPS}
        badge={t("konfirmasi.steps.badge")}
        heading={t("konfirmasi.steps.heading")}
        translate={t}
        icon={faClipboardCheck}
        cols={3}
      />
    </LandingLayout>
  );
}

export default KonfirmasiDonasiPage;
export { KonfirmasiDonasiPage };
