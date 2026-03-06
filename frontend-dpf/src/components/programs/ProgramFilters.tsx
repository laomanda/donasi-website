import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark, faSliders } from "@fortawesome/free-solid-svg-icons";

interface ProgramFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  filteredCount: number;
  isFilterExpanded: boolean;
  setIsFilterExpanded: (val: boolean) => void;
  categories: string[];
  activeCategory: string | null;
  setActiveCategory: (val: string | null) => void;
  statusOptions: { value: string; label: string }[];
  activeStatus: string | null;
  setActiveStatus: (val: string | null) => void;
  t: (key: string, fallback?: string) => string;
}

export function ProgramFilters({
  search,
  setSearch,
  filteredCount,
  isFilterExpanded,
  setIsFilterExpanded,
  categories,
  activeCategory,
  setActiveCategory,
  statusOptions,
  activeStatus,
  setActiveStatus,
  t,
}: ProgramFiltersProps) {
  const getFilterClass = (isActive: boolean) =>
    isActive
      ? "bg-brandGreen-600 text-white shadow-md shadow-brandGreen-200 border-transparent"
      : "bg-white text-slate-600 border-slate-200 hover:border-brandGreen-200 hover:text-brandGreen-700";

  return (
    <div className="mx-auto mt-10 mb-16 max-w-4xl px-4">
      <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-soft md:flex-row md:items-center">
        {/* Search Input Area */}
        <div className="flex flex-1 items-center gap-3 px-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("program.list.search.placeholder")}
            className="h-12 w-full bg-transparent text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="h-px w-full bg-slate-100 md:h-12 md:w-px" />

        {/* Filter Actions */}
        <div className="flex items-center gap-3 px-3 md:w-auto md:shrink-0 md:justify-end">
          <span className="text-sm font-semibold text-slate-500 whitespace-nowrap hidden sm:inline-block">
            {filteredCount} {t("program.list.results")}
          </span>
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-all md:flex-none
               ${isFilterExpanded
                 ? "bg-brandGreen-50 border-brandGreen-200 text-brandGreen-700"
                 : "bg-slate-900 border-transparent text-white shadow-lg hover:bg-slate-800"}`}
          >
            <FontAwesomeIcon icon={faSliders} />
            <span>{t("program.list.filter.toggle")}</span>
          </button>
        </div>
      </div>

      {/* EXPANDABLE FILTER PANEL */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isFilterExpanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold text-slate-500">
                  {t("program.list.filter.categories")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(
                      activeCategory === null
                    )}`}
                  >
                    {t("program.list.filter.allCategories")}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setActiveCategory(cat === activeCategory ? null : cat)
                      }
                      className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(
                        activeCategory === cat
                      )}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <p className="mb-3 text-xs font-semibold text-slate-500">
                {t("program.list.filter.status")}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveStatus(null)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(
                    activeStatus === null
                  )}`}
                >
                  {t("program.list.filter.allStatus")}
                </button>
                {statusOptions.map((stat) => (
                  <button
                    key={stat.value}
                    onClick={() =>
                      setActiveStatus(stat.value === activeStatus ? null : stat.value)
                    }
                    className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(
                      activeStatus === stat.value
                    )}`}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
