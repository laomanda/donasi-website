import { useState } from "react";
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
  faUserSecret,
  faCommentDots,
  faCheckCircle,
  faUser,
  faPhone,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { PageHero } from "../components/PageHero";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";
import http from "../lib/http";
import PhoneInput from "../components/ui/PhoneInput";

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

  const [form, setForm] = useState({
    name: "",
    phone: "",
    category: "",
    message: "",
    isAnonymous: false,
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: "suggestion", label: t("layanan.suggestion.category.suggestion") },
    { value: "bug", label: t("layanan.suggestion.category.bug") },
    { value: "appreciation", label: t("layanan.suggestion.category.appreciation") },
    { value: "other", label: t("layanan.suggestion.category.other") },
  ];

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus(null);
  };

  const validate = () => {
    const next: { [k: string]: string } = {};
    if (!form.isAnonymous && !form.name.trim()) next.name = "layanan.form.error.name.required";
    if (!form.phone.trim()) next.phone = "layanan.form.error.phone.required";
    if (!form.category) next.category = "layanan.form.error.service.required";
    if (!form.message.trim()) next.message = "layanan.form.error.message.required";
    return { ok: Object.keys(next).length === 0, errors: next };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (!v.ok) {
      setErrors(v.errors);
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await http.post("/suggestions", {
        name: form.isAnonymous ? "Hamba Allah" : form.name,
        phone: form.phone,
        category: form.category,
        message: form.message,
        is_anonymous: form.isAnonymous,
      });
      setStatus("success");
      setForm({ name: "", phone: "", category: "", message: "", isAnonymous: false });
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

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
          { label: t("landing.navbar.services", "Layanan") }
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
      <section id="layanan" className="bg-slate-50">
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

      {/* FAQ & SUGGESTIONS */}
      <section className="bg-slate-50 pt-16 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr,1fr]">
            {/* LEFT: FAQ */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                  <FontAwesomeIcon icon={faHeadset} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("layanan.faq.badge")}</p>
                  <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("layanan.faq.heading")}</h2>
                </div>
              </div>

              <div className="space-y-3">
                {FAQS.map((item, idx) => (
                  <div key={item.qKey} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-soft transition-all hover:shadow-md">
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

            {/* RIGHT: SUGGESTION FORM */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FontAwesomeIcon icon={faCommentDots} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">{t("layanan.suggestion.badge")}</p>
                  <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("layanan.suggestion.heading")}</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.3)] sm:p-8 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 cursor-pointer" onClick={() => handleChange("isAnonymous", !form.isAnonymous)}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${form.isAnonymous ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-slate-300"}`}>
                    {form.isAnonymous && <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserSecret} className={`transition ${form.isAnonymous ? "text-primary-600" : "text-slate-400"}`} />
                    <span className={`text-sm font-bold transition ${form.isAnonymous ? "text-slate-900" : "text-slate-600"}`}>
                      {t("layanan.suggestion.anonymous")}
                    </span>
                  </div>
                </div>

                {!form.isAnonymous && (
                  <InputField
                    label={t("layanan.suggestion.name")}
                    icon={faUser}
                    value={form.name}
                    onChange={(v: string) => handleChange("name", v)}
                    error={errors.name ? t(errors.name) : ""}
                    required
                  />
                )}

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FontAwesomeIcon icon={faPhone} className="text-primary-500" />
                    {t("layanan.suggestion.phone")}
                  </label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(v: string | undefined) => handleChange("phone", v || "")}
                    disabled={submitting}
                  />
                  {errors.phone && <p className="text-xs font-semibold text-red-600">{t(errors.phone)}</p>}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FontAwesomeIcon icon={faListUl} className="text-primary-500" />
                    {t("layanan.suggestion.category")}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${errors.category ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100"}`}
                  >
                    <option value="">{t("layanan.suggestion.category.placeholder")}</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs font-semibold text-red-600">{t(errors.category)}</p>}
                </div>

                <TextareaField
                  label={t("layanan.suggestion.message")}
                  value={form.message}
                  onChange={(v: string) => handleChange("message", v)}
                  placeholder={t("layanan.suggestion.placeholder.message")}
                  error={errors.message ? t(errors.message) : ""}
                  required
                />

                {status && (
                  <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${status === "success" ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "border border-red-100 bg-red-50 text-red-700"}`}>
                    {status === "success" ? t("layanan.suggestion.success") : t("layanan.suggestion.error")}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 py-4 text-sm font-bold text-white transition-all hover:bg-brandGreen-700 hover:shadow-xl hover:shadow-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className={`transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${submitting ? "animate-pulse" : ""}`} />
                  {submitting ? t("layanan.suggestion.submitting") : t("layanan.suggestion.submit")}
                </button>
              </form>
            </div>
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

function InputField({ label, icon, value, onChange, required, error, type = "text" }: any) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100" : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="block space-y-2 text-sm font-bold text-slate-700">
      <span className="flex items-center gap-2">
        {icon && <FontAwesomeIcon icon={icon} className="text-primary-500" />}
        {label}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className={`${base} ${state}`} />
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder, required, error }: any) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100" : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="block space-y-2 text-sm font-bold text-slate-700">
      <span>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} rows={4} className={`${base} ${state}`} />
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}


