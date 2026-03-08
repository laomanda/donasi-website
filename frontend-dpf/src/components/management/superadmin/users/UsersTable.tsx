import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { formatDateTime, getUserStatusTone, getRoleLabel } from "../shared/SuperAdminUtils";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  role_label?: string | null;
  roles?: { id?: number; name: string }[];
  updated_at?: string | null;
  created_at?: string | null;
}

interface UsersTableProps {
  items: User[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
    toggleAll: (ids: number[]) => void;
  };
  pageIds: number[];
}

export function UsersTable({ items, loading, selection, pageIds }: UsersTableProps) {
  const navigate = useNavigate();

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="w-10 px-6 py-5">
              <input
                type="checkbox"
                aria-label="Pilih semua pengguna"
                checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                onChange={() => selection.toggleAll(pageIds)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </th>
            <th className="px-6 py-5">Pengguna</th>
            <th className="px-6 py-5">Peran</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-6 py-5">Diperbarui</th>
            <th className="px-6 py-5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-5"><div className="h-4 w-4 rounded bg-slate-100" /></td>
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="h-3 w-56 rounded bg-slate-100" />
                  </div>
                </td>
                <td className="px-6 py-5"><div className="h-6 w-28 rounded-full bg-slate-100" /></td>
                <td className="px-6 py-5"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                <td className="px-6 py-5"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                <td className="px-6 py-5"><div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" /></td>
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-16 w-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </div>
                  <p>Belum ada pengguna yang ditemukan.</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((user) => {
              const updated = user.updated_at ?? user.created_at;
              return (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/superadmin/users/${user.id}/edit`)}
                  className="group cursor-pointer transition hover:bg-slate-50 border-l-4 border-transparent hover:border-emerald-500"
                >
                  <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selection.isSelected(user.id)}
                      onChange={() => selection.toggle(user.id)}
                      aria-label={`Pilih pengguna ${user.name}`}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">{user.name}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex max-w-[18rem] truncate rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 group-hover:bg-white group-hover:shadow-sm group-hover:ring-1 group-hover:ring-slate-200 transition">
                      {getRoleLabel(user)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getUserStatusTone(Boolean(user.is_active))}`}>
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDateTime(updated)}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/superadmin/users/${user.id}/edit`);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-600 hover:ring-emerald-200"
                        aria-label="Ubah"
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
