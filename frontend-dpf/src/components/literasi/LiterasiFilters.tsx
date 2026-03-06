import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMagnifyingGlass, 
  faXmark, 
  faSliders 
} from "@fortawesome/free-solid-svg-icons";

interface LiterasiFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  isFilterExpanded: boolean;
  setIsFilterExpanded: (value: boolean) => void;
  categories: string[];
  totalResults: number;
  t: (key: string, fallback?: string) => string;
}

export function LiterasiFilters({
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
  isFilterExpanded,
  setIsFilterExpanded,
  categories,
  totalResults,
  t
}: LiterasiFiltersProps) {
  
  const getFilterClass = (isActive: boolean) =>
    isActive
      ? "bg-primary-600 text-white shadow-md shadow-primary-200 border-transparent"
      : "bg-white text-slate-600 border-slate-200 hover:border-primary-200 hover:text-primary-700";

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/40 md:flex-row md:items-center transition-shadow hover:shadow-2xl hover:shadow-slate-200/50">
        
        {/* Search Input */}
        <div className="flex flex-1 items-center gap-3 px-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("literasi.search.placeholder")}
            className="h-12 w-full bg-transparent text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="h-px w-full bg-slate-100 md:h-12 md:w-px" />

        {/* Filter Toggle */}
        <div className="flex items-center gap-3 px-3 md:w-auto md:shrink-0 md:justify-end">
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all md:flex-none
              ${isFilterExpanded
                ? "bg-primary-50 border-primary-200 text-primary-700"
                : "bg-slate-900 border-transparent text-white shadow-lg hover:bg-slate-800"}`}
          >
            <FontAwesomeIcon icon={faSliders} />
            <span>{t("literasi.filter.toggle")}</span>
          </button>
        </div>
      </div>

      {/* EXPANDABLE CATEGORIES */}
      <div className={`overflow-hidden transition-all duration-300 ease-out ${isFilterExpanded ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500">{t("literasi.filter.categories")}</p>
            <span className="text-xs font-medium text-slate-500">{totalResults} {t("literasi.filter.results")}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveCategory(null)} className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(activeCategory === null)}`}>
              {t("literasi.filter.all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(activeCategory === cat)}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
