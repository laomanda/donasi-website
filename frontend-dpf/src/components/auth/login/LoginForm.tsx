import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { AuthField } from "../shared/AuthField";

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  remember: boolean;
  setRemember: (val: boolean) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  labels: {
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    rememberMe: string;
    submit: string;
    processing: string;
    showPassword: string;
    hidePassword: string;
  };
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  remember,
  setRemember,
  showPassword,
  setShowPassword,
  submitting,
  onSubmit,
  labels,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthField label={labels.email} required>
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
            placeholder={labels.emailPlaceholder}
            required
          />
        </div>
      </AuthField>

      <AuthField label={labels.password} required>
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
            placeholder={labels.passwordPlaceholder}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 inline-flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
            aria-label={showPassword ? labels.hidePassword : labels.showPassword}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
      </AuthField>

      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brandGreen-600 focus:ring-brandGreen-200"
          />
          {labels.rememberMe}
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brandGreen-700/25 transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FontAwesomeIcon icon={faRightToBracket} />
        {submitting ? labels.processing : labels.submit}
      </button>
    </form>
  );
}
