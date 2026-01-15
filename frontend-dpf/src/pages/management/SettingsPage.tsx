import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faArrowUpRightFromSquare,
  faCircleInfo,
  faGear,
  faGlobe,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../lib/http";
import { getAuthToken, getAuthUser } from "../../lib/auth";
import type { DashboardRole } from "../../layouts/dashboard/DashboardLayout";
import dpfLogo from "../../brand/dpf-icon.png";
import { useToast } from "../../components/ui/ToastProvider";
import { SETTINGS_EVENT, readSearchLimit, readShowClock, setSearchLimit, setShowClock } from "../../lib/settings";

const roleLabel = (role: DashboardRole) => {
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Editor";
};

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-left shadow-sm transition",
        checked
          ? "border-brandGreen-100 bg-brandGreen-50 text-brandGreen-900"
          : "border-slate-200 bg-white text-slate-900 hover:border-brandGreen-200 hover:bg-brandGreen-50",
      ].join(" ")}
    >
      <span className="min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-1 text-xs font-semibold text-slate-600">{description}</p>
      </span>
      <span
        aria-hidden="true"
        className={[
          "relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full ring-1 ring-inset transition",
          checked ? "bg-brandGreen-600 ring-brandGreen-500" : "bg-slate-200 ring-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
            checked ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

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

  const [searchLimit, setSearchLimitState] = useState(() => readSearchLimit());
  const [showClock, setShowClockState] = useState(() => readShowClock());
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [k: string]: string }>({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const onSync = () => {
      setSearchLimitState(readSearchLimit());
      setShowClockState(readShowClock());
    };
    window.addEventListener(SETTINGS_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

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
      <div className="overflow-hidden rounded-[28px] border border-primary-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-primary-100 bg-primary-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
              <img src={dpfLogo} alt="DPF" className="h-8 w-8 object-contain" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.18em] text-primary-700">Pengaturan</p>
              <h1 className="mt-1 truncate font-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Pengaturan {roleLabel(role)}
              </h1>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-600">
                Panel pengaturan untuk akun, preferensi kerja, dan konfigurasi backend.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/${role}/dashboard`)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-5 py-3 text-sm font-bold text-primary-600 shadow-sm transition hover:bg-primary-600 hover:text-white"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              Ke dashboard
            </button>
            <button
              type="button"
              onClick={() => window.open("/", "_blank", "noopener,noreferrer")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-800"
            >
              <FontAwesomeIcon icon={faGlobe} />
              Buka website
            </button>
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Peran</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{roleLabel(role)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Sesi</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{tokenExists ? "Aktif" : "Tidak ada"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Jam kerja</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{showClock ? "Ditampilkan" : "Disembunyikan"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Limit pencarian</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{searchLimit} item</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
          <section
            id="account"
            className="scroll-mt-28 overflow-hidden rounded-[28px] border border-primary-100 bg-white shadow-sm"
          >
            <div className="border-b border-primary-100 bg-primary-50 px-6 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm ring-1 ring-primary-100">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-primary-700">Akun</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Identitas akun</h2>
                  <p className="mt-2 text-sm text-slate-600">Detail akun dan informasi sesi.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Nama</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{displayName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Email</p>
                  <p className="mt-2 truncate text-sm font-bold text-slate-900">{displayEmail}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Peran</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{roleLabel(role)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Sesi</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{tokenExists ? "Aktif" : "Tidak ada"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => void onCopy(displayEmail === "Email belum tersedia" ? "" : displayEmail, "Email")}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Salin email
                </button>
              </div>
            </div>
          </section>

          <section
            id="preferences"
            className="scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-brandGreen-800 bg-brandGreen-700 px-6 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brandGreen-800 shadow-sm">
                  <FontAwesomeIcon icon={faGear} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-brandGreen-50">Preferensi</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-white">Pengaturan tampilan</h2>
                  <p className="mt-2 text-sm text-brandGreen-50">Sesuaikan tampilan agar kerja lebih nyaman.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-brandGreen-100 bg-brandGreen-50 p-5">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-brandGreen-700">Pencarian</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">Jumlah item per kategori</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">Berlaku untuk halaman pencarian.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <select
                      value={searchLimit}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setSearchLimitState(next);
                        setSearchLimit(next);
                        toast.success("Preferensi pencarian diperbarui.", { title: "Berhasil" });
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandGreen-100 sm:w-60"
                    >
                      {[5, 8, 10, 12, 15].map((n) => (
                        <option key={n} value={n}>
                          {n} item
                        </option>
                      ))}
                    </select>
                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      Aktif: {searchLimit} item
                    </span>
                  </div>
                </div>

                <Toggle
                  label="Tampilkan jam kerja"
                  description="Jam kerja muncul di header (sebelah kolom pencarian)."
                  checked={showClock}
                  onChange={(next) => {
                    setShowClockState(next);
                    setShowClock(next);
                    toast.success("Preferensi tampilan diperbarui.", { title: "Berhasil" });
                  }}
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchLimitState(5);
                      setSearchLimit(5);
                      setShowClockState(true);
                      setShowClock(true);
                      toast.success("Preferensi dikembalikan ke default.", { title: "Berhasil" });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faArrowRotateRight} />
                    Atur ulang preferensi
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section
            id="security"
            className="scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <FontAwesomeIcon icon={faCircleInfo} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-slate-500">Keamanan</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Ganti password</h2>
                  <p className="mt-2 text-sm text-slate-600">Perbarui password untuk menjaga keamanan akun.</p>
                </div>
              </div>
            </div>

            <form onSubmit={onChangePassword} className="px-6 py-6 sm:px-8">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Password saat ini</span>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((s) => ({ ...s, current: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                    disabled={passwordSaving}
                  />
                  {passwordErrors.current ? (
                    <span className="mt-2 block text-xs font-semibold text-red-600">{passwordErrors.current}</span>
                  ) : null}
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Password baru</span>
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm((s) => ({ ...s, next: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                    disabled={passwordSaving}
                  />
                  {passwordErrors.next ? (
                    <span className="mt-2 block text-xs font-semibold text-red-600">{passwordErrors.next}</span>
                  ) : null}
                </label>

                <label className="block md:col-span-2">
                  <span className="text-[11px] font-bold tracking-[0.16em] text-slate-500">Konfirmasi password baru</span>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((s) => ({ ...s, confirm: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                    disabled={passwordSaving}
                  />
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
                  className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? "Menyimpan..." : "Simpan password"}
                </button>
              </div>
            </form>
          </section>

      </div>
    </div>
  );
}

export default SettingsPage;

