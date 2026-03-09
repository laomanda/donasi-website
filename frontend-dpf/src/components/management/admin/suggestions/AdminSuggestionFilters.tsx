import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface AdminSuggestionFiltersProps {
  q: string;
  category: string;
  status: string;
  perPage: number;
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export const AdminSuggestionFilters = ({
  q,
  category,
  status,
  perPage,
  onFilterChange,
  onReset,
  hasFilters,
}: AdminSuggestionFiltersProps) => {
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Pencarian</span>
          <div className="relative mt-1.5 group">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              value={q}
              onChange={(e) => onFilterChange("q", e.target.value)}
              placeholder="Nama, no telp, atau isi pesan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Kategori</span>
          <div className="relative mt-1.5">
            <select
              value={category}
              onChange={(e) => onFilterChange("category", e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Semua kategori</option>
              <option value="suggestion">Saran</option>
              <option value="bug">Laporan Bug</option>
              <option value="appreciation">Apresiasi</option>
              <option value="other">Lainnya</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
            </div>
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Status</span>
          <div className="relative mt-1.5">
            <select
              value={status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Semua Status</option>
              <option value="baru">Baru</option>
              <option value="dibalas">Dibalas</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
            </div>
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Per Halaman</span>
          <div className="relative mt-1.5">
            <select
              value={perPage}
              onChange={(e) => onFilterChange("perPage", Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value={10}>10 Data</option>
              <option value={20}>20 Data</option>
              <option value={30}>30 Data</option>
              <option value={50}>50 Data</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default AdminSuggestionFilters;
