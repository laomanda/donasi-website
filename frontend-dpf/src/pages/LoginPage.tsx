import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import http from "../lib/http";
import { setAuthToken, setAuthUser } from "../lib/auth";
import dpfLogo from "../brand/dpf-icon.png";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { useLang } from "../lib/i18n";
import { authDict, translate } from "../i18n/auth";

type ValidationErrorBag = Record<string, unknown>;

type ApiErrorData = {
  message?: unknown;
  errors?: unknown;
};

type DashboardRole = "superadmin" | "admin" | "editor" | "pelihat" | "mitra";

const extractApiErrorMessage = (err: unknown): string | null => {
  if (!err || typeof err !== "object") return null;

  const response = (err as { response?: unknown }).response;
  if (!response || typeof response !== "object") return null;

  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;

  const { message, errors } = data as ApiErrorData;

  const messageString = typeof message === "string" ? message : null;

  if (errors && typeof errors === "object") {
    const firstValue = Object.values(errors as ValidationErrorBag)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
      return firstValue[0];
    }
  }

  return messageString;
};

const resolveDashboardRole = (user: unknown): DashboardRole | null => {
  if (!user || typeof user !== "object") return null;

  const candidates: string[] = [];
  const roles = (user as any).roles;
  if (Array.isArray(roles)) {
    roles.forEach((r: any) => {
      if (r && typeof r === "object" && typeof r.name === "string") {
        candidates.push(r.name);
      }
    });
  }

  if (typeof (user as any).role_label === "string") {
    candidates.push((user as any).role_label);
  }

  const normalized = new Set(
    candidates.map((value) => String(value).toLowerCase().replace(/[^a-z]/g, ""))
  );

  if (normalized.has("superadmin")) return "superadmin";
  if (normalized.has("admin")) return "admin";
  if (normalized.has("editor")) return "editor";
  if (normalized.has("pelihat")) return "pelihat";
  if (normalized.has("mitra")) return "mitra";
  return null;
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(authDict, locale, key, fallback);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await http.post("/auth/google", {
          access_token: tokenResponse.access_token,
        });
        
        const { token, user } = res.data;
        setAuthToken(token);
        setAuthUser(user);
        
        toast.success(t("login.google_success"));
        const role = resolveDashboardRole(user) ?? "editor";
        const redirectPath = `/${role}/dashboard`;
        navigate(redirectPath, { replace: true });
      } catch (err) {
        toast.error(t("login.google_fail"));
      } finally {
        setSubmitting(false);
      }
    },
    onError: () => {
      toast.error(t("login.google_connection_error"));
    },
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await http.post<{ token?: unknown; user?: unknown }>("/auth/login", {
        email: email.trim(),
        password,
        remember,
      });

      if (typeof res.data?.token === "string" && res.data.token) {
        setAuthToken(res.data.token);
      }

      if (res.data?.user && typeof res.data.user === "object") {
        const raw = res.data.user as any;
        setAuthUser({
          id: typeof raw.id === "number" ? raw.id : undefined,
          name: typeof raw.name === "string" ? raw.name : undefined,
          email: typeof raw.email === "string" ? raw.email : undefined,
          role_label: typeof raw.role_label === "string" ? raw.role_label : undefined,
          roles: Array.isArray(raw.roles)
            ? raw.roles
                .filter((r: any) => r && typeof r === "object" && typeof r.name === "string")
                .map((r: any) => ({ name: r.name as string }))
            : undefined,
        });
      }

      const role = resolveDashboardRole(res.data?.user) ?? "editor";
      const redirectPath = `/${role}/dashboard`;
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err) ?? (locale === "en" ? "Invalid email or password." : "Email atau kata sandi salah."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <img src={dpfLogo} alt="DPF" className="h-7 w-7 object-contain" />
            </span>
            <div className="leading-tight">
              <p className="font-heading text-sm font-bold text-slate-900">DPF WAKAF</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Amanah | Profesional
              </p>
            </div>
          </Link>
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-[0_25px_70px_-45px_rgba(0,0,0,0.45)] sm:p-9">
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-semibold text-slate-900">{t("login.title")}</h1>
            <p className="text-sm leading-relaxed text-slate-600">{t("login.subtitle")}</p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label={t("auth.email")} required>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                  placeholder={t("login.email_placeholder")}
                  required
                />
              </div>
            </Field>

            <Field label={t("auth.password")} required>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                  placeholder={t("auth.password_placeholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 inline-flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                  aria-label={showPassword ? (locale === "en" ? "Hide password" : "Sembunyikan kata sandi") : (locale === "en" ? "Show password" : "Tampilkan kata sandi")}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </Field>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-200"
                />
                {t("login.remember_me")}
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brandGreen-700/25 transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faRightToBracket} />
              {submitting ? t("auth.processing") : t("login.title")}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 font-bold tracking-widest text-slate-400">{t("auth.or")}</span>
              </div>
            </div>

                  <button
              type="button"
              disabled={submitting}
              onClick={() => loginWithGoogle()}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {t("auth.google_login")}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm font-medium text-slate-500">
              {t("login.mitra_interest")}{" "}
              <Link to="/register-mitra" className="font-bold text-brandGreen-600 hover:text-brandGreen-700">
                {t("login.register_mitra")}
              </Link>
            </p>
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
    <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
      <span className="inline-flex items-center gap-1">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

export default LoginPage;
export { LoginPage };
