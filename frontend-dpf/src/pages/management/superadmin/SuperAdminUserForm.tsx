import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFloppyDisk,
  faLock,
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
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              Akses
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
              {mode === "create" ? "Tambah Pengguna" : "Ubah Pengguna"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {mode === "create"
                ? "Buat akun baru beserta peran dan status aktif."
                : "Perbarui informasi akun, peran, dan status aktif."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/superadmin/users")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Kembali
            </button>

            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {errors.length ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
          <p className="font-bold">Periksa kembali:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-semibold">
            {errors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <div>
                <p className="text-xs font-bold tracking-wide text-slate-400">Profil</p>
                <p className="font-heading text-lg font-semibold text-slate-900">Informasi Pengguna</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Nama <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Nama lengkap"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Email <span className="text-red-500">*</span>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  placeholder="email@domain.test"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">Telepon</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={loading || saving}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400">
                  Kata sandi{mode === "create" ? <span className="text-red-500"> *</span> : null}
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200">
                  <FontAwesomeIcon icon={faLock} className="text-slate-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    placeholder={mode === "create" ? "Minimal 8 karakter" : "Kosongkan jika tidak diubah"}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    disabled={loading || saving}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <FontAwesomeIcon icon={faUserShield} />
              </span>
              <div>
                <p className="text-xs font-bold tracking-wide text-slate-400">Peran</p>
                <p className="font-heading text-lg font-semibold text-slate-900">Hak akses</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {roles.length ? (
                roles.map((r) => (
                  <label
                    key={r.id}
                    className={[
                      "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
                      selectedRoleSet.has(r.name)
                        ? "border-primary-200 bg-primary-50 text-primary-800"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="truncate">{r.name}</span>
                    <input
                      type="checkbox"
                      checked={selectedRoleSet.has(r.name)}
                      onChange={() => toggleRole(r.name)}
                      className="h-4 w-4"
                      disabled={loading || saving}
                      aria-label={`Pilih peran ${r.name}`}
                    />
                  </label>
                ))
              ) : (
                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                  Daftar peran belum tersedia.
                </div>
              )}
            </div>

            <label className="mt-5 block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Label peran (opsional)</span>
              <input
                value={form.role_label}
                onChange={(e) => setForm((s) => ({ ...s, role_label: e.target.value }))}
                placeholder="Contoh: Admin Cabang, Staff Operasional"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                disabled={loading || saving}
              />
            </label>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold tracking-wide text-slate-400">Status</p>
            <button
              type="button"
              onClick={() => setForm((s) => ({ ...s, is_active: !s.is_active }))}
              disabled={loading || saving}
              className={[
                "mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
                form.is_active
                  ? "border-brandGreen-100 bg-brandGreen-50 text-brandGreen-800"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
              ].join(" ")}
            >
              <span>{form.is_active ? "Akun Aktif" : "Akun Nonaktif"}</span>
              <span className="text-xs font-semibold opacity-80">{form.is_active ? "Aktif" : "Nonaktif"}</span>
            </button>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold tracking-wide text-slate-400">Catatan</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                  <span>Pengguna nonaktif tidak bisa login ke dashboard.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                  <span>Peran menentukan akses menu yang tersedia.</span>
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


