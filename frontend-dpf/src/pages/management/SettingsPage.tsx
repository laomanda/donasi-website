import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faCircleInfo,
  faEye,
  faEyeSlash,
  faGlobe,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../lib/http";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import type { DashboardRole } from "../../layouts/dashboard/DashboardLayout";
import dpfLogo from "../../brand/dpf-icon.png";
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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <img src={dpfLogo} alt="DPF" className="h-9 w-9 object-contain" />
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
                Pengaturan
              </span>
              <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Pengaturan {roleLabel(role)}
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Kelola akun, preferensi kerja, dan keamanan dari satu tempat.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/${role}/dashboard`)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              Ke dashboard
            </button>
            <button
              type="button"
              onClick={() => window.open("/", "_blank", "noopener,noreferrer")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
            >
              <FontAwesomeIcon icon={faGlobe} />
              Buka website
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">Profil</p>
            <p className="mt-2 text-lg font-semibold">{displayName}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-100">{displayEmail}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{roleLabel(role)}</span>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  tokenExists ? "bg-emerald-500 text-white" : "bg-slate-600 text-white",
                ].join(" ")}
              >
                {tokenExists ? "Sesi aktif" : "Sesi kosong"}
              </span>
            </div>
          </div>

        </aside>

        <div className="space-y-6">
          <section
            id="account"
            className="scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-900 bg-slate-900 px-6 py-5 text-white sm:px-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-200">Akun</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold">Identitas akun</h2>
                  <p className="mt-2 text-sm text-emerald-100">Detail akun dan informasi sesi.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 border-l-4 border-l-slate-900 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Nama</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{displayName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 border-l-4 border-l-slate-900 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Email</p>
                  <p className="mt-2 truncate text-sm font-bold text-slate-900">{displayEmail}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 border-l-4 border-l-slate-900 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Peran</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{roleLabel(role)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 border-l-4 border-l-slate-900 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Sesi</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{tokenExists ? "Aktif" : "Tidak ada"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => void onCopy(displayEmail === "Email belum tersedia" ? "" : displayEmail, "Email")}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Salin email
                </button>
              </div>
            </div>
          </section>

          <section
            id="security"
            className="scroll-mt-28 overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-sm"
          >
            <div className="border-b border-emerald-700 bg-emerald-600 px-6 py-5 text-white sm:px-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <FontAwesomeIcon icon={faCircleInfo} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-100">Keamanan</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-white">Ganti password</h2>
                  <p className="mt-2 text-sm text-emerald-100">Perbarui password untuk menjaga keamanan akun.</p>
                </div>
              </div>
            </div>

            <form onSubmit={onChangePassword} className="px-6 py-6 sm:px-8">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Password saat ini</span>
                  <div className="relative mt-2">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm((s) => ({ ...s, current: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={passwordSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((state) => ({ ...state, current: !state.current }))}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={showPassword.current ? "Sembunyikan password saat ini" : "Tampilkan password saat ini"}
                      disabled={passwordSaving}
                    >
                      <FontAwesomeIcon icon={showPassword.current ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {passwordErrors.current ? (
                    <span className="mt-2 block text-xs font-semibold text-red-600">{passwordErrors.current}</span>
                  ) : null}
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Password baru</span>
                  <div className="relative mt-2">
                    <input
                      type={showPassword.next ? "text" : "password"}
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm((s) => ({ ...s, next: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={passwordSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((state) => ({ ...state, next: !state.next }))}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={showPassword.next ? "Sembunyikan password baru" : "Tampilkan password baru"}
                      disabled={passwordSaving}
                    >
                      <FontAwesomeIcon icon={showPassword.next ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {passwordErrors.next ? (
                    <span className="mt-2 block text-xs font-semibold text-red-600">{passwordErrors.next}</span>
                  ) : null}
                </label>

                <label className="block md:col-span-2">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Konfirmasi password baru</span>
                  <div className="relative mt-2">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((s) => ({ ...s, confirm: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      disabled={passwordSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((state) => ({ ...state, confirm: !state.confirm }))}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword.confirm ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"
                      }
                      disabled={passwordSaving}
                    >
                      <FontAwesomeIcon icon={showPassword.confirm ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {passwordErrors.confirm ? (
                    <span className="mt-2 block text-xs font-semibold text-red-600">{passwordErrors.confirm}</span>
                  ) : null}
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordForm({ current: "", next: "", confirm: "" });
                    setPasswordErrors({});
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  disabled={passwordSaving}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? "Menyimpan..." : "Simpan password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
