import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface MitraFilterSectionProps {
  title: string;
  search: {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    label: string;
  };
  dateFilters?: {
    from: {
      value: string;
      onChange: (val: string) => void;
      label: string;
    };
    to: {
      value: string;
      onChange: (val: string) => void;
      label: string;
    };
  };
  onReset?: () => void;
  resetLabel?: string;
  t: (key: string, fallback?: string) => string;
}

export function MitraFilterSection({
  title,
  search,
  dateFilters,
  onReset,
  resetLabel,
  t,
}: MitraFilterSectionProps) {
  const hasValue = search.value.trim() || (dateFilters?.from.value) || (dateFilters?.to.value);

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FontAwesomeIcon icon={faFilter} />
          </div>
          <h3 className="font-heading text-xl font-bold text-slate-900">{title}</h3>
        </div>
        {onReset && hasValue && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-rose-600 transition-colors hover:text-rose-700 hover:underline"
          >
            {resetLabel || t("mitra.reset_filter", "Reset Filter")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="pl-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {search.label}
          </label>
          <div className="group relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-500">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            <input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {dateFilters && (
          <>
            <div className="space-y-2">
              <label className="pl-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {dateFilters.from.label}
              </label>
              <input
                type="date"
                value={dateFilters.from.value}
                onChange={(e) => dateFilters.from.onChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="space-y-2">
              <label className="pl-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {dateFilters.to.label}
              </label>
              <input
                type="date"
                value={dateFilters.to.value}
                onChange={(e) => dateFilters.to.onChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
