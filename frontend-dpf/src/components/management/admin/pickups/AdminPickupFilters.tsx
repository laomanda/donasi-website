import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

interface AdminPickupFiltersProps {
  q: string;
  setQ: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  perPage: number;
  setPerPage: (val: number) => void;
  total: number;
  loading: boolean;
  onReset: () => void;
}

export default function AdminPickupFilters({
  q,
  setQ,
  status,
  setStatus,
  perPage,
  setPerPage,
  total,
  loading,
  onReset,
}: AdminPickupFiltersProps) {
  const hasFilters = Boolean(q.trim() || status);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FontAwesomeIcon icon={faFilter} />
          </div>
          Filter & Pencarian
        </h3>
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Pencarian</span>
          <div className="relative group">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nama atau No. WhatsApp..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Status</span>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Semua status</option>
              <option value="baru">Baru</option>
              <option value="dijadwalkan">Dijadwalkan</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <FontAwesomeIcon icon={faFilter} className="text-xs" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Per Halaman</span>
            <div className="relative">
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value={10}>10 Data</option>
                <option value={15}>15 Data</option>
                <option value={25}>25 Data</option>
                <option value={50}>50 Data</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
              </div>
            </div>
          </div>
          
          <div className="flex items-end justify-end pb-1">
            {loading ? (
              <div className="h-4 w-24 animate-pulse bg-slate-100 rounded" />
            ) : total > 0 ? (
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-2 rounded-lg">
                Total: {total} Data
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
