import { useEffect, useMemo, useState } from "react";
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
import { PageHero } from "../components/PageHero";
import http from "../lib/http";
import PhoneInput from "../components/ui/PhoneInput";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

type BankAccount = {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string | null;
  is_visible?: boolean;
  notes?: string | null;
  category?: string | null;
};

type OrganizationResponse = {
  bank_accounts?: BankAccount[];
};

type Program = {
  id: number;
  title: string;
  title_en?: string | null;
  status: string;
};

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
  const pickLocale = (idVal?: string | null, enVal?: string | null) => {
    const idText = (idVal ?? "").trim();
    const enText = (enVal ?? "").trim();
    if (locale === "en") return enText || idText;
    return idText || enText;
  };
  const [form, setForm] = useState({
    program_id: "",
    name: "",
    phone: "",
    amount: "",
    bank: "",
    purpose: "",
    notes: "",
    proof: null as File | null,
  });
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [statusKey, setStatusKey] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [customPurpose, setCustomPurpose] = useState("");

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

  useEffect(() => {
    let active = true;
    setOptionsLoading(true);
    Promise.all([http.get<OrganizationResponse>("/organization"), http.get<{ data: Program[] }>("/programs?per_page=100")])
      .then(([orgRes, progRes]) => {
        if (!active) return;
        setAccounts(orgRes.data?.bank_accounts ?? []);
        setPrograms(progRes.data?.data ?? []);
        setOptionsError(null);
      })
      .catch(() => {
        if (!active) return;
        setOptionsError("konfirmasi.form.error.options");
      })
      .finally(() => active && setOptionsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const visibleAccounts = useMemo(() => accounts.filter((account) => account.is_visible !== false), [accounts]);
  const programOptions = useMemo(() => {
    const list = programs
      .filter((program) => {
        const status = String(program.status ?? "").trim().toLowerCase();
        return status !== "draft" && status !== "segera";
      })
      .map((program) => ({
        value: String(program.id),
        label: pickLocale(program.title, program.title_en) || t("landing.programs.defaultCategory"),
      }));
      
    // Add "Lainnya" option
    list.push({ value: "Lainnya", label: locale === "en" ? "Other / General" : "Lainnya" });
    return list;
  }, [programs, locale, t]);

  const bankOptions = useMemo(() => {
    const domesticData = visibleAccounts.filter(
      (a) => !a.category || a.category === "domestic" || a.category === "bank_transfer"
    );
    const internationalData = visibleAccounts.filter((a) => a.category === "international");

    const options: Array<{ label: string; options: Array<{ value: string; label: string }> }> = [];

    if (domesticData.length > 0) {
      options.push({
        label: locale === "en" ? "Domestic (Locak Bank/QRIS)" : "Wakif Dalam Negeri (Bank Lokal/QRIS)",
        options: domesticData.map((account) => ({
          value: String(account.id),
          label: `${account.bank_name} • ${account.account_number} a.n. ${account.account_name}`,
        })),
      });
    }

    if (internationalData.length > 0) {
      options.push({
        label: locale === "en" ? "International (Swift)" : "Wakif Luar Negeri (Swift/International)",
        options: internationalData.map((account) => ({
          value: String(account.id),
          label: `${account.bank_name} • ${account.account_number} a.n. ${account.account_name}`,
        })),
      });
    }

    return options;
  }, [visibleAccounts, locale]);

  const handleBankChange = (value: string) => {
    setForm((prev) => ({ ...prev, bank: value }));
    setErrors((prev) => ({ ...prev, bank: "" }));
    setStatusKey(null);
  };

  const handleProgramChange = (value: string) => {
    const selected = programOptions.find((program) => program.value === value);
    setForm((prev) => ({ ...prev, program_id: value, purpose: selected?.label ?? "" }));
    if (value !== "Lainnya") {
        setCustomPurpose("");
    }
    setErrors((prev) => ({ ...prev, purpose: "" }));
    setStatusKey(null);
  };

  const validate = () => {
    const alphaSpace = /^[A-Za-z\s]+$/;
    const digits = /^[0-9]+$/;
    const next: { [k: string]: string } = {};

    if (!form.name.trim()) next.name = "konfirmasi.form.error.name.required";
    else if (!alphaSpace.test(form.name.trim())) next.name = "konfirmasi.form.error.name.alpha";

    if (!form.phone.trim()) next.phone = "konfirmasi.form.error.phone.required";
    else if (form.phone.trim().length < 8) next.phone = "konfirmasi.form.error.phone.numeric";

    if (!form.amount.trim()) next.amount = "konfirmasi.form.error.amount.required";
    else if (!digits.test(form.amount.trim())) next.amount = "konfirmasi.form.error.amount.numeric";
    else if (Number(form.amount) < 1000) next.amount = "konfirmasi.form.error.amount.min";

    const selectedBank = visibleAccounts.find((account) => String(account.id) === form.bank);
    if (!selectedBank) next.bank = "konfirmasi.form.error.bank.required";

    if (!form.program_id) next.purpose = "konfirmasi.form.error.purpose.required";
    else if (form.program_id === "Lainnya" && !customPurpose.trim()) next.purpose = "konfirmasi.form.error.purpose.required";

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
      const selectedBank = visibleAccounts.find((account) => String(account.id) === form.bank);
      const isCustom = form.program_id === "Lainnya";
      const selectedProgram = !isCustom ? programOptions.find((program) => program.value === form.program_id) : null;

      if (!selectedBank || (!selectedProgram && !isCustom)) {
        setErrors({
          bank: selectedBank ? "" : "konfirmasi.form.error.bank.required",
          purpose: "konfirmasi.form.error.purpose.required",
        });
        setStatusKey("error");
        setSubmitting(false);
        return;
      }
      const fd = new FormData();
      fd.append("donor_name", form.name);
      fd.append("donor_phone", form.phone);
      fd.append("amount", form.amount);
      fd.append(
        "bank_destination",
        `${selectedBank.bank_name} ${selectedBank.account_number} a.n. ${selectedBank.account_name}`
      );
      
      if (isCustom) {
        // If "Lainnya", we might omit program_id or send empty depending on backend.
        // Assuming backend handles donation without specific program_id, or we send custom purpose string.
        fd.append("program_id", ""); 
        fd.append("purpose", customPurpose);
      } else if (selectedProgram) {
        fd.append("program_id", selectedProgram.value);
        fd.append("purpose", selectedProgram.label);
      }

      if (form.notes) fd.append("notes", form.notes);
      if (form.proof) fd.append("proof", form.proof);

      await http.post("/donations/confirm", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatusKey("success");
      setForm({ program_id: "", name: "", phone: "", amount: "", bank: "", purpose: "", notes: "", proof: null });
    } catch {
      setStatusKey("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandingLayout footerWaveBgClassName="bg-slate-50">
      {/* HERO */}
      <PageHero
        fullHeight={true}
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
          { label: t("landing.navbar.services", "Layanan"), href: "/layanan" },
          { label: t("landing.navbar.confirmation", "Konfirmasi Donasi") }
        ]}
        rightElement={
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

      {/* BENEFITS */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
      <section id="form-konfirmasi" className="bg-slate-50 pb-20">
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
            <form onSubmit={handleSubmit} className="relative space-y-8 rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] sm:p-8">
              
              {/* SECTION: DATA DONATUR */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                     <FontAwesomeIcon icon={faHeadset} className="text-sm" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    {t("konfirmasi.form.section.donor")}
                  </h4>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField label={t("konfirmasi.form.fields.name")} value={form.name} onChange={(v) => handleChange("name", v)} required error={errors.name ? t(errors.name) : ""} />
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>{t("konfirmasi.form.fields.phone")} <span className="text-red-500">*</span></span>
                    <PhoneInput
                      value={form.phone}
                      onChange={(v) => handleChange("phone", v || "")}
                      disabled={submitting}
                    />
                    {errors.phone && <span className="text-xs font-semibold text-red-600">{t(errors.phone)}</span>}
                  </label>
                </div>
              </div>

              {/* SECTION: DETAIL DONASI */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                     <FontAwesomeIcon icon={faHandHoldingHeart} className="text-sm" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    {t("konfirmasi.form.section.donation")}
                  </h4>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>{t("konfirmasi.form.fields.amount")}</span>
                      <input
                        value={form.amount}
                        onChange={(e) => {
                          // Allow only digits
                          if (/^[0-9]*$/.test(e.target.value)) handleChange("amount", e.target.value);
                        }}
                        required
                        className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${
                          errors.amount
                            ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
                            : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100"
                        }`}
                        placeholder="0"
                      />
                      {errors.amount && <span className="text-xs font-semibold text-red-600">{t(errors.amount)}</span>}
                    </label>
                  <SelectField
                    label={t("konfirmasi.form.fields.bank")}
                    value={form.bank}
                    onChange={handleBankChange}
                    required
                    error={errors.bank ? t(errors.bank) : ""}
                    options={bankOptions}
                    disabled={optionsLoading || bankOptions.length === 0}
                    placeholder={locale === "en" ? "Select destination bank" : "Pilih bank tujuan"}
                    loading={optionsLoading}
                  />
                </div>
                <SelectField
                  label={t("konfirmasi.form.fields.purpose")}
                  value={form.program_id}
                  onChange={handleProgramChange}
                  required
                  error={errors.purpose && form.program_id !== "Lainnya" ? t(errors.purpose) : ""}
                  options={programOptions}
                  disabled={optionsLoading || programOptions.length === 0}
                  placeholder={locale === "en" ? "Select donation program" : "Pilih program tujuan"}
                  loading={optionsLoading}
                />
                {form.program_id === "Lainnya" && (
                    <InputField
                        label={locale === "en" ? "Specify Donation Purpose" : "Tuliskan Tujuan Donasi"}
                        value={customPurpose}
                        onChange={(v) => {
                            setCustomPurpose(v);
                            setErrors(prev => ({...prev, purpose: ""}));
                        }}
                        required
                        error={errors.purpose ? t(errors.purpose) : ""}
                    />
                )}
                {optionsError ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                    {t(optionsError)}
                  </div>
                ) : null}
              </div>

              {/* SECTION: BUKTI TRANSFER */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                     <FontAwesomeIcon icon={faMoneyBillWave} className="text-sm" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    {t("konfirmasi.form.section.proof")}
                  </h4>
                </div>
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
              </div>

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
    <label className="block space-y-2 text-sm font-bold text-slate-700">
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

function SelectField({
  label,
  value,
  onChange,
  required,
  error,
  options,
  disabled,
  placeholder,
  loading,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  options: Array<{ value: string; label: string } | { label: string; options: Array<{ value: string; label: string }> }>;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
}) {
  const base =
    "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error
    ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100"
    : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  const emptyLabel = loading ? "Memuat..." : placeholder ?? "Pilih";
  return (
    <label className="block space-y-2 text-sm font-bold text-slate-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`${base} ${state} ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
      >
        <option value="">{emptyLabel}</option>
        {options.map((option, idx) => {
          if ("options" in option) {
            return (
              <optgroup key={idx} label={option.label}>
                {option.options.map((subArgs) => (
                  <option key={subArgs.value} value={subArgs.value}>
                    {subArgs.label}
                  </option>
                ))}
              </optgroup>
            );
          }
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
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
    <label className="block space-y-2 text-sm font-bold text-slate-700">
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
