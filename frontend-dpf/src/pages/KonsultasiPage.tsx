import {
  faArrowRight,
  faCalendarCheck,
  faCheckCircle,
  faClipboardCheck,
  faClock,
  faEnvelopeOpenText,
  faHandshakeSimple,
  faHeadset,
  faShieldHalved,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { PageHero } from "../components/PageHero";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";
import { KonsultasiForm } from "../components/services/consult/KonsultasiForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BENEFITS = [
  { titleKey: "konsultasi.benefits.1.title", descKey: "konsultasi.benefits.1.desc", icon: faUserGraduate },
  { titleKey: "konsultasi.benefits.2.title", descKey: "konsultasi.benefits.2.desc", icon: faClock },
  { titleKey: "konsultasi.benefits.3.title", descKey: "konsultasi.benefits.3.desc", icon: faCalendarCheck },
  { titleKey: "konsultasi.benefits.4.title", descKey: "konsultasi.benefits.4.desc", icon: faShieldHalved },
];

const STEPS = [
  { titleKey: "konsultasi.steps.1.title", descKey: "konsultasi.steps.1.desc", icon: faClipboardCheck },
  { titleKey: "konsultasi.steps.2.title", descKey: "konsultasi.steps.2.desc", icon: faHeadset },
  { titleKey: "konsultasi.steps.3.title", descKey: "konsultasi.steps.3.desc", icon: faHandshakeSimple },
  { titleKey: "konsultasi.steps.4.title", descKey: "konsultasi.steps.4.desc", icon: faEnvelopeOpenText },
];

const FAQS = [
  { qKey: "konsultasi.faq.q1", aKey: "konsultasi.faq.a1" },
  { qKey: "konsultasi.faq.q2", aKey: "konsultasi.faq.a2" },
  { qKey: "konsultasi.faq.q3", aKey: "konsultasi.faq.a3" },
  { qKey: "konsultasi.faq.q4", aKey: "konsultasi.faq.a4" },
];

export function KonsultasiPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);

  return (
    <LandingLayout footerWaveBgClassName="bg-slate-50">
      {/* HERO */}
      <PageHero
        fullHeight={true}
        badge={t("konsultasi.hero.badge")}
        title={
          <>
            {t("konsultasi.hero.title.leading")}{" "}
            <span className="text-primary-500">{t("konsultasi.hero.title.highlight")}</span>{" "}
            {t("konsultasi.hero.title.trailing")}
          </>
        }
        subtitle={t("konsultasi.hero.subtitle")}
        breadcrumb={[
          { label: t("landing.navbar.services", "Layanan"), href: "/layanan" },
          { label: t("landing.navbar.consultation", "Konsultasi") }
        ]}
        rightElement={
          <div className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.4)] backdrop-blur">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg">
              <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em]">{t("konsultasi.hero.trust.badge")}</p>
                <p className="text-base font-bold leading-tight">{t("konsultasi.hero.trust.title")}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoPill icon={faClock} label={t("konsultasi.hero.pills.1")} />
              <InfoPill icon={faCheckCircle} label={t("konsultasi.hero.pills.2")} />
              <InfoPill icon={faHandshakeSimple} label={t("konsultasi.hero.pills.3")} />
              <InfoPill icon={faClipboardCheck} label={t("konsultasi.hero.pills.4")} />
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#form-konsultasi"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
          >
            <FontAwesomeIcon icon={faHeadset} />
            {t("konsultasi.hero.cta.form")}
          </a>
          <a
            href="#alur-konsultasi"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-50"
          >
            <FontAwesomeIcon icon={faArrowRight} />
            {t("konsultasi.hero.cta.flow")}
          </a>
        </div>
      </PageHero>

      {/* BENEFITS */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary-700 shadow-sm">
              {t("konsultasi.benefits.badge")}
            </p>
            <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">{t("konsultasi.benefits.heading")}</h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">{t("konsultasi.benefits.subtitle")}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {BENEFITS.map((item) => (
              <div key={item.titleKey} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 shadow-sm">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <h3 className="mt-3 text-lg font-heading font-semibold text-slate-900">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALUR */}
      <section id="alur-konsultasi" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <FontAwesomeIcon icon={faHandshakeSimple} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("konsultasi.steps.badge")}</p>
                <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("konsultasi.steps.heading")}</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {STEPS.map((step, idx) => (
              <div
                key={step.titleKey}
                className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.4)] transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-700">
                    <FontAwesomeIcon icon={step.icon} />
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white shadow-sm">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-semibold text-slate-900">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(step.descKey)}</p>
                {idx < STEPS.length - 1 && (
                  <div className="pointer-events-none absolute inset-y-0 right-2 hidden w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="form-konsultasi" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <KonsultasiForm translate={t} locale={locale} />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <FontAwesomeIcon icon={faHeadset} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("konsultasi.faq.badge")}</p>
              <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("konsultasi.faq.heading")}</h2>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {FAQS.map((item, idx) => (
              <div key={item.qKey} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t(item.qKey)}</p>
                    <p className="text-sm leading-relaxed text-slate-600">{t(item.aKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function InfoPill({ icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        <FontAwesomeIcon icon={icon} />
      </span>
      <span>{label}</span>
    </div>
  );
}

export default KonsultasiPage;

