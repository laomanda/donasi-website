import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faCheckCircle, faUserShield, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
}

interface UserRoleAksesFieldsProps {
  roles: Role[];
  selectedRoles: string[];
  toggleRole: (name: string) => void;
  permissions: Permission[];
  selectedPermissions: string[];
  roleLabel: string;
  setRoleLabel: (val: string) => void;
  loading: boolean;
  saving: boolean;
}

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
  "manage suggestions": "Kelola Saran",
  "manage tags": "Kelola Tag",
  "manage tasks": "Kelola Tugas",
  "manage users": "Kelola Pengguna",
  "view reports": "Lihat Laporan",
};

export function UserRoleAksesFields({
  roles,
  selectedRoles,
  toggleRole,
  permissions,
  selectedPermissions,
  roleLabel,
  setRoleLabel,
  loading,
  saving,
}: UserRoleAksesFieldsProps) {
  const selectedRoleSet = new Set(selectedRoles);
  const selectedPermissionSet = new Set(selectedPermissions);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Role Selection Section */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
        <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
            <FontAwesomeIcon icon={faUserShield} className="text-xl" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-slate-900">Hak Akses & Peran</h3>
            <p className="text-sm font-medium text-slate-500">Pilih jabatan utama untuk menentukan izin akses sistem.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {roles.length ? (
            roles.map((r) => {
              const isSelected = selectedRoleSet.has(r.name);
              return (
                <label
                  key={r.id}
                  className={`cursor-pointer group relative flex items-center justify-between rounded-2xl border p-5 transition-all duration-300 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/5"
                      : "border-slate-100 bg-slate-50/50 hover:border-emerald-300 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isSelected ? "border-emerald-500 bg-white shadow-inner" : "border-slate-300"
                    }`}>
                      {isSelected && <div className="h-3 w-3 rounded-full bg-emerald-500 animate-scale-in" />}
                    </div>
                    <span className={`text-base font-bold transition-colors ${isSelected ? "text-emerald-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                      {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="user_role"
                    checked={isSelected}
                    onChange={() => toggleRole(r.name)}
                    className="hidden"
                    disabled={loading || saving}
                  />
                  {isSelected && (
                    <div className="absolute top-0 right-0 p-3">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-lg opacity-20" />
                    </div>
                  )}
                </label>
              );
            })
          ) : (
            <div className="sm:col-span-2 rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-bold text-slate-400 italic">Memuat daftar peran...</p>
            </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
            <label className="block group">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-emerald-600 transition ml-1">
                    Label Jabatan (Opsional)
                </span>
                <div className="relative mt-3">
                    <input
                        value={roleLabel}
                        onChange={(e) => setRoleLabel(e.target.value)}
                        placeholder="Misal: Koordinator Wilayah, Admin Keuangan..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-base font-bold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 shadow-sm"
                        disabled={loading || saving}
                    />
                </div>
                <p className="text-[11px] font-medium text-slate-400 mt-2 ml-1 italic">
                    * Label ini akan muncul di profil pengguna sebagai keterangan jabatan.
                </p>
            </label>
        </div>
      </div>

      {/* Permissions Transparency Section */}
      {selectedRoles.length > 0 && !selectedRoleSet.has("mitra") && (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-slate-900">Izin Terintegrasi</h3>
              <p className="text-sm font-medium text-slate-500">Berikut adalah daftar izin akses yang diberikan oleh Role terpilih.</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-slate-50 p-5 border border-slate-100 flex items-start gap-4">
            <div className="mt-1 text-slate-400">
              <FontAwesomeIcon icon={faInfoCircle} className="text-sm" />
            </div>
            <p className="text-xs font-bold leading-relaxed text-slate-500 uppercase tracking-wider">
              Mode Inherited: Izin di bawah bersifat otomatis (read-only) karena dikelola melalui modul Manajemen Role.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {permissions
              .filter((p) => p.name !== "manage settings")
              .map((p) => {
                const isSelected = selectedPermissionSet.has(p.name);
                const label = PERMISSION_LABELS[p.name] || p.name;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900 opacity-100"
                        : "border-slate-100 bg-slate-50/30 text-slate-300 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-tight truncate pr-2">
                        {label}
                    </span>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 bg-white"
                    }`}>
                      {isSelected && <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
