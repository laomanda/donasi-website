import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import PhoneInput from "../../../../components/ui/PhoneInput";

interface UserPersonalInfoFieldsProps {
  form: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  setForm: (update: (prev: any) => any) => void;
  loading: boolean;
  saving: boolean;
  mode: "create" | "edit";
}

export function UserPersonalInfoFields({
  form,
  setForm,
  loading,
  saving,
  mode,
}: UserPersonalInfoFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-slate-900">Informasi Pribadi</h3>
          <p className="text-sm font-medium text-slate-500">Data identitas pengguna.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block sm:col-span-2 group">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">
            Nama Lengkap <span className="text-red-500">*</span>
          </span>
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="Masukkan nama lengkap..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-400"
            disabled={loading || saving}
          />
        </label>

        <label className="block sm:col-span-2 group">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">
            Alamat Email <span className="text-red-500">*</span>
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            placeholder="nama@email.com"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-400"
            disabled={loading || saving}
          />
        </label>

        <label className="block group">
          <PhoneInput
            label="Nomor Telepon"
            value={form.phone}
            onChange={(val) => setForm((s) => ({ ...s, phone: val || "" }))}
            disabled={loading || saving}
          />
        </label>

        <label className="block group">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">
            Password {mode === "create" && <span className="text-red-500">*</span>}
          </span>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              placeholder={mode === "create" ? "Minimal 8 karakter" : "Kosongkan jika tetap"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-400"
              disabled={loading || saving}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-emerald-600 transition"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </label>
      </div>
    </div>
  );
}
