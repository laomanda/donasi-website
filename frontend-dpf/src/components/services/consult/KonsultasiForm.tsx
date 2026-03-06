import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faUser, faClock, faCalendarCheck, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { InputField, PhoneInputField, TextareaField } from "../shared/ServiceUI";
import http from "../../../lib/http";

type KonsultasiFormProps = {
  translate: (key: string, fallback?: string) => string;
  locale: string;
};

export function KonsultasiForm({ translate: t }: KonsultasiFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setStatus(null);
  };

  const validate = () => {
    const next: { [k: string]: string } = {};
    if (!form.name.trim()) next.name = "konsultasi.form.error.name.required";
    if (!form.phone.trim()) next.phone = "konsultasi.form.error.phone.required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "konsultasi.form.error.email.invalid";
    if (!form.subject.trim()) next.subject = "konsultasi.form.error.subject.required";
    if (!form.message.trim()) next.message = "konsultasi.form.error.message.required";
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
      await http.post("/consultations", {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        topic: form.subject, // Map subject to topic as per backend if needed
        message: form.message,
      });
      setStatus("success");
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
      {/* KIRI: Info Card (Sticky) */}
      <div className="lg:sticky lg:top-[120px] h-fit rounded-[24px] border border-slate-100 bg-gradient-to-br from-brandGreen-600 to-primary-600 p-8 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)]">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-50">{t("konsultasi.form.badge")}</p>
        <h3 className="mt-3 text-3xl font-heading font-semibold leading-tight">{t("konsultasi.form.heading")}</h3>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-emerald-50">
          <li className="flex gap-3">
            <FontAwesomeIcon icon={faClock} className="mt-1" />
            <span>{t("konsultasi.form.points.1")}</span>
          </li>
          <li className="flex gap-3">
            <FontAwesomeIcon icon={faCalendarCheck} className="mt-1" />
            <span>{t("konsultasi.form.points.2")}</span>
          </li>
          <li className="flex gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="mt-1" />
            <span>{t("konsultasi.form.points.3")}</span>
          </li>
        </ul>
      </div>

      {/* KANAN: Form */}
      <form onSubmit={handleSubmit} className="rounded-[24px] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)] space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label={t("konsultasi.form.fields.name")}
            icon={faUser}
            value={form.name}
            onChange={(v: string) => handleChange("name", v)}
            error={errors.name ? t(errors.name) : ""}
            required
            disabled={submitting}
          />

          <PhoneInputField
            label={t("konsultasi.form.fields.phone")}
            value={form.phone}
            onChange={(v: string | undefined) => handleChange("phone", v || "")}
            disabled={submitting}
            error={errors.phone ? t(errors.phone) : ""}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label={t("konsultasi.form.fields.email")}
            value={form.email}
            onChange={(v: string) => handleChange("email", v)}
            error={errors.email ? t(errors.email) : ""}
            type="email"
            disabled={submitting}
          />

          <InputField
            label={t("konsultasi.form.fields.topic")}
            value={form.subject}
            onChange={(v: string) => handleChange("subject", v)}
            error={errors.subject ? t(errors.subject) : ""}
            placeholder={t("konsultasi.form.fields.topic.placeholder")}
            required
            disabled={submitting}
          />
        </div>

        <TextareaField
          label={t("konsultasi.form.fields.message")}
          value={form.message}
          onChange={(v: string) => handleChange("message", v)}
          placeholder={t("konsultasi.form.fields.message.placeholder")}
          error={errors.message ? t(errors.message) : ""}
          required
          disabled={submitting}
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
              {status === "success" ? t("konsultasi.form.submit.success") : t("konsultasi.form.submit.error")}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faPaperPlane} className={submitting ? "animate-pulse" : ""} />
            {submitting ? t("konsultasi.form.submit.sending") : t("konsultasi.form.submit.label")}
          </button>
        </div>
      </form>
    </div>
  );
}
