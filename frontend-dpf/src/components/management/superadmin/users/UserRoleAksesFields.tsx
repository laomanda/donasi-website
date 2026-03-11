import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faCheckCircle, faUserShield, faMagic, faUserEdit } from "@fortawesome/free-solid-svg-icons";

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
  togglePermission: (name: string) => void;
  accessMode: "template" | "custom";
  setAccessMode: (mode: "template" | "custom") => void;
  roleLabel: string;
  setRoleLabel: (val: string) => void;
  loading: boolean;
  saving: boolean;
}

export function UserRoleAksesFields({
  roles,
  selectedRoles,
  toggleRole,
  permissions,
  selectedPermissions,
  togglePermission,
  accessMode,
  setAccessMode,
  roleLabel,
  setRoleLabel,
  loading,
  saving,
}: UserRoleAksesFieldsProps) {
  const selectedRoleSet = new Set(selectedRoles);
  const selectedPermissionSet = new Set(selectedPermissions);
  const isTemplate = accessMode === "template";

  return (
    <div className="space-y-8">
      {/* Identity & Role Section */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FontAwesomeIcon icon={faUserShield} className="text-xl" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-slate-900">Identitas & Template Peran</h3>
            <p className="text-sm font-medium text-slate-500">Pilih template dasar untuk akun ini (Hanya untuk pengelompokan).</p>
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
                    ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${isSelected ? "border-indigo-500 bg-white" : "border-slate-300"
                      }`}>
                      {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                    </div>
                    <span className={`font-bold transition ${isSelected ? "text-indigo-800" : "text-slate-700 group-hover:text-slate-900"}`}>
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
            value={roleLabel}
            onChange={(e) => setRoleLabel(e.target.value)}
            placeholder="Contoh: Kepala Cabang, Staff Keuangan..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-400"
            disabled={loading || saving}
          />
        </label>
      </div>

      {/* Access Mode Toggle & Permission Section */}
      {!selectedRoleSet.has("mitra") && (
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900">Akses Halaman Spesifik</h3>
                <p className="text-sm font-medium text-slate-500">Tentukan bagaimana izin halaman dikelola.</p>
              </div>
            </div>

            {/* Access Mode Toggle */}
            <div className="flex shrink-0 items-center rounded-2xl bg-slate-100 p-1.5 self-start">
              <button
                type="button"
                onClick={() => setAccessMode("template")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-xl ${isTemplate 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
                disabled={loading || saving}
              >
                <FontAwesomeIcon icon={faMagic} className="text-[10px]" />
                Template
              </button>
              <button
                type="button"
                onClick={() => setAccessMode("custom")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-xl ${!isTemplate 
                  ? "bg-white text-amber-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
                disabled={loading || saving}
              >
                <FontAwesomeIcon icon={faUserEdit} className="text-[10px]" />
                Custom
              </button>
            </div>
          </div>

          {isTemplate && (
            <div className="mb-8 rounded-2xl bg-indigo-50 p-4 border border-indigo-100 flex items-start gap-3">
              <div className="mt-0.5 text-indigo-500">
                <FontAwesomeIcon icon={faMagic} className="text-sm" />
              </div>
              <p className="text-sm font-medium text-indigo-800 leading-relaxed">
                <span className="font-bold">Mode Template:</span> Izin halaman akan otomatis menyesuaikan dengan peran yang dipilih di atas. Anda tidak perlu memilihnya secara manual.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {permissions.length ? (
              permissions
                .filter((p) => p.name !== "manage settings")
                .map((p) => {
                  const isSelected = selectedPermissionSet.has(p.name);

                  // Map permission names to Indonesian labels
                  const labelMap: Record<string, string> = {
                    "manage articles": "Artikel",
                    "manage programs": "Program",
                    "manage donations": "Donasi",
                    "manage pickup_requests": "Jemput Wakaf",
                    "manage consultations": "Konsultasi",
                    "manage partners": "Mitra",
                    "manage organization": "Struktur Organisasi",
                    "manage settings": "Pengaturan",
                    "view reports": "Laporan",
                    "manage banners": "Banner",
                    "manage tags": "Tag",
                    "manage bank_accounts": "Rekening",
                    "manage allocations": "Alokasi",
                    "manage suggestions": "Saran Wakaf",
                    "manage tasks": "Tugas Editor",
                    "manage users": "Pengguna",
                  };

                  const capitalizedLabel = labelMap[p.name] || p.name;

                  return (
                    <label
                      key={p.id}
                      className={`cursor-pointer group relative flex items-center justify-between rounded-xl border p-4 transition-all ${
                        isSelected
                          ? isTemplate 
                            ? "border-indigo-200 bg-indigo-50/50" 
                            : "border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10"
                          : "border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50"
                      } ${isTemplate ? "cursor-default opacity-80" : ""}`}
                    >
                      <span className={`font-bold transition ${
                        isSelected 
                          ? isTemplate ? "text-indigo-800" : "text-amber-800" 
                          : "text-slate-700 group-hover:text-slate-900"
                      }`}>
                        {capitalizedLabel}
                      </span>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                        isSelected 
                          ? isTemplate ? "bg-indigo-400 border-indigo-400 text-white" : "bg-amber-500 border-amber-500 text-white" 
                          : "border-slate-300 bg-white"
                      }`}>
                        {isSelected && <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isTemplate && togglePermission(p.name)}
                        className="hidden"
                        disabled={loading || saving || isTemplate}
                      />
                    </label>
                  );
                })
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">Memuat daftar izin...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
