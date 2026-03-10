import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type Props = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  group: string;
  onGroupChange: (group: string) => void;
  groupSuggestions: string[];
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  onReset: () => void;
  loading: boolean;
  pageLabel: string;
};

export default function EditorOrganizationMembersFilter({
  searchQuery,
  onSearchChange,
  group,
  onGroupChange,
  groupSuggestions,
  perPage,
  onPerPageChange,
  onReset,
  loading,
  pageLabel,
}: Props) {
  const hasFilters = Boolean(searchQuery.trim() || group.trim());

  return (
    <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-300 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Cari</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
              </span>
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nama atau jabatan..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Grup</span>
            <input
              value={group}
              onChange={(e) => onGroupChange(e.target.value)}
              placeholder="Mis. pengurus"
              list="org-group-options"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
            />
            <datalist id="org-group-options">
              {groupSuggestions.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <span className="text-slate-400">
              <FontAwesomeIcon icon={faFilter} />
            </span>
            <span>Per halaman</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none"
            >
              {[8, 12, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={loading}
            >
              Atur ulang
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-600">{pageLabel}</p>
        <p className="text-xs font-semibold text-slate-500">Klik nama untuk detail.</p>
      </div>
    </div>
  );
}
