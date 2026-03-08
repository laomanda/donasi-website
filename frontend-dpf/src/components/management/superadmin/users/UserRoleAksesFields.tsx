import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faUserShield } from "@fortawesome/free-solid-svg-icons";

interface Role {
  id: number;
  name: string;
}

interface UserRoleAksesFieldsProps {
  roles: Role[];
  selectedRoles: string[];
  toggleRole: (name: string) => void;
  roleLabel: string;
  setRoleLabel: (val: string) => void;
  loading: boolean;
  saving: boolean;
}

export function UserRoleAksesFields({
  roles,
  selectedRoles,
  toggleRole,
  roleLabel,
  setRoleLabel,
  loading,
  saving,
}: UserRoleAksesFieldsProps) {
  const selectedRoleSet = new Set(selectedRoles);

  return (
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
          value={roleLabel}
          onChange={(e) => setRoleLabel(e.target.value)}
          placeholder="Contoh: Kepala Cabang, Staff Keuangan..."
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-400"
          disabled={loading || saving}
        />
      </label>
    </div>
  );
}
