import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheck,
  faEye,
  faEyeSlash,
  faFloppyDisk,
  faLock,
  faPhone,
  faUser,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type Role = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  role_label?: string | null;
  roles?: { id?: number; name: string }[];
};

type UserFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  is_active: boolean;
  role_label: string;
  roles: string[];
};

const emptyForm: UserFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  is_active: true,
  role_label: "",
  roles: [],
};

const normalizeErrors = (error: any): string[] => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") {
    const message = error?.response?.data?.message ?? error?.message;
    return message ? [String(message)] : ["Terjadi kesalahan."];
  }

  const messages: string[] = [];
  for (const key of Object.keys(errors)) {
    const value = (errors as any)[key];
    if (Array.isArray(value)) value.forEach((msg) => messages.push(String(msg)));
    else if (value) messages.push(String(value));
  }
  return messages.length ? messages : ["Validasi gagal."];
};

type Mode = "create" | "edit";

export function SuperAdminUserForm({ mode, userId }: { mode: Mode; userId?: number }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const isEditIdValid = typeof userId === "number" && Number.isFinite(userId) && userId > 0;

  const fetchRoles = async () => {
    try {
      const res = await http.get<Role[]>("/superadmin/roles");
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRoles([]);
    }
  };

  const fetchUser = async (id: number) => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await http.get<User>(`/superadmin/users/${id}`);
      const user = res.data;
      const userRoles = Array.isArray(user.roles)
        ? user.roles.map((r) => String(r?.name ?? "").trim()).filter(Boolean)
        : [];
      setForm({
        name: String(user.name ?? ""),
        email: String(user.email ?? ""),
        phone: String(user.phone ?? ""),
        password: "",
        is_active: Boolean(user.is_active),
        role_label: String(user.role_label ?? ""),
        roles: userRoles,
      });
    } catch (err) {
      setErrors(normalizeErrors(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!isEditIdValid) {
      setErrors(["ID pengguna tidak valid."]);
      setLoading(false);
      return;
    }
    void fetchUser(userId as number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isEditIdValid, userId]);

  const selectedRoleSet = useMemo(() => new Set(form.roles), [form.roles]);
  const toggleRole = (name: string) => {
    setForm((prev) => {
      const next = new Set(prev.roles);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { ...prev, roles: Array.from(next) };
    });
  };

  const canSubmit = !loading && !saving;

  const onSubmit = async () => {
    setSaving(true);
    setErrors([]);
    try {
      const trimmedPhone = form.phone.trim();
      if (trimmedPhone !== "" && !/^\d+$/.test(trimmedPhone)) {
        const message = "Nomor telepon hanya boleh berisi angka.";
        setErrors([message]);
        toast.error(message, { title: "Validasi gagal" });
        return;
      }
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: trimmedPhone || null,
        password: form.password || undefined,
        is_active: Boolean(form.is_active),
        role_label: form.role_label.trim() || null,
        roles: form.roles,
      };

      if (mode === "create") {
        await http.post("/superadmin/users", payload);
        toast.success("Pengguna berhasil dibuat.", { title: "Berhasil" });
        navigate("/superadmin/users");
      } else {
        if (!isEditIdValid) throw new Error("ID pengguna tidak valid.");
        await http.put(`/superadmin/users/${userId}`, payload);
        toast.success("Pengguna berhasil diperbarui.", { title: "Berhasil" });
        navigate("/superadmin/users");
      }
    } catch (err) {
      const messages = normalizeErrors(err);
      setErrors(messages);
      toast.error(messages[0] ?? "Gagal menyimpan pengguna.", { title: "Gagal" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  {mode === "create" ? "Registrasi Baru" : "Pembaruan Data"}
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  {mode === "create" ? "Tambah Pengguna" : "Ubah Pengguna"}
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  {mode === "create"
                    ? "Lengkapi formulir di bawah ini untuk mendaftarkan pengguna baru ke dalam sistem."
                    : "Perbarui informasi profil, hak akses peran, dan status akun pengguna."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/superadmin/users")}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>

      {errors.length ? (
        <div className="rounded-[24px] border border-red-100 bg-red-50 p-6 flex items-start gap-4 text-red-700 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 mt-1">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <div>
            <p className="font-bold text-lg">Validasi Gagal</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-medium">
              {errors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
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
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">Nomor Telepon</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                    <FontAwesomeIcon icon={faPhone} />
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value.replace(/\D+/g, "") }))}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-400"
                    disabled={loading || saving}
                  />
                </div>
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

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FontAwesomeIcon icon={faUserShield} className="text-xl" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900">Hak Akses & Peran</h3>
                <p className="text-sm font-medium text-slate-500">Tentukan wewenang pengguna dalam sistem.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {roles.length ? (
                roles.map((r) => {
                  const isSelected = selectedRoleSet.has(r.name);
                  return (
                    <label
                      key={r.id}
                      className={`cursor-pointer group relative flex items-center justify-between rounded-xl border p-4 transition-all ${isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
                        }`}
                    >
                      <span className={`font-bold transition ${isSelected ? "text-emerald-800" : "text-slate-700 group-hover:text-slate-900"}`}>
                        {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                      </span>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"
                        }`}>
                        {isSelected && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRole(r.name)}
                        className="hidden"
                        disabled={loading || saving}
                      />
                    </label>
                  );
                })
              ) : (
                <div className="sm:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                  Tidak ada data peran yang tersedia.
                </div>
              )}
            </div>

            <label className="block mt-8 group">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">Label Peran (Opsional)</span>
              <input
                value={form.role_label}
                onChange={(e) => setForm((s) => ({ ...s, role_label: e.target.value }))}
                placeholder="Contoh: Kepala Cabang, Staff Keuangan..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-400"
                disabled={loading || saving}
              />
            </label>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 sticky top-6">
            <h3 className="font-heading text-lg font-bold text-slate-900 mb-6">Status & Aksi</h3>

            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, is_active: !s.is_active }))}
              disabled={loading || saving}
              className={`w-full flex items-center justify-between rounded-2xl border p-4 transition-all ${form.is_active
                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/20"
                : "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                }`}
            >
              <span className="font-bold text-sm">Status Akun</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-lg">
                {form.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </button>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => void onSubmit()}
                disabled={!canSubmit}
                className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:translate-y-0"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFloppyDisk} className="transition group-hover:scale-110" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Catatan Sistem</p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-xs font-medium text-slate-600 leading-relaxed">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Pengguna yang dinonaktifkan tidak akan dapat masuk ke sistem.
                </li>
                <li className="flex gap-3 text-xs font-medium text-slate-600 leading-relaxed">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Peran menentukan akses ke menu dan fitur administrasi.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminUserForm;


