import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faCircleCheck,
  faCircleInfo,
  faEye,
  faEyeSlash,
  faGlobe,
  faLock,
  faShieldHalved,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../lib/http";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import type { DashboardRole } from "../../layouts/dashboard/DashboardLayout";
import { useToast } from "../../components/ui/ToastProvider";

const roleLabel = (role: DashboardRole) => {
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Editor";
};

export function SettingsPage({ role }: { role: DashboardRole }) {
  const navigate = useNavigate();
  const toast = useToast();

  const user = useMemo(() => getAuthUser(), []);
  const tokenExists = useMemo(() => Boolean(getAuthToken()), []);

  const displayName = useMemo(() => {
    const value = String(user?.name ?? roleLabel(role)).trim();
    return value || roleLabel(role);
  }, [role, user?.name]);

  const displayEmail = useMemo(() => {
    const value = String(user?.email ?? "").trim();
    return value || "Email belum tersedia";
  }, [user?.email]);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [k: string]: string }>({});
  const [passwordSaving, setPasswordSaving] = useState(false);


  const onCopy = async (value: string, label: string) => {
    const text = String(value ?? "");
    if (!text.trim()) {
      toast.error(`${label} kosong.`, { title: "Gagal" });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} berhasil disalin.`, { title: "Berhasil" });
    } catch {
      toast.error(`Tidak bisa menyalin ${label}.`, { title: "Gagal" });
    }
  };

  const validatePasswordForm = () => {
    const nextErrors: { [k: string]: string } = {};
    if (!passwordForm.current.trim()) nextErrors.current = "Password saat ini wajib diisi.";
    if (!passwordForm.next.trim()) nextErrors.next = "Password baru wajib diisi.";
    if (passwordForm.next.trim().length > 0 && passwordForm.next.trim().length < 8) {
      nextErrors.next = "Password baru minimal 8 karakter.";
    }
    if (!passwordForm.confirm.trim()) nextErrors.confirm = "Konfirmasi password wajib diisi.";
    if (passwordForm.next.trim() && passwordForm.confirm.trim() && passwordForm.next !== passwordForm.confirm) {
      nextErrors.confirm = "Konfirmasi password tidak sama.";
    }
    return nextErrors;
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validatePasswordForm();
    if (Object.keys(nextErrors).length) {
      setPasswordErrors(nextErrors);
      return;
    }
    setPasswordSaving(true);
    setPasswordErrors({});
    try {
      await http.put("/auth/password", {
        current_password: passwordForm.current,
        new_password: passwordForm.next,
        new_password_confirmation: passwordForm.confirm,
      });
      setPasswordForm({ current: "", next: "", confirm: "" });
      toast.success("Password berhasil diperbarui.", { title: "Berhasil" });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Gagal memperbarui password.";
      toast.error(message, { title: "Gagal" });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-20">
      {/* Immersive Profile Hero */}
      <div className="relative overflow-hidden rounded-[40px] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 bg-brandGreen-600" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative z-10 px-8 py-10 md:px-12 md:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            {/* Avatar Section */}
            <div className="group relative shrink-0">
               <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-white text-3xl font-black text-brandGreen-600 shadow-xl transition-transform">
                  {displayName.charAt(0).toUpperCase()}
               </div>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Sesi Aktif
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  ID: #{user?.id || '0'}
                </span>
              </div>
              <h1 className="font-heading text-4xl font-black tracking-tight text-white md:text-6xl text-shadow-sm">
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FontAwesomeIcon icon={faBriefcase} className="text-emerald-400" />
                  {roleLabel(role)}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FontAwesomeIcon icon={faGlobe} className="text-emerald-400" />
                  {displayEmail}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`/${role}/dashboard`)}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-sm font-bold text-brandGreen-600 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Ke Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Navigation Sidebar */}
        <aside className="space-y-6">
          <div className="sticky top-24 space-y-2 rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Navigasi Pengaturan</p>
            <a 
              href="#account" 
              className="group flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors group-hover:text-brandGreen-600">
                <FontAwesomeIcon icon={faUser} />
              </div>
              Informasi Akun
            </a>
            <a 
              href="#security" 
              className="group flex items-center gap-3 rounded-2xl bg-transparent px-5 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-100 transition-colors group-hover:text-emerald-500 group-hover:ring-emerald-100">
                <FontAwesomeIcon icon={faLock} />
              </div>
              Kata Sandi
            </a>

            <div className="mt-6 border-t border-slate-100 p-4">
              <div className="flex items-center gap-3 text-slate-400">
                <FontAwesomeIcon icon={faCircleInfo} className="text-sm" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  Semua perubahan akan langsung diterapkan ke sistem.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Account Section */}
          <section id="account" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-600 text-white shadow-lg shadow-brandGreen-600/20">
                  <FontAwesomeIcon icon={faUser} className="text-lg" />
               </div>
               <div>
                  <h2 className="font-heading text-2xl font-bold text-slate-900">Informasi Akun</h2>
                  <p className="text-sm font-medium text-slate-500">Detail identitas dan akses akun Anda.</p>
               </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Nama Lengkap", value: displayName, icon: faUser },
                { label: "Alamat Email", value: displayEmail, icon: faGlobe },
                { label: "Tingkat Akses / Role", value: roleLabel(role), icon: faShieldHalved },
                { label: "Status Sesi", value: tokenExists ? "Terverifikasi Aktif" : "Tidak Aktif", icon: faCircleCheck },
              ].map((item, i) => (
                <div key={i} className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brandGreen-500/50 hover:shadow-md">
                  <div className="absolute right-0 top-0 -mr-4 -mt-4 opacity-5 transition-transform group-hover:scale-110">
                    <FontAwesomeIcon icon={item.icon} className="text-7xl" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                  <p className="mt-4 text-base font-bold text-slate-900 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void onCopy(displayEmail === "Email belum tersedia" ? "" : displayEmail, "Email")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-slate-800 active:scale-95"
              >
                Salin Email Profil
              </button>
            </div>
          </section>

          {/* Security Section */}
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
                    onClick={() => {
                      setPasswordForm({ current: "", next: "", confirm: "" });
                      setPasswordErrors({});
                    }}
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
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
