import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheckCircle,
  faClipboardCheck,
  faClock,
  faHandHoldingHeart,
  faHeadset,
  faMoneyBillWave,
  faPaperPlane,
  faShieldHalved,
  faTicket,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { WaveDivider } from "../components/landing/WaveDivider";
import http from "../lib/http";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

const BENEFITS = [
  { titleKey: "konfirmasi.benefits.1.title", descKey: "konfirmasi.benefits.1.desc", icon: faClock },
  { titleKey: "konfirmasi.benefits.2.title", descKey: "konfirmasi.benefits.2.desc", icon: faShieldHalved },
  { titleKey: "konfirmasi.benefits.3.title", descKey: "konfirmasi.benefits.3.desc", icon: faHeadset },
];

const STEPS = [
  { titleKey: "konfirmasi.steps.1.title", descKey: "konfirmasi.steps.1.desc", icon: faClipboardCheck },
  { titleKey: "konfirmasi.steps.2.title", descKey: "konfirmasi.steps.2.desc", icon: faCheckCircle },
  { titleKey: "konfirmasi.steps.3.title", descKey: "konfirmasi.steps.3.desc", icon: faTicket },
];

export function KonfirmasiDonasiPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    amount: "",
    bank: "",
    purpose: "",
    notes: "",
    proof: null as File | null,
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [statusKey, setStatusKey] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (key: keyof typeof form, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [key]: value as any }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatusKey(null);
    if (key === "proof") {
      const file = value as File | null;
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      } else {
        setPreview(null);
      }
    }
  };

  const validate = () => {
    const alphaSpace = /^[A-Za-z\s]+$/;
    const digits = /^[0-9]+$/;
    const next: { [k: string]: string } = {};

    if (!form.name.trim()) next.name = "konfirmasi.form.error.name.required";
    else if (!alphaSpace.test(form.name.trim())) next.name = "konfirmasi.form.error.name.alpha";

    if (!form.phone.trim()) next.phone = "konfirmasi.form.error.phone.required";
    else if (!digits.test(form.phone.trim())) next.phone = "konfirmasi.form.error.phone.numeric";

    if (!form.amount.trim()) next.amount = "konfirmasi.form.error.amount.required";
    else if (!digits.test(form.amount.trim())) next.amount = "konfirmasi.form.error.amount.numeric";
    else if (Number(form.amount) < 1000) next.amount = "konfirmasi.form.error.amount.min";

    if (!form.bank.trim()) next.bank = "konfirmasi.form.error.bank.required";
    if (!form.purpose.trim()) next.purpose = "konfirmasi.form.error.purpose.required";

    if (form.proof) {
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(form.proof.type)) {
        next.proof = "konfirmasi.form.error.proof.format";
      } else if (form.proof.size > 4 * 1024 * 1024) {
        next.proof = "konfirmasi.form.error.proof.size";
      }
    }

    return { ok: Object.keys(next).length === 0, errors: next };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (!v.ok) {
      setErrors(v.errors);
      setStatusKey("error");
      return;
    }
    setSubmitting(true);
    setStatusKey(null);
    try {
      const fd = new FormData();
      fd.append("donor_name", form.name);
      fd.append("donor_phone", form.phone);
      fd.append("amount", form.amount);
      fd.append("bank_destination", form.bank);
      fd.append("purpose", form.purpose);
      if (form.notes) fd.append("notes", form.notes);
      if (form.proof) fd.append("proof", form.proof);

      await http.post("/donations/confirm", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatusKey("success");
      setForm({ name: "", phone: "", amount: "", bank: "", purpose: "", notes: "", proof: null });
    } catch {
      setStatusKey("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandingLayout footerWaveBgClassName="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-brandGreen-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-primary-200/30 blur-[110px]" />
          <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-brandGreen-200/35 blur-[120px]" />
          <div className="absolute inset-x-10 top-1/3 h-24 rounded-full bg-white/60 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-18 pt-24 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:px-8 lg:pt-28">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 shadow-sm">
              {t("konfirmasi.hero.badge")}
            </span>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              {t("konfirmasi.hero.title.leading")} <span className="text-primary-500">{t("konfirmasi.hero.title.highlight")}</span> {t("konfirmasi.hero.title.trailing")}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
              {t("konfirmasi.hero.subtitle")}
            </p>
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
          </div>
          <div className="relative">
            <div className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.4)] backdrop-blur">
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg">
                <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">{t("konfirmasi.hero.trust.badge")}</p>
                  <p className="text-base font-bold leading-tight">{t("konfirmasi.hero.trust.title")}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoPill icon={faClock} label={t("konfirmasi.hero.pills.1")} />
                <InfoPill icon={faMoneyBillWave} label={t("konfirmasi.hero.pills.2")} />
                <InfoPill icon={faCheckCircle} label={t("konfirmasi.hero.pills.3")} />
                <InfoPill icon={faHeadset} label={t("konfirmasi.hero.pills.4")} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fillClassName="fill-white" className="-mt-1" />

      {/* BENEFITS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary-700 shadow-sm">
              {t("konfirmasi.benefits.badge")}
            </p>
            <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">{t("konfirmasi.benefits.heading")}</h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              {t("konfirmasi.benefits.subtitle")}
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
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
      <section id="alur-konfirmasi" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("konfirmasi.steps.badge")}</p>
                <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("konfirmasi.steps.heading")}</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
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
      <section id="form-konfirmasi" className="bg-white pb-20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <div className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-brandGreen-600 to-primary-600 p-8 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)]">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-50">{t("konfirmasi.form.badge")}</p>
              <h3 className="mt-3 text-3xl font-heading font-semibold leading-tight">{t("konfirmasi.form.heading")}</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-emerald-50">
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  {t("konfirmasi.form.points.1")}
                </li>
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faHandHoldingHeart} />
                  {t("konfirmasi.form.points.2")}
                </li>
                <li className="flex gap-3">
                  <FontAwesomeIcon icon={faHeadset} />
                  {t("konfirmasi.form.points.3")}
                </li>
              </ul>
            </div>
            <form onSubmit={handleSubmit} className="rounded-[24px] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField label={t("konfirmasi.form.fields.name")} value={form.name} onChange={(v) => handleChange("name", v)} required error={errors.name ? t(errors.name) : ""} />
                <InputField label={t("konfirmasi.form.fields.phone")} value={form.phone} onChange={(v) => handleChange("phone", v)} required error={errors.phone ? t(errors.phone) : ""} />
              </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label={t("konfirmasi.form.fields.amount")} value={form.amount} onChange={(v) => handleChange("amount", v)} required error={errors.amount ? t(errors.amount) : ""} />
              <InputField label={t("konfirmasi.form.fields.bank")} value={form.bank} onChange={(v) => handleChange("bank", v)} required error={errors.bank ? t(errors.bank) : ""} />
            </div>
            <InputField label={t("konfirmasi.form.fields.purpose")} value={form.purpose} onChange={(v) => handleChange("purpose", v)} required error={errors.purpose ? t(errors.purpose) : ""} />
            <InputField label={t("konfirmasi.form.fields.notes")} value={form.notes} onChange={(v) => handleChange("notes", v)} />
            <FileField label={t("konfirmasi.form.fields.proof")} onChange={(file) => handleChange("proof", file as any)} error={errors.proof ? t(errors.proof) : ""} />
            {preview && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-600 mb-2">{t("konfirmasi.form.preview")}</p>
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                  <img src={preview} alt="Preview" className="w-full max-h-72 object-contain" />
                </div>
              </div>
            )}
              {statusKey && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    statusKey === "success"
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {statusKey === "success" ? t("konfirmasi.form.submit.success") : t("konfirmasi.form.submit.error")}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {submitting ? t("konfirmasi.form.submit.sending") : t("konfirmasi.form.submit.label")}
              </button>
            </form>
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

function InputField({
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
  const base =
    "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error
    ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
    : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`${base} ${state}`}
      />
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

function FileField({ label, onChange, error }: { label: string; onChange: (file: File | null) => void; error?: string }) {
  const base =
    "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error
    ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
    : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <div className={`${base} ${state} flex items-center gap-3`}>
        <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">File</div>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-slate-700 file:hidden focus:outline-none"
        />
      </div>
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export default KonfirmasiDonasiPage;
