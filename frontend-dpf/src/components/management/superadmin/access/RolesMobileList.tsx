import { useNavigate } from "react-router-dom";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDateTime } from "../shared/SuperAdminUtils";

type Role = {
  id: number;
  name: string;
  users_count?: number;
  updated_at?: string | null;
  created_at?: string | null;
};

interface RolesMobileListProps {
  items: Role[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
  };
}

export function RolesMobileList({ items, loading, selection }: RolesMobileListProps) {
  const navigate = useNavigate();

  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 animate-pulse space-y-4">
            <div className="flex items-center gap-4">
                 <div className="h-6 w-6 rounded bg-slate-100" />
                 <div className="h-6 w-1/3 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-2/3 bg-slate-100 rounded pl-10" />
          </div>
        ))
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-sm font-semibold text-slate-500 font-italic">Belum ada data.</div>
      ) : (
        items.map((role) => {
          const updated = role.updated_at ?? role.created_at;
          const isSelected = selection.isSelected(role.id);
          return (
            <div
              key={role.id}
              className={`p-6 transition active:scale-[0.98] ${isSelected ? "bg-emerald-50/40" : "bg-white"}`}
              onClick={() => navigate(`/superadmin/roles/${role.id}/edit`)}
            >
              <div className="flex items-start gap-4">
                <span onClick={(e) => e.stopPropagation()} className="pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => selection.toggle(role.id)}
                    className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                             <FontAwesomeIcon icon={faShieldHalved} />
                        </div>
                        <p className="text-base font-bold text-slate-900 line-clamp-1 capitalize">{role.name}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                      {role.users_count || 0} User
                    </span>
                    <span className="text-xs font-medium text-slate-400 italic">
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
