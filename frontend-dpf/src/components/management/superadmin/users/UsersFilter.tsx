import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faMagnifyingGlass,
  faRotateRight,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

interface Role {
  id: number;
  name: string;
}

interface UsersFilterProps {
  q: string;
  setQ: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  perPage: number;
  setPerPage: (val: number) => void;
  roles: Role[];
  onReset: () => void;
}

export function UsersFilter({
  q,
  setQ,
  role,
  setRole,
  perPage,
  setPerPage,
  roles,
  onReset,
}: UsersFilterProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FontAwesomeIcon icon={faFilter} />
          </div>
          Filter & Pencarian
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <label className="block group">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">Pencarian</span>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </label>

        <label className="block group">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">Peran</span>
          <div className="mt-2 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-10 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Semua Peran</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </label>

        <label className="block group">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400 group-focus-within:text-emerald-600 transition">Per halaman</span>
          <div className="mt-2 relative">
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {n} Baris
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
