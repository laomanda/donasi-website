import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type Props = {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  perPage: number;
  onPerPageChange: (val: number) => void;
  onReset: () => void;
};

export default function EditorPartnersFilter({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  perPage,
  onPerPageChange,
  onReset,
}: Props) {
  const hasFilters = Boolean(searchQuery.trim() || status);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Cari</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
              </span>
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nama mitra atau URL..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            >
              <option value="">Semua</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Per Halaman</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Atur ulang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
