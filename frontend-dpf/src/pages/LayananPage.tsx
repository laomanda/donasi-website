import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faClipboardCheck,
  faClock,
  faHandshakeSimple,
  faHeadset,
  faLocationDot,
  faMobileScreenButton,
  faPaperPlane,
  faShieldHalved,
  faTruckRampBox,
  faStopwatch,
  faCircleDollarToSlot,
  faLocationArrow,
  faCertificate,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import http from "../lib/http";
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
    link: "/jemput-zakat",
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
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    service: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessageKey, setSubmitMessageKey] = useState<"success" | "error" | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; city?: string; service?: string }>({});
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setSubmitMessageKey(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    if (!validation.ok) {
      setErrors(validation.errors);
      setSubmitMessageKey("error");
      return;
    }

    setSubmitting(true);
    setSubmitMessageKey(null);
    try {
      await http.post("/service-requests", {
        name: form.name,
        phone: form.phone,
        city: form.city,
        service_type: form.service,
        notes: form.notes,
      });
      setSubmitMessageKey("success");
      setForm({ name: "", phone: "", city: "", service: "", notes: "" });
    } catch {
      setSubmitMessageKey("error");
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const nextErrors: { name?: string; phone?: string; city?: string; service?: string } = {};
    const alphaSpace = /^[A-Za-z\s]+$/;
    const digitsOnly = /^[0-9]+$/;

    if (!form.name.trim()) {
      nextErrors.name = "layanan.form.error.name.required";
    } else if (!alphaSpace.test(form.name.trim())) {
      nextErrors.name = "layanan.form.error.name.alpha";
    }

    if (!form.city.trim()) {
      nextErrors.city = "layanan.form.error.city.required";
    } else if (!alphaSpace.test(form.city.trim())) {
      nextErrors.city = "layanan.form.error.city.alpha";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "layanan.form.error.phone.required";
    } else if (!digitsOnly.test(form.phone.trim())) {
      nextErrors.phone = "layanan.form.error.phone.numeric";
    }

    if (!form.service) {
      nextErrors.service = "layanan.form.error.service.required";
    }

    const ok = Object.keys(nextErrors).length === 0;
    return { ok, errors: nextErrors };
  };

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
                  to="/jemput-zakat"
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
            <div className="flex flex-wrap gap-3">
              <a
                href="#form-layanan"
                className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-primary-200 hover:-translate-y-0.5"
              >
                {t("layanan.services.cta.form")}
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </a>
              <a
                href="/cara-donasi"
                className="inline-flex items-center gap-2 rounded-full border border-brandGreen-200 bg-brandGreen-50 px-5 py-2.5 text-sm font-semibold text-brandGreen-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brandGreen-300 hover:text-brandGreen-800"
              >
                {t("layanan.services.cta.donate")}
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </a>
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

      {/* FORM CTA */}
      <section id="form-layanan" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <div className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-brandGreen-600 to-primary-600 p-8 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)]">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-50">{t("layanan.form.badge")}</p>
              <h3 className="mt-3 text-3xl font-heading font-semibold leading-tight">
                {t("layanan.form.heading")}
              </h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-emerald-50">
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faMobileScreenButton} />
                  {t("layanan.form.points.1")}
                </li>
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faLocationDot} />
                  {t("layanan.form.points.2")}
                </li>
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faHandshakeSimple} />
                  {t("layanan.form.points.3")}
                </li>
              </ul>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="rounded-[24px] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label={t("layanan.form.fields.name")}
                  value={form.name}
                  onChange={(v) => handleChange("name", v)}
                  required
                  error={errors.name ? t(errors.name) : ""}
                />
                <FormField
                  label={t("layanan.form.fields.phone")}
                  value={form.phone}
                  onChange={(v) => handleChange("phone", v)}
                  required
                  error={errors.phone ? t(errors.phone) : ""}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label={t("layanan.form.fields.city")}
                  value={form.city}
                  onChange={(v) => handleChange("city", v)}
                  required
                  error={errors.city ? t(errors.city) : ""}
                />
                <SelectField
                  label={t("layanan.form.fields.service")}
                  value={form.service}
                  onChange={(v) => handleChange("service", v)}
                  options={[
                    { value: "", label: t("layanan.form.options.placeholder") },
                    { value: "jemput", label: t("layanan.services.pickup.title") },
                    { value: "konfirmasi", label: t("layanan.services.confirm.title") },
                    { value: "konsultasi", label: t("layanan.services.consult.title") },
                  ]}
                  required
                  error={errors.service ? t(errors.service) : ""}
                />
              </div>
              <TextareaField
                label={t("layanan.form.fields.notes")}
                placeholder={t("layanan.form.fields.notes.placeholder")}
                value={form.notes}
                onChange={(v) => handleChange("notes", v)}
              />
              {submitMessageKey && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    submitMessageKey === "success"
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {submitMessageKey === "success" ? t("layanan.form.submit.success") : t("layanan.form.submit.error")}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {submitting ? t("layanan.form.submit.sending") : t("layanan.form.submit.label")}
              </button>
            </form>
          </div>
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("layanan.faq.badge")}</p>
              <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("layanan.faq.heading")}</h2>
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

function FormField({
  label,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}) {
  const baseClass =
    "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const stateClass = error
    ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
    : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`${baseClass} ${stateClass}`}
      />
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
}) {
  const baseClass =
    "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const stateClass = error
    ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
    : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`${baseClass} ${stateClass}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
      />
    </label>
  );
}

export default LayananPage;
export { LayananPage };


