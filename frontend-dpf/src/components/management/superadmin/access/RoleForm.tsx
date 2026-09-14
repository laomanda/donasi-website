import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShieldHalved, 
  faSpinner, 
  faCheck, 
  faArrowLeft,
  faFloppyDisk,
  faCircleCheck,
  faInfoCircle,
  faUsers,
  faUserGroup,
  faMagnifyingGlass,
  faEnvelope,
  faPhone,
  faArrowUpRightFromSquare
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../../lib/http";
import { useToast } from "../../../ui/ToastProvider";
import { resolveStorageUrl } from "../../../../lib/urls";
import { formatDateTime } from "../shared/SuperAdminUtils";

type Permission = {
  id: number;
  name: string;
};

type RoleUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar_path?: string | null;
  is_active: boolean | number;
  role_label?: string | null;
  created_at?: string | null;
};

type Role = {
  id: number;
  name: string;
  permissions?: Permission[];
  users?: RoleUser[];
};

type RoleFormProps = {
  mode: "create" | "edit";
  roleId?: number;
};

function getInitials(name: string): string {
  const trimmed = String(name ?? "").trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "U";
}

const PERMISSION_DETAILS: Record<string, { label: string; desc: string }> = {
  "manage allocations": { label: "Kelola Alokasi", desc: "Penyaluran dana & alokasi ke mitra" },
  "manage_allocations": { label: "Kelola Alokasi", desc: "Penyaluran dana & alokasi ke mitra" },
  "manage articles": { label: "Kelola Artikel", desc: "Edukasi & artikel literasi wakaf" },
  "manage_articles": { label: "Kelola Artikel", desc: "Edukasi & artikel literasi wakaf" },
  "manage bank_accounts": { label: "Kelola Rekening Bank", desc: "Rekening bank resmi donasi & wakaf" },
  "manage bank accounts": { label: "Kelola Rekening Bank", desc: "Rekening bank resmi donasi & wakaf" },
  "manage banners": { label: "Kelola Banner", desc: "Banner promosi & slideshow beranda" },
  "manage_banners": { label: "Kelola Banner", desc: "Banner promosi & slideshow beranda" },
  "manage consultations": { label: "Kelola Konsultasi", desc: "Layanan konsultasi wakaf masuk" },
  "manage_consultations": { label: "Kelola Konsultasi", desc: "Layanan konsultasi wakaf masuk" },
  "manage donations": { label: "Kelola Donasi", desc: "Data transaksi donasi & konfirmasi" },
  "manage_donations": { label: "Kelola Donasi", desc: "Data transaksi donasi & konfirmasi" },
  "manage gallery dpf": { label: "Kelola Galeri DPF", desc: "Dokumentasi foto kegiatan DPF" },
  "manage gallery_dpf": { label: "Kelola Galeri DPF", desc: "Dokumentasi foto kegiatan DPF" },
  "manage gallery mitra": { label: "Kelola Galeri Mitra", desc: "Dokumentasi foto kegiatan mitra" },
  "manage gallery_mitra": { label: "Kelola Galeri Mitra", desc: "Dokumentasi foto kegiatan mitra" },
  "manage organization": { label: "Kelola Organisasi", desc: "Struktur kepengurusan & anggota" },
  "manage_organization": { label: "Kelola Organisasi", desc: "Struktur kepengurusan & anggota" },
  "manage partners": { label: "Kelola Mitra", desc: "Pendaftaran, verifikasi, & data mitra" },
  "manage_partners": { label: "Kelola Mitra", desc: "Pendaftaran, verifikasi, & data mitra" },
  "manage pickup_requests": { label: "Kelola Jemput Wakaf", desc: "Permintaan layanan jemput wakaf" },
  "manage pickup requests": { label: "Kelola Jemput Wakaf", desc: "Permintaan layanan jemput wakaf" },
  "manage produk mitra": { label: "Kelola Produk Mitra", desc: "Katalog & etalase produk mitra" },
  "manage produk_mitra": { label: "Kelola Produk Mitra", desc: "Katalog & etalase produk mitra" },
  "manage mitra_products": { label: "Kelola Produk Mitra", desc: "Katalog & etalase produk mitra" },
  "manage programs": { label: "Kelola Program", desc: "Program, campaign, & target wakaf" },
  "manage_programs": { label: "Kelola Program", desc: "Program, campaign, & target wakaf" },
  "manage role permissions": { label: "Konfigurasi Hak Akses", desc: "Pengaturan role & hak akses pengguna" },
  "manage_role_permissions": { label: "Konfigurasi Hak Akses", desc: "Pengaturan role & hak akses pengguna" },
  "manage suggestions": { label: "Kelola Saran", desc: "Kotak saran & aspirasi publik" },
  "manage_suggestions": { label: "Kelola Saran", desc: "Kotak saran & aspirasi publik" },
  "manage tags": { label: "Kelola Tag", desc: "Tagar footer & filter kategori" },
  "manage_tags": { label: "Kelola Tag", desc: "Tagar footer & filter kategori" },
  "manage tasks": { label: "Kelola Tugas", desc: "Pencatatan tugas & operasional" },
  "manage_tasks": { label: "Kelola Tugas", desc: "Pencatatan tugas & operasional" },
  "manage users": { label: "Kelola Pengguna", desc: "Akun pengurus & manajemen user" },
  "manage_users": { label: "Kelola Pengguna", desc: "Akun pengurus & manajemen user" },
  "view reports": { label: "Lihat Laporan", desc: "Laporan donasi, kas, & keuangan" },
  "view_reports": { label: "Lihat Laporan", desc: "Laporan donasi, kas, & keuangan" },
};

function getPermissionMeta(name: string): { label: string; desc: string } {
  const normalized = name.toLowerCase().trim();
  if (PERMISSION_DETAILS[normalized]) {
    return PERMISSION_DETAILS[normalized];
  }
  const cleanWithSpaces = normalized.replace(/_/g, " ");
  if (PERMISSION_DETAILS[cleanWithSpaces]) {
    return PERMISSION_DETAILS[cleanWithSpaces];
  }
  // Fallback formatting
  let label = cleanWithSpaces;
  if (cleanWithSpaces.startsWith("manage ")) {
    label = "Kelola " + cleanWithSpaces.slice(7).replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (cleanWithSpaces.startsWith("view ")) {
    label = "Lihat " + cleanWithSpaces.slice(5).replace(/\b\w/g, (c) => c.toUpperCase());
  } else {
    label = cleanWithSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return { label, desc: "Akses penuh modul " + label.toLowerCase() };
}

export default function RoleForm({ mode, roleId }: RoleFormProps) {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [roleUsers, setRoleUsers] = useState<RoleUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingRole, setLoadingRole] = useState(mode === "edit");

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return roleUsers;
    const q = userSearch.toLowerCase();
    return roleUsers.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      (u.phone && u.phone.toLowerCase().includes(q))
    );
  }, [roleUsers, userSearch]);

  const fetchPermissions = async () => {
    try {
      const res = await http.get<Permission[]>("/superadmin/permissions");
      setAllPermissions(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Gagal memuat daftar permission.", { title: "Gagal" });
    }
  };

  const fetchRole = async (id: number) => {
    setLoadingRole(true);
    try {
      const res = await http.get<Role>(`/superadmin/roles/${id}`);
      setName(res.data.name);
      setSelectedPermissions(res.data.permissions?.map(p => p.name) || []);
      setRoleUsers(Array.isArray(res.data.users) ? res.data.users : []);
    } catch {
      toast.error("Gagal memuat data role.", { title: "Gagal" });
      navigate("/superadmin/roles");
    } finally {
      setLoadingRole(false);
    }
  };

  useEffect(() => {
    void fetchPermissions();
    if (mode === "edit" && roleId) {
      void fetchRole(roleId);
    }
  }, [mode, roleId]);

  const togglePermission = (permName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permName) 
        ? prev.filter(p => p !== permName)
        : [...prev, permName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, permissions: selectedPermissions };
      if (mode === "create") {
        await http.post("/superadmin/roles", data);
        toast.success("Role baru berhasil ditambahkan.", { title: "Berhasil" });
      } else {
        await http.put(`/superadmin/roles/${roleId}`, data);
        toast.success("Role berhasil diperbarui.", { title: "Berhasil" });
      }
      navigate("/superadmin/roles");
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      let msg = err.response?.data?.message || "Gagal menyimpan role.";
      if (errs && typeof errs === "object") {
        const firstErr = Object.values(errs).flat()[0];
        if (firstErr) msg = String(firstErr);
      }
      toast.error(msg, { title: "Validasi Gagal" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  {mode === "create" ? "Tambah Role" : "Ubah Role"}
                </h1>
                <p className="mt-2 max-w-2xl text-base sm:text-lg font-medium text-emerald-100/90">
                  {mode === "create" 
                    ? "Tentukan nama role dan pilih izin akses yang sesuai untuk jabatan baru." 
                    : "Sesuaikan hak akses dan identitas untuk jabatan yang sudah terdaftar."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/superadmin/roles")}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Role Identity Card */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FontAwesomeIcon icon={faInfoCircle} />
              </div>
              Identitas Role
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Nama Role
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Manager Marketing"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-base font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none placeholder:text-slate-400 shadow-sm"
                  required
                  disabled={saving}
                />
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2 ml-1 italic">
                * Pastikan nama role unik dan mendeskripsikan tanggung jawab jabatan tersebut.
              </p>
            </div>
          </div>

          {/* Role Users Card */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <h3 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FontAwesomeIcon icon={faUserGroup} />
                </div>
                Pengguna dengan Role Ini
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                    mode === "create"
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : roleUsers.length > 0
                      ? "bg-brandGreen-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {mode === "create"
                    ? "Role Baru (0 Pengguna)"
                    : loadingRole
                    ? "Memuat..."
                    : `${roleUsers.length} Pengguna Terdaftar`}
                </span>
              </div>
            </div>

            {mode === "create" ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">Penugasan Pengguna</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                    Role ini sedang dibuat dan belum memiliki pengguna. Setelah Anda menyimpan role baru ini, Anda dapat menugaskan pengguna ke role ini melalui menu{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/superadmin/users")}
                      className="font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Kelola Pengguna
                    </button>.
                  </p>
                </div>
              </div>
            ) : loadingRole ? (
              <div className="space-y-3 py-2">
                <div className="h-16 w-full rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-16 w-full rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            ) : roleUsers.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl mb-3 shadow-inner">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Belum Ada Pengguna</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Saat ini belum ada pengguna yang ditugaskan ke role ini. Anda dapat menetapkan role ini saat membuat atau mengubah data pengguna di menu Kelola Pengguna.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/superadmin/users")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
                >
                  <FontAwesomeIcon icon={faUsers} />
                  Buka Kelola Pengguna
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search box if more than 2 users */}
                {roleUsers.length > 2 && (
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                    />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder={`Cari dari ${roleUsers.length} pengguna (nama, email, telepon)...`}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition shadow-sm"
                    />
                  </div>
                )}

                {/* Users List Container */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/40 pr-1">
                  {filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-xs font-semibold text-slate-500">
                      Tidak ada pengguna yang sesuai dengan kata kunci &quot;{userSearch}&quot;.
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const isActive = Boolean(user.is_active);
                      const avatarUrl = user.avatar_path ? resolveStorageUrl(user.avatar_path) : null;
                      return (
                        <div
                          key={user.id}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors hover:bg-emerald-50/40"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={user.name}
                                className="h-11 w-11 shrink-0 rounded-2xl object-cover ring-2 ring-slate-200 group-hover:ring-emerald-400 transition shadow-sm"
                              />
                            ) : (
                              <div className="h-11 w-11 shrink-0 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-black text-sm">
                                {getInitials(user.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                                  {user.name}
                                </p>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                    isActive
                                      ? "bg-brandGreen-600 text-white"
                                      : "bg-red-600 text-white"
                                  }`}
                                >
                                  {isActive ? "Aktif" : "Nonaktif"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faEnvelope} className="text-[10px] text-slate-400" />
                                  {user.email}
                                </span>
                                {user.phone && (
                                  <span className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faPhone} className="text-[10px] text-slate-400" />
                                    {user.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            {user.created_at && (
                              <span className="text-[11px] font-medium text-slate-400 hidden md:inline-block">
                                Bergabung {formatDateTime(user.created_at)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => window.open(`/superadmin/users/${user.id}/edit`, "_blank")}
                              title="Buka data pengguna di tab baru"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
                            >
                              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                              Detail
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Permissions Selection Card */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-8 mb-8">
              <h3 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-transform group-hover:rotate-12">
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                Hak Akses (Permissions)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  Total {allPermissions.filter((p) => p.name !== "manage settings").length} Modul
                </span>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {allPermissions
                .filter((p) => p.name !== "manage settings")
                .map((p) => {
                  const isSelected = selectedPermissions.includes(p.name);
                  const meta = getPermissionMeta(p.name);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePermission(p.name)}
                      disabled={saving}
                      className={`group flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${
                        isSelected
                          ? "bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-md"
                      }`}
                    >
                      <div className={`mt-0.5 h-9 w-9 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                      }`}>
                        <FontAwesomeIcon icon={isSelected ? faCircleCheck : faCheck} className={isSelected ? "text-base" : "text-xs"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-snug">
                          {meta.label}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">
                          {meta.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sticky top-6">
            <h3 className="font-heading text-lg font-bold text-slate-900 mb-6">Status & Konfigurasi</h3>
            
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 divide-y divide-slate-200 space-y-4">
              <div className="pb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 text-center">Rekapitulasi Akses</h4>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-5xl font-black text-emerald-600 tabular-nums">{selectedPermissions.length}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Izin Terpilih</span>
                </div>
                <div className="mt-4 w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{ width: `${(selectedPermissions.length / (allPermissions.length || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Users Stat in Sidebar */}
              <div className="pt-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 text-center">Pengguna Role</h4>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-3xl font-black text-slate-800 tabular-nums">
                    {mode === "create" ? "0" : roleUsers.length}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {mode === "create" ? "Pengguna Baru" : "Pengguna Terdaftar"}
                  </span>
                </div>

                {roleUsers.length > 0 && (
                  <div className="mt-3 flex items-center justify-center -space-x-2 overflow-hidden py-1">
                    {roleUsers.slice(0, 5).map((u) => {
                      const av = u.avatar_path ? resolveStorageUrl(u.avatar_path) : null;
                      return av ? (
                        <img
                          key={u.id}
                          src={av}
                          alt={u.name}
                          title={u.name}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                        />
                      ) : (
                        <div
                          key={u.id}
                          title={u.name}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-[10px] font-black text-white ring-2 ring-white shadow-sm"
                        >
                          {getInitials(u.name)}
                        </div>
                      );
                    })}
                    {roleUsers.length > 5 && (
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-600 ring-2 ring-white shadow-sm">
                        +{roleUsers.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="submit"
                disabled={saving}
                className="group w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 py-5 text-base font-bold text-white shadow-xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFloppyDisk} className="text-lg transition-transform group-hover:scale-110" />
                    {mode === "create" ? "Tambah Role" : "Simpan Perubahan"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/superadmin/roles")}
                disabled={saving}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-slate-100 px-8 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
              >
                Batal
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Informasi Penting</p>
              <div className="space-y-4">
                <div className="flex gap-4 group">
                  <div className="mt-1 h-5 w-5 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white shadow-sm">
                    <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                    Setiap role baru akan secara otomatis memiliki akses dasar ke dashboard.
                  </p>
                </div>
                <div className="flex gap-4 group">
                  <div className="mt-1 h-5 w-5 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white shadow-sm">
                    <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                    Perubahan pada role yang sedang digunakan akan berdampak langsung pada user terkait.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
