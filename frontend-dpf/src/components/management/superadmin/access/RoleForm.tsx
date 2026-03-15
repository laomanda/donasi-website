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

const PERMISSION_LABELS: Record<string, string> = {
  "manage allocations": "Kelola Alokasi",
  "manage articles": "Kelola Artikel",
  "manage bank_accounts": "Kelola Rekening Bank",
  "manage banners": "Kelola Banner",
  "manage consultations": "Kelola Konsultasi",
  "manage donations": "Kelola Donasi",
  "manage organization": "Kelola Organisasi",
  "manage partners": "Kelola Mitra",
  "manage pickup_requests": "Kelola Jemput Wakaf",
  "manage programs": "Kelola Program",
  "manage settings": "Kelola Pengaturan",
  "manage suggestions": "Kelola Saran",
  "manage tags": "Kelola Tag",
  "manage tasks": "Kelola Tugas",
  "manage users": "Kelola Pengguna",
  "view reports": "Lihat Laporan",
};

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
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  {mode === "create" ? "Konfigurasi Baru" : "Pembaruan Role"}
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  {mode === "create" ? "Tambah Role" : "Ubah Role"}
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        Total {allPermissions.length} Modul
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPermissions.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.name);
                const label = PERMISSION_LABELS[perm.name] || perm.name;
                return (
                  <button
                    key={perm.id}
                    type="button"
                    onClick={() => togglePermission(perm.name)}
                    disabled={saving}
                    className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/5 shadow-md shadow-emerald-500/5"
                        : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/10 hover:shadow-lg hover:shadow-slate-200/50"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                      isSelected ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                    }`}>
                      <FontAwesomeIcon icon={isSelected ? faCircleCheck : faCheck} className={isSelected ? "text-lg" : "text-sm"} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-sm font-bold capitalize truncate leading-tight mb-1">{label}</span>
                        <span className="text-[10px] text-slate-500 font-medium line-clamp-1 italic text-emerald-700/60 font-semibold uppercase tracking-wider">Akses Penuh Modul</span>
                    </div>
                    {isSelected && (
                        <div className="absolute top-0 right-0 p-1 opacity-10">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-4xl -rotate-12" />
                        </div>
                    )}
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
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 text-center">Rekapibilitas Akses</h4>
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
