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
  "manage_allocations": "Kelola Alokasi",
  "manage articles": "Kelola Artikel",
  "manage_articles": "Kelola Artikel",
  "manage bank_accounts": "Kelola Rekening Bank",
  "manage bank accounts": "Kelola Rekening Bank",
  "manage banners": "Kelola Banner",
  "manage_banners": "Kelola Banner",
  "manage consultations": "Kelola Konsultasi",
  "manage_consultations": "Kelola Konsultasi",
  "manage donations": "Kelola Donasi",
  "manage_donations": "Kelola Donasi",
  "manage gallery dpf": "Kelola Galeri DPF",
  "manage gallery_dpf": "Kelola Galeri DPF",
  "manage gallery mitra": "Kelola Galeri Mitra",
  "manage gallery_mitra": "Kelola Galeri Mitra",
  "manage organization": "Kelola Organisasi",
  "manage_organization": "Kelola Organisasi",
  "manage partners": "Kelola Mitra",
  "manage_partners": "Kelola Mitra",
  "manage pickup_requests": "Kelola Jemput Wakaf",
  "manage pickup requests": "Kelola Jemput Wakaf",
  "manage produk mitra": "Kelola Produk Mitra",
  "manage produk_mitra": "Kelola Produk Mitra",
  "manage mitra_products": "Kelola Produk Mitra",
  "manage programs": "Kelola Program",
  "manage_programs": "Kelola Program",
  "manage role permissions": "Konfigurasi Hak Akses",
  "manage_role_permissions": "Konfigurasi Hak Akses",
  "manage suggestions": "Kelola Saran",
  "manage_suggestions": "Kelola Saran",
  "manage tags": "Kelola Tag",
  "manage_tags": "Kelola Tag",
  "manage tasks": "Kelola Tugas",
  "manage_tasks": "Kelola Tugas",
  "manage users": "Kelola Pengguna",
  "manage_users": "Kelola Pengguna",
  "view reports": "Lihat Laporan",
  "view_reports": "Lihat Laporan",
};

function getPermissionLabel(name: string): string {
  const normalized = name.toLowerCase().trim();
  if (PERMISSION_LABELS[normalized]) return PERMISSION_LABELS[normalized];
  const clean = normalized.replace(/_/g, " ");
  if (PERMISSION_LABELS[clean]) return PERMISSION_LABELS[clean];
  if (clean.startsWith("manage ")) {
    return "Kelola " + clean.slice(7).replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (clean.startsWith("view ")) {
    return "Lihat " + clean.slice(5).replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
}

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
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
            <FontAwesomeIcon icon={faUserShield} className="text-xl" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-slate-900">Peran & Tanggung Jawab</h3>
            <p className="text-sm font-medium text-slate-500">Tentukan role (jabatan) akun ini untuk menentukan batasan akses menu sistem.</p>
          </div>
        </div>

        {/* Custom Role Label (Display Title) */}
        <div className="mb-8">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Label Jabatan Khusus (Opsional)
          </label>
          <input
            type="text"
            value={roleLabel}
            onChange={(e) => setRoleLabel(e.target.value)}
            placeholder="Contoh: Manajer Fundraising, Staff IT, dll"
            disabled={saving || loading}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Teks ini yang akan tampil sebagai status jabatan user pada dashboard dan kartu profil.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            Pilih Role Sistem
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((r) => {
              const isSelected = selectedRoleSet.has(r.name);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRole(r.name)}
                  disabled={saving || loading}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      isSelected ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" : "bg-slate-100 text-slate-400"
                    }`}>
                      <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize text-slate-900">{r.name}</p>
                      <p className="text-[11px] text-slate-400">Hak akses modul bawaan</p>
                    </div>
                  </div>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                    isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 bg-white"
                  }`}>
                    {isSelected && <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inherited Permissions Section */}
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
                const label = getPermissionLabel(p.name);

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900 opacity-100"
                        : "border-slate-100 bg-slate-50/30 text-slate-300 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 pr-2 leading-tight">
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
