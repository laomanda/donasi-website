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

interface UsersMobileListProps {
  items: User[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
  };
}

export function UsersMobileList({ items, loading, selection }: UsersMobileListProps) {
  const navigate = useNavigate();

  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 animate-pulse">
            <div className="h-6 w-1/3 bg-slate-100 rounded mb-4" />
            <div className="h-4 w-2/3 bg-slate-100 rounded" />
          </div>
        ))
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-sm font-semibold text-slate-500">Belum ada data.</div>
      ) : (
        items.map((user) => {
          const updated = user.updated_at ?? user.created_at;
          return (
            <div
              key={user.id}
              className="p-6 transition active:bg-slate-50"
              onClick={() => navigate(`/superadmin/users/${user.id}/edit`)}
            >
              <div className="flex items-start gap-4">
                <span onClick={(e) => e.stopPropagation()} className="pt-1">
                  <input
                    type="checkbox"
                    checked={selection.isSelected(user.id)}
                    onChange={() => selection.toggle(user.id)}
                    className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-bold text-slate-900 line-clamp-1">{user.name}</p>
                      <p className="text-sm text-slate-500 line-clamp-1">{user.email}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getUserStatusTone(Boolean(user.is_active))}`}>
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="inline-flex max-w-[12rem] truncate rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                      {getRoleLabel(user)}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {formatDateTime(updated)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
