import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faClipboardCheck,
  faClock,
  faTruckRampBox,
  faPaperPlane,
  faShieldHalved,
  faHeadset,
  faStopwatch,
  faCircleDollarToSlot,
  faLocationArrow,
  faCertificate,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

type Service = {
  key: "jemput" | "konfirmasi" | "konsultasi";
  titleKey: string;
  descriptionKey: string;
  icon: any;
  badgeKey: string;
  link: string;
  ctaKey: string;
};

const SERVICES: Service[] = [
  {
    key: "jemput",
    titleKey: "layanan.services.pickup.title",
    descriptionKey: "layanan.services.pickup.desc",
    icon: faTruckRampBox,
    badgeKey: "layanan.services.pickup.badge",
    link: "/jemput-wakaf",
    ctaKey: "layanan.services.pickup.cta",
  },
  {
    key: "konfirmasi",
    titleKey: "layanan.services.confirm.title",
    descriptionKey: "layanan.services.confirm.desc",
    icon: faClipboardCheck,
    badgeKey: "layanan.services.confirm.badge",
    link: "/konfirmasi-donasi",
    ctaKey: "layanan.services.confirm.cta",
  },
  {
    key: "konsultasi",
    titleKey: "layanan.services.consult.title",
    descriptionKey: "layanan.services.consult.desc",
    icon: faHeadset,
    badgeKey: "layanan.services.consult.badge",
    link: "/konsultasi",
    ctaKey: "layanan.services.consult.cta",
  },
];

const STEPS = [
  { titleKey: "layanan.steps.1.title", descKey: "layanan.steps.1.desc", icon: faClipboardCheck },
  { titleKey: "layanan.steps.2.title", descKey: "layanan.steps.2.desc", icon: faClock },
  { titleKey: "layanan.steps.3.title", descKey: "layanan.steps.3.desc", icon: faTruckRampBox },
  { titleKey: "layanan.steps.4.title", descKey: "layanan.steps.4.desc", icon: faPaperPlane },
  { titleKey: "layanan.steps.5.title", descKey: "layanan.steps.5.desc", icon: faFileLines },
];

const FAQS = [
  {
    qKey: "layanan.faq.q1",
    aKey: "layanan.faq.a1",
  },
  {
    qKey: "layanan.faq.q2",
    aKey: "layanan.faq.a2",
  },
  {
    qKey: "layanan.faq.q3",
    aKey: "layanan.faq.a3",
  },
  {
    qKey: "layanan.faq.q4",
    aKey: "layanan.faq.a4",
  },
  {
    qKey: "layanan.faq.q5",
    aKey: "layanan.faq.a5",
  },
];

function LayananPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);

  return (
    <LandingLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-brandGreen-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-primary-200/30 blur-[110px]" />
          <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-brandGreen-200/35 blur-[120px]" />
          <div className="absolute inset-x-10 top-1/3 h-24 rounded-full bg-white/60 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-24 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:px-8 lg:pt-28">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 shadow-sm">
              {t("layanan.hero.badge")}
            </span>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              {t("layanan.hero.title.leading")} <span className="text-primary-500">{t("layanan.hero.title.highlight")}</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
              {t("layanan.hero.subtitle")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jemput-wakaf"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
              >
                <FontAwesomeIcon icon={faTruckRampBox} />
                {t("layanan.hero.cta.pickup")}
              </Link>
              <a
                href="#layanan"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-50"
              >
                <FontAwesomeIcon icon={faArrowRight} />
                {t("layanan.hero.cta.all")}
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.4)] backdrop-blur">
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg">
                <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">{t("layanan.hero.trust.badge")}</p>
                  <p className="text-base font-bold leading-tight">{t("layanan.hero.trust.title")}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <StatLine label={t("layanan.hero.stats.1.label")} value={t("layanan.hero.stats.1.value")} icon={faStopwatch} />
                <StatLine label={t("layanan.hero.stats.2.label")} value={t("layanan.hero.stats.2.value")} icon={faCircleDollarToSlot} />
                <StatLine label={t("layanan.hero.stats.3.label")} value={t("layanan.hero.stats.3.value")} icon={faLocationArrow} />
                <StatLine label={t("layanan.hero.stats.4.label")} value={t("layanan.hero.stats.4.value")} icon={faCertificate} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID LAYANAN */}
      <section id="layanan" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-primary-700 shadow-sm">
                {t("layanan.services.badge")}
              </p>
              <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">{t("layanan.services.heading")}</h2>
              <p className="text-sm text-slate-600 max-w-xl">
                {t("layanan.services.subtitle")}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {SERVICES.map((service) => {
              const title = t(service.titleKey);
              const desc = t(service.descriptionKey);
              const badge = t(service.badgeKey);
              const cta = t(service.ctaKey);
              return (
                <article
                  key={service.titleKey}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_25px_60px_-40px_rgba(0,0,0,0.4)] transition-shadow hover:shadow-[0_28px_70px_-38px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex items-center justify-between px-5 pt-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 shadow-sm">
                      <FontAwesomeIcon icon={service.icon} className="text-lg" />
                    </div>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700">
                      {badge}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-heading font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
                    <Link
                      to={service.link}
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition hover:gap-3"
                    >
                      {cta}
                      <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ALUR */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brandGreen-700">{t("layanan.steps.badge")}</p>
              <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("layanan.steps.heading")}</h2>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
            {STEPS.map((step, idx) => (
              <div
                key={step.titleKey}
                className="group relative flex h-full flex-col rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
              >
                {/* Number Watermark */}
                <div className="absolute -right-2 -top-2 h-16 w-16 rotate-12 rounded-full bg-gradient-to-br from-primary-50 to-white opacity-50 blur-xl transition-all group-hover:opacity-100 group-hover:blur-2xl" />
                
                <div className="relative mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-600 transition-colors group-hover:bg-brandGreen-600 group-hover:text-white">
                    <FontAwesomeIcon icon={step.icon} className="text-lg" />
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-xs font-bold text-slate-400 ring-1 ring-slate-100 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:ring-primary-100">
                    {idx + 1}
                  </span>
                </div>
                
                <h3 className="min-h-[3rem] text-base font-heading font-bold text-slate-800 leading-tight group-hover:text-brandGreen-700 transition-colors">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {t(step.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 pt-16 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <FontAwesomeIcon icon={faHeadset} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("layanan.faq.badge")}</p>
              <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("layanan.faq.heading")}</h2>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {FAQS.map((item, idx) => (
              <div key={item.qKey} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{t(item.qKey)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{t(item.aKey)}</p>
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

function StatLine({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="text-sm font-heading font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default LayananPage;
export { LayananPage };


