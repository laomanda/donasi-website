import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faBuilding, faArrowRight, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import PhoneInput from "../../ui/PhoneInput";
import { AuthField } from "../shared/AuthField";
import { translateBackendError } from "../shared/AuthUtils";

interface RegisterFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string[]>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  t: (key: string) => string;
  labels: {
    picName: string;
    picNamePlaceholder: string;
    institutionName: string;
    institutionNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    whatsapp: string;
    password: string;
    confirmPassword: string;
    submit: string;
    processing: string;
  };
}

export function RegisterForm({
  formData,
  setFormData,
  errors,
  loading,
  onSubmit,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  t,
  labels,
}: RegisterFormProps) {
  const getError = (fieldName: string) => {
    const errorMsg = errors[fieldName]?.[0];
    if (!errorMsg) return undefined;
    const i18nKey = translateBackendError(errorMsg);
    return t(i18nKey);
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <AuthField label={labels.picName} required error={getError("name")}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <FontAwesomeIcon icon={faUser} className="text-xs" />
            </span>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
              placeholder={labels.picNamePlaceholder}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </AuthField>

        <AuthField label={labels.institutionName} error={getError("instansi")}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <FontAwesomeIcon icon={faBuilding} className="text-xs" />
            </span>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
              placeholder={labels.institutionNamePlaceholder}
              value={formData.instansi}
              onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
            />
          </div>
        </AuthField>

        <AuthField label={labels.email} required error={getError("email")}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
            </span>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
              placeholder={labels.emailPlaceholder}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </AuthField>

        <div className="sm:col-span-2">
          <PhoneInput
            label={labels.whatsapp}
            required
            value={formData.phone}
            onChange={(val) => setFormData({ ...formData, phone: val })}
            error={getError("phone")}
          />
        </div>

        <AuthField label={labels.password} required>
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
        </AuthField>

        <AuthField label={labels.confirmPassword} required>
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
        </AuthField>
      </div>

      {errors.password && (
        <p className="mt-2 text-[10px] font-bold uppercase tracking-tight text-red-600">
          {getError("password")}
        </p>
      )}

      <div className="flex pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brandGreen-600 px-6 py-3 text-sm font-bold text-white hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? labels.processing : labels.submit}
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px] opacity-50" />
        </button>
      </div>
    </form>
  );
}
