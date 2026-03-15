import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPenToSquare, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../shared/SuperAdminUtils";

type Role = {
  id: number;
  name: string;
  users_count?: number;
  updated_at?: string | null;
  created_at?: string | null;
};

interface RolesTableProps {
  items: Role[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
    toggleAll: (ids: number[]) => void;
  };
  pageIds: number[];
}

export function RolesTable({ items, loading, selection, pageIds }: RolesTableProps) {
  const navigate = useNavigate();

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="w-10 px-6 py-5">
              <input
                type="checkbox"
                aria-label="Pilih semua role"
                checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                onChange={() => selection.toggleAll(pageIds)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </th>
            <th className="px-6 py-5">Nama Role</th>
            <th className="px-6 py-5 text-center">Jumlah User</th>
            <th className="px-6 py-5 text-center">Terakhir Diperbarui</th>
            <th className="px-6 py-5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white italic-action-fix">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-5"><div className="h-4 w-4 rounded bg-slate-100" /></td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100" />
                    <div className="h-4 w-40 rounded bg-slate-100" />
                  </div>
                </td>
                <td className="px-6 py-5 text-center"><div className="mx-auto h-6 w-16 rounded-full bg-slate-100" /></td>
                <td className="px-6 py-5 text-center"><div className="mx-auto h-4 w-32 rounded bg-slate-100" /></td>
                <td className="px-6 py-5"><div className="ml-auto h-10 w-24 rounded-2xl bg-slate-100" /></td>
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-16 w-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </div>
                  <p>Belum ada role yang ditemukan.</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((role) => {
              const updated = role.updated_at ?? role.created_at;
              const isSelected = selection.isSelected(role.id);
              return (
                <tr
                  key={role.id}
                  onClick={() => navigate(`/superadmin/roles/${role.id}/edit`)}
                  className={`group cursor-pointer transition border-l-4 ${
                    isSelected 
                        ? "bg-emerald-50/30 border-emerald-500" 
                        : "hover:bg-slate-50 border-transparent hover:border-emerald-500 shadow-sm"
                  }`}
                >
                  <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => selection.toggle(role.id)}
                      aria-label={`Pilih role ${role.name}`}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                        isSelected ? "bg-white text-emerald-600 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10" : "bg-emerald-50 text-emerald-600"
                      }`}>
                         <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
                      </div>
                      <p className="truncate text-base font-bold text-slate-900 group-hover:text-emerald-700 transition capitalize">{role.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 group-hover:bg-white group-hover:shadow-sm group-hover:ring-1 group-hover:ring-slate-200 transition">
                      {role.users_count || 0} User
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center text-sm font-semibold text-slate-600">
                    {formatDateTime(updated)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/superadmin/roles/${role.id}/edit`);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-600 hover:ring-emerald-200"
                        title="Ubah"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
