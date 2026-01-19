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

type ValidationErrorBag = Record<string, unknown>;

type ApiErrorData = {
  message?: unknown;
  errors?: unknown;
};

type DashboardRole = "superadmin" | "admin" | "editor";

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
      navigate(`/${role}/dashboard`, { replace: true });
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err) ?? "Email atau kata sandi salah.");
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
            <h1 className="font-heading text-2xl font-semibold text-slate-900">Masuk</h1>
            <p className="text-sm leading-relaxed text-slate-600">Gunakan akun internal Anda untuk melanjutkan.</p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Email" required>
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
                  placeholder="nama@dpf.or.id"
                  required
                />
              </div>
            </Field>

            <Field label="Kata sandi" required>
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
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 inline-flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
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
                Ingat saya
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brandGreen-700/25 transition hover:-translate-y-0.5 hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faRightToBracket} />
              {submitting ? "Memproses..." : "Masuk"}
            </button>
          </form>
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
