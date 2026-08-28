import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShieldHalved, 
  faSpinner, 
  faCheck, 
  faArrowLeft,
  faFloppyDisk,
  faCircleCheck,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../../lib/http";
import { useToast } from "../../../ui/ToastProvider";

type Permission = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  name: string;
  permissions?: Permission[];
};

type RoleFormProps = {
  mode: "create" | "edit";
  roleId?: number;
};

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
  const [saving, setSaving] = useState(false);

  const fetchPermissions = async () => {
    try {
      const res = await http.get<Permission[]>("/superadmin/permissions");
      setAllPermissions(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Gagal memuat daftar permission.", { title: "Gagal" });
    }
  };

  const fetchRole = async (id: number) => {
    try {
      const res = await http.get<Role>(`/superadmin/roles/${id}`);
      setName(res.data.name);
      setSelectedPermissions(res.data.permissions?.map(p => p.name) || []);
    } catch {
      toast.error("Gagal memuat data role.", { title: "Gagal" });
      navigate("/superadmin/roles");
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
      toast.error(err.response?.data?.message || "Gagal menyimpan role.", { title: "Gagal" });
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
            
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 divide-y divide-slate-200">
              <div className="pb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 text-center">Rekapitulasi Akses</h4>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-5xl font-black text-emerald-600 tabular-nums">{selectedPermissions.length}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Izin Terpilih</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{ width: `${(selectedPermissions.length / (allPermissions.length || 1)) * 100}%` }}
                  />
                </div>
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
