import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faUser, faLandmark, faCheckCircle, faHeadset } from "@fortawesome/free-solid-svg-icons";
import { InputField, PhoneInputField, SelectField, FileField } from "../shared/ServiceUI";
import http from "../../../lib/http";

type BankAccount = {
  account_name: string;
  account_number: string;
  bank_name: string;
  type: string;
};

type Program = {
  id: number;
  title: string;
  title_en: string | null;
};

type KonfirmasiDonasiFormProps = {
  translate: (key: string, fallback?: string) => string;
  locale: string;
};

export function KonfirmasiDonasiForm({ translate: t, locale }: KonfirmasiDonasiFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    program_id: "",
    custom_program: "",
    bank_account: "",
    amount: "",
    donation_date: "",
    proof: null as File | null,
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);

  useEffect(() => {
    http.get<{ data: Program[] }>("/programs?per_page=100").then(res => setPrograms(res.data.data || []));
    http.get<{ bank_accounts: BankAccount[] }>("/organization").then(res => setBanks(res.data.bank_accounts || []));
  }, []);

  const pickLocale = (idVal?: string | null, enVal?: string | null) => {
    const idText = (idVal ?? "").trim();
    const enText = (enVal ?? "").trim();
    if (locale === "en") return enText || idText;
    return idText || enText;
  };

  const programOptions = useMemo(() => {
    const base = programs.map((p) => ({
      value: String(p.id),
      label: pickLocale(p.title, p.title_en),
    }));
    return [...base, { value: "other", label: locale === "en" ? "Other" : "Lainnya" }];
  }, [programs, locale]);

  const bankOptions = useMemo(() => {
    // Rely on backend 'type' property: "domestic" | "international"
    const isDom = (b: any) => b.type !== 'international';
    const isInt = (b: any) => b.type === 'international';

    const domestic = banks.filter(isDom).map(b => ({
      value: `${b.bank_name} - ${b.account_number} (${b.account_name})`,
      label: `${b.bank_name} - ${b.account_number} (${b.account_name})`,
    }));
    
    const international = banks.filter(isInt).map(b => ({
      value: `${b.bank_name} - ${b.account_number} (${b.account_name})`,
      label: `${b.bank_name} - ${b.account_number} (${b.account_name})`,
    }));

    const options = [];
    if (domestic.length > 0) {
      options.push({ label: locale === "en" ? "Domestic" : "Domestik", options: domestic });
    }
    if (international.length > 0) {
      options.push({ label: "International", options: international });
    }
    return options;
  }, [banks, locale]);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus(null);
  };

  const validate = () => {
    const next: { [k: string]: string } = {};
    if (!form.name.trim()) next.name = "konfirmasi.form.error.name.required";
    if (!form.phone.trim()) next.phone = "konfirmasi.form.error.phone.required";
    if (!form.program_id) next.program_id = "konfirmasi.form.error.program.required";
    if (form.program_id === "other" && !form.custom_program.trim()) next.custom_program = "konfirmasi.form.error.custom_program.required";
    if (!form.bank_account) next.bank_account = "konfirmasi.form.error.bank.required";
    if (!form.amount || Number(form.amount) <= 0) next.amount = "konfirmasi.form.error.amount.required";
    if (!form.donation_date) next.donation_date = "konfirmasi.form.error.date.required";
    if (!form.proof) next.proof = "konfirmasi.form.error.proof.required";
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
      const data = new FormData();
      data.append("name", form.name);
      data.append("phone", form.phone);
      if (form.program_id === "other") {
        data.append("program_name", form.custom_program);
      } else {
        data.append("program_id", form.program_id);
      }
      data.append("bank_account", form.bank_account);
      data.append("amount", form.amount);
      data.append("donation_date", form.donation_date);
      if (form.proof) data.append("proof", form.proof);

      await http.post("/confirmations", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("success");
      setForm({
        name: "",
        phone: "",
        program_id: "",
        custom_program: "",
        bank_account: "",
        amount: "",
        donation_date: "",
        proof: null,
      });
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[400px_1fr] lg:items-start xl:gap-14">
      {/* KIRI: Info */}
      <div className="sticky lg:top-[120px] rounded-[32px] bg-gradient-to-br from-brandGreen-600 to-primary-600 p-8 text-white shadow-[0_30px_70px_-40px_rgba(16,185,129,0.5)]">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-50">{t("konfirmasi.form.badge")}</p>
        <h3 className="mt-3 text-3xl font-heading font-semibold leading-tight">{t("konfirmasi.form.heading")}</h3>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-emerald-50">
          <li className="flex gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="mt-1 flex-shrink-0" />
            <span>{t("konfirmasi.form.points.1")}</span>
          </li>
          <li className="flex gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="mt-1 flex-shrink-0" />
            <span>{t("konfirmasi.form.points.2")}</span>
          </li>
          <li className="flex gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="mt-1 flex-shrink-0" />
            <span>{t("konfirmasi.form.points.3")}</span>
          </li>
        </ul>
      </div>

      {/* KANAN: Form */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900 shadow-sm">
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            <FontAwesomeIcon icon={faHeadset} />
          </span>
          <p className="leading-relaxed">
            {locale === "en" ? "For further assistance, we gladly serve you via number " : "Untuk bantuan lebih lanjut, kami dengan senang hati melayani melalui nomor "}
            <a
              href="https://wa.me/6281311768254?text=Halo%20DPF%2C%20saya%20ingin%20bertanya%20mengenai%20konfirmasi%20donasi."
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              081311768254
            </a>
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-8 rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label={t("konfirmasi.form.fields.name")} icon={faUser} value={form.name} onChange={(v: string) => handleChange("name", v)} error={errors.name ? t(errors.name) : ""} required disabled={submitting} />
            <PhoneInputField label={t("konfirmasi.form.fields.phone")} value={form.phone} onChange={(v: string | undefined) => handleChange("phone", v || "")} disabled={submitting} error={errors.phone ? t(errors.phone) : ""} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={form.program_id === "other" ? "sm:col-span-2 grid sm:grid-cols-2 gap-4" : ""}>
              <SelectField
                label={t("konfirmasi.form.fields.purpose")}
                value={form.program_id}
                onChange={(v: string) => handleChange("program_id", v)}
                required
                error={errors.program_id ? t(errors.program_id) : ""}
                options={programOptions}
                placeholder={t("konfirmasi.form.program.placeholder")}
              />
              {form.program_id === "other" && (
                <InputField
                  label={locale === "en" ? "Custom Program" : "Program Lainnya"}
                  value={form.custom_program}
                  onChange={(v: string) => handleChange("custom_program", v)}
                  required
                  error={errors.custom_program ? t(errors.custom_program) : ""}
                />
              )}
            </div>
            <SelectField
              label={t("konfirmasi.form.fields.bank")}
              icon={faLandmark}
              value={form.bank_account}
              onChange={(v: string) => handleChange("bank_account", v)}
              required
              error={errors.bank_account ? t(errors.bank_account) : ""}
              options={bankOptions}
              placeholder={t("konfirmasi.form.bank.placeholder")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label={t("konfirmasi.form.fields.amount")}
              type="number"
              value={form.amount}
              onChange={(v: string) => handleChange("amount", v)}
              required
              error={errors.amount ? t(errors.amount) : ""}
              placeholder="0"
            />
            <InputField
              label={t("konfirmasi.form.fields.date")}
              type="date"
              value={form.donation_date}
              onChange={(v: string) => handleChange("donation_date", v)}
              required
              error={errors.donation_date ? t(errors.donation_date) : ""}
            />
          </div>

          <FileField
            label={t("konfirmasi.form.fields.proof")}
            onChange={(file: File | null) => handleChange("proof", file)}
            required
            error={errors.proof ? t(errors.proof) : ""}
          />

          <div className="pt-2">
            {status && (
              <div
                className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                  status === "success"
                    ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border border-red-100 bg-red-50 text-red-700"
                }`}
              >
                {status === "success" ? t("konfirmasi.form.submit.success") : t("konfirmasi.form.submit.error")}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 py-4 text-sm font-bold text-white shadow-lg shadow-brandGreen-500/20 transition hover:-translate-y-0.5 hover:bg-brandGreen-700 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPaperPlane} className={submitting ? "animate-pulse" : ""} />
              {submitting ? t("konfirmasi.form.submit.sending") : t("konfirmasi.form.submit.label")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
