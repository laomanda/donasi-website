import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleInfo, faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";

interface SettingsSecuritySectionProps {
  passwordForm: any;
  setPasswordForm: (cb: (prev: any) => any) => void;
  showPassword: any;
  setShowPassword: (cb: (prev: any) => any) => void;
  passwordErrors: { [k: string]: string };
  passwordSaving: boolean;
  onChangePassword: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
}

export function SettingsSecuritySection({
  passwordForm,
  setPasswordForm,
  showPassword,
  setShowPassword,
  passwordErrors,
  passwordSaving,
  onChangePassword,
  onReset,
}: SettingsSecuritySectionProps) {
  return (
    <section id="security" className="scroll-mt-24 space-y-6">
      <div className="flex items-center gap-4">
         <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
            <FontAwesomeIcon icon={faLock} className="text-lg" />
         </div>
         <div>
            <h2 className="font-heading text-2xl font-bold text-slate-900">Keamanan Akun</h2>
            <p className="text-sm font-medium text-slate-500">Perbarui kata sandi secara berkala.</p>
         </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={onChangePassword} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: "current", label: "Kata Sandi Saat Ini", value: passwordForm.current, show: showPassword.current },
              { id: "next", label: "Kata Sandi Baru", value: passwordForm.next, show: showPassword.next },
              { id: "confirm", label: "Konfirmasi Kata Sandi Baru", value: passwordForm.confirm, show: showPassword.confirm, full: true },
            ].map((field) => (
              <div key={field.id} className={`${field.full ? 'md:col-span-2' : ''} space-y-2`}>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{field.label}</label>
                <div className="relative group">
                  <input
                    type={field.show ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => setPasswordForm((s) => ({ ...s, [field.id]: e.target.value }))}
                    className={`w-full rounded-2xl border ${passwordErrors[field.id] ? 'border-red-500 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5'} bg-slate-50 py-4 pl-5 pr-14 text-sm font-bold text-slate-900 outline-none transition-all focus:bg-white`}
                    disabled={passwordSaving}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((state: any) => ({ ...state, [field.id]: !state[field.id] }))}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-brandGreen-600 hover:shadow-sm"
                    disabled={passwordSaving}
                  >
                    <FontAwesomeIcon icon={field.show ? faEyeSlash : faEye} />
                  </button>
                </div>
                {passwordErrors[field.id] && (
                  <p className="text-[11px] font-bold text-red-500 animate-pulse">{passwordErrors[field.id]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-14 items-center justify-center px-8 text-sm font-bold text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
              disabled={passwordSaving}
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-brandGreen-600 px-10 text-sm font-bold text-white shadow-xl shadow-brandGreen-600/20 transition-all hover:bg-brandGreen-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={passwordSaving}
            >
              <FontAwesomeIcon icon={passwordSaving ? faCircleInfo : faCircleCheck} className={passwordSaving ? 'animate-spin' : ''} />
              {passwordSaving ? "Menyimpan..." : "Perbarui Kata Sandi"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SettingsSecuritySection;
