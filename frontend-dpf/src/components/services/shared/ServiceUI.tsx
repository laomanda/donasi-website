import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PhoneInput from "../../ui/PhoneInput";

export function StatLine({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="text-sm font-heading font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function InfoPill({ icon, label, size = "md" }: { icon: any; label: string, size?: "md" | "lg" }) {
  if (size === "lg") {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <FontAwesomeIcon icon={icon} className="text-lg" />
        </div>
        <span className="font-semibold text-slate-800 leading-tight">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        <FontAwesomeIcon icon={icon} />
      </span>
      <span>{label}</span>
    </div>
  );
}

export function HeroTrustBadge({ 
  badge, 
  title, 
  pills, 
  size = "md",
  icon = null
}: { 
  badge: string; 
  title: string; 
  pills: Array<{ icon: any; label: string }>;
  size?: "md" | "lg";
  icon?: any;
}) {
  const containerClass = size === "lg" 
    ? "rounded-[40px] border border-white/60 bg-white/60 p-8 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.3)] backdrop-blur-md"
    : "rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.4)] backdrop-blur";

  const bannerClass = size === "lg"
    ? "flex items-center gap-4 rounded-3xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-6 py-5 text-white shadow-xl shadow-brandGreen-900/10"
    : "flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg";

  const bannerIconClass = size === "lg"
    ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm"
    : "text-lg";

  return (
    <div className={containerClass}>
      <div className={bannerClass}>
        {icon && (
          <div className={bannerIconClass}>
            <FontAwesomeIcon icon={icon} className={size === "lg" ? "text-xl" : ""} />
          </div>
        )}
        <div>
          <p className={size === "lg" ? "text-xs font-bold uppercase tracking-[0.2em] text-emerald-100" : "text-xs font-semibold uppercase tracking-[0.22em] text-white"}>
            {badge}
          </p>
          <p className={size === "lg" ? "text-lg font-heading font-bold leading-tight" : "text-base font-bold leading-tight"}>
            {title}
          </p>
        </div>
      </div>
      <div className={`mt-${size === "lg" ? "6" : "5"} grid gap-4 sm:grid-cols-2`}>
        {pills.map((p, idx) => (
          <InfoPill key={idx} icon={p.icon} label={p.label} size={size} />
        ))}
      </div>
    </div>
  );
}

export function InputField({
  label,
  icon,
  value,
  onChange,
  required,
  error,
  type = "text",
  placeholder,
  disabled
}: any) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100" : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="block space-y-2 text-sm font-bold text-slate-700">
      <span className="flex items-center gap-2">
        {icon && <FontAwesomeIcon icon={icon} className="text-primary-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required} 
        placeholder={placeholder}
        disabled={disabled}
        className={`${base} ${state} ${disabled ? "bg-slate-50 cursor-not-allowed" : ""}`} 
      />
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export function TextareaField({ label, value, onChange, placeholder, required, error, disabled, rows = 4 }: any) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100" : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="block space-y-2 text-sm font-bold text-slate-700">
      <span className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        required={required} 
        rows={rows} 
        disabled={disabled}
        className={`${base} ${state} ${disabled ? "bg-slate-50 cursor-not-allowed" : ""}`} 
      />
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export function SelectField({
  label,
  icon,
  value,
  onChange,
  required,
  error,
  options,
  disabled,
  placeholder,
  loading,
}: any) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100" : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  const emptyLabel = loading ? "Memuat..." : placeholder ?? "Pilih";
  return (
    <label className="block space-y-2 text-sm font-bold text-slate-700">
      <span className="flex items-center gap-2">
        {icon && <FontAwesomeIcon icon={icon} className="text-primary-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`${base} ${state} ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
      >
        <option value="">{emptyLabel}</option>
        {options.map((option: any, idx: number) => {
          // Check if it's a grouped option
          const hasSubOptions = option.options && Array.isArray(option.options);
          
          if (hasSubOptions) {
            return (
              <optgroup key={`group-${idx}`} label={option.label}>
                {option.options.map((sub: any, subIdx: number) => (
                  <option key={`sub-${idx}-${subIdx}`} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </optgroup>
            );
          }

          // Regular option
          return (
            <option key={option.value || `opt-${idx}`} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export function PhoneInputField({ label, value, onChange, error, disabled, required }: any) {
  return (
    <label className="block space-y-2 text-sm font-bold text-slate-700">
      <span className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <PhoneInput
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </label>
  );
}

export function FileField({ label, onChange, error, required }: { label: string; onChange: (file: File | null) => void; error?: string; required?: boolean }) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2";
  const state = error ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100" : "border-slate-200 bg-white focus:border-primary-200 focus:ring-primary-100";
  return (
    <label className="block space-y-2 text-sm font-bold text-slate-700">
      <span className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <div className={`${base} ${state} flex items-center gap-3 bg-white`}>
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

export function ServiceBenefits({ 
  badge, 
  heading, 
  subtitle, 
  benefits,
  cols = 4
}: { 
  badge: string; 
  heading: string; 
  subtitle?: string; 
  benefits: Array<{ titleKey: string; descKey: string; icon: any }>;
  cols?: number;
}) {
  const colClass = cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary-700 shadow-sm">
            {badge}
          </p>
          <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">{heading}</h2>
          {subtitle && <p className="text-sm text-slate-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
        <div className={`mt-10 grid gap-6 sm:grid-cols-2 ${colClass} items-stretch`}>
          {benefits.map((item) => (
            <div key={item.titleKey} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 shadow-sm">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <h3 className="mt-3 text-lg font-heading font-semibold text-slate-900">{item.titleKey}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.descKey}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
