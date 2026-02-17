import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faBuilding, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import http from "../../lib/http";
import dpfLogo from "../../brand/dpf-icon.png";
import { useGoogleLogin } from "@react-oauth/google";
import { setAuthToken, setAuthUser } from "../../lib/auth";
import { toast } from "react-hot-toast";
import { AuthLayout } from "../../layouts/AuthLayout";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import PhoneInput from "../../components/ui/PhoneInput";
import { useLang } from "../../lib/i18n";
import { authDict, translate } from "../../i18n/auth";

export function MitraRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(authDict, locale, key, fallback);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instansi: "",
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await http.post("/auth/mitra/register", formData);
      navigate("/login", { 
        state: { message: t("register.success") } 
      });
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await http.post("/auth/google", {
          access_token: tokenResponse.access_token,
        });
        
        const { token, user } = res.data;
        setAuthToken(token);
        setAuthUser(user);
        
        toast.success(t("login.google_success"));
        navigate("/mitra/dashboard", { replace: true });
      } catch (err) {
        toast.error(t("login.google_fail"));
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error(t("login.google_connection_error"));
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_25px_70px_-45px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col md:flex-row">
            {/* Left Panel: Branding & Info */}
            <div className="relative w-full bg-primary-700 p-8 text-white md:w-[320px] lg:w-[380px]">
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <Link to="/" className="inline-flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full object-cover">
                      <img src={dpfLogo} alt="DPF" className="h-7 w-7 object-contain rounded-lg" />
                    </span>
                    <div className="leading-tight">
                      <p className="font-heading text-sm font-bold tracking-tight text-white">DPF WAKAF</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        Amanah | Profesional
                      </p>
                    </div>
                  </Link>

                  <div className="mt-12 space-y-4">
                    <h1 className="font-heading text-3xl font-bold leading-tight lg:text-4xl text-white">
                      {t("register.left_panel_title").split(" ").slice(0,-1).join(" ")} <br />
                      <span className="text-white">{t("register.left_panel_title").split(" ").slice(-1)}</span>
                    </h1>
                    <p className="text-sm leading-relaxed text-white">
                      {t("register.left_panel_desc")}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <p className="text-xs font-medium text-white/60">
                    {t("register.already_have_account").split("?")[0]}?{" "}
                    <Link to="/login" className="font-bold text-white hover:text-slate-200 transition">
                      {t("register.already_have_account").split("?")[1].trim()}
                    </Link>
                  </p>
                </div>
              </div>

              {/* Decorative background elements for left panel */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brandGreen-500/10 blur-[80px]" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-brandGreen-600/10 blur-[80px]" />
            </div>

            {/* Right Panel: Form */}
            <div className="flex-1 p-8 lg:p-10">
              <div className="mb-8">
                <h2 className="font-heading text-xl font-bold text-slate-900">{t("register.title")}</h2>
                <p className="text-sm font-medium text-slate-500">{t("register.subtitle")}</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <Field label={t("register.pic_name")} required>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        <FontAwesomeIcon icon={faUser} className="text-xs" />
                      </span>
                      <input
                        type="text"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                        placeholder={t("register.pic_name_placeholder")}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-red-600">{errors.name[0]}</p>}
                  </Field>

                  <Field label={t("register.institution_name")}>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        <FontAwesomeIcon icon={faBuilding} className="text-xs" />
                      </span>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                        placeholder={t("register.institution_name_placeholder")}
                        value={formData.instansi}
                        onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                      />
                    </div>
                  </Field>

                  <Field label={t("auth.email")} required>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                      </span>
                      <input
                        type="email"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                        placeholder={t("register.email_placeholder")}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-red-600">{errors.email[0]}</p>}
                  </Field>

                  <div className="sm:col-span-2">
                    <PhoneInput
                      label={t("register.whatsapp")}
                      required
                      value={formData.phone}
                      onChange={(val) => setFormData({ ...formData, phone: val })}
                      error={errors.phone?.[0]}
                    />
                  </div>

                  <Field label={t("auth.password")} required>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        <FontAwesomeIcon icon={faLock} className="text-xs" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-12 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-[10px]" />
                      </button>
                    </div>
                  </Field>

                  <Field label={t("register.confirm_password")} required>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        <FontAwesomeIcon icon={faLock} className="text-xs" />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-12 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition"
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-[10px]" />
                      </button>
                    </div>
                  </Field>
                </div>

                {errors.password && <p className="mt-2 text-[10px] font-bold uppercase tracking-tight text-red-600">{errors.password[0]}</p>}

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? t("auth.processing") : t("register.submit")}
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px] opacity-50" />
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => loginWithGoogle()}
                    className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    {t("auth.google_login")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm font-semibold text-slate-700">
      <span className="inline-flex items-center gap-1">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
