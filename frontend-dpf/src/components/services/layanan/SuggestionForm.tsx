import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots, faCheckCircle, faUserSecret, faUser, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { InputField, PhoneInputField, TextareaField } from "../shared/ServiceUI";
import http from "../../../lib/http";

type SuggestionFormProps = {
  translate: (key: string, fallback?: string) => string;
};

export function SuggestionForm({ translate: t }: SuggestionFormProps) {
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
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
          <FontAwesomeIcon icon={faCommentDots} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">{t("layanan.suggestion.badge")}</p>
          <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("layanan.suggestion.heading")}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.3)] sm:p-8 space-y-4">
        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 cursor-pointer" onClick={() => handleChange("isAnonymous", !form.isAnonymous)}>
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${form.isAnonymous ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-slate-300"}`}>
            {form.isAnonymous && <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />}
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUserSecret} className={`transition ${form.isAnonymous ? "text-primary-600" : "text-slate-400"}`} />
            <span className={`text-sm font-bold transition ${form.isAnonymous ? "text-slate-900" : "text-slate-600"}`}>
              {t("layanan.suggestion.anonymous")}
            </span>
          </div>
        </label>

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

        <PhoneInputField
          label={t("layanan.suggestion.phone")}
          value={form.phone}
          onChange={(v: string | undefined) => handleChange("phone", v || "")}
          disabled={submitting}
          error={errors.phone ? t(errors.phone) : ""}
          required
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
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
  );
}
