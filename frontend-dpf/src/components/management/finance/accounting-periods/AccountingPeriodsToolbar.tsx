import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

export type PeriodStatusFilterType = "all" | "open" | "closed";

interface AccountingPeriodsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: PeriodStatusFilterType;
  onStatusFilterChange: (status: PeriodStatusFilterType) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const AccountingPeriodsToolbar: React.FC<AccountingPeriodsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <label htmlFor="period-search-input" className="sr-only">
          Cari nama periode atau tahun
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <FontAwesomeIcon icon={faSearch} className="text-xs" />
        </div>
        <input
          id="period-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama periode atau tahun..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            title="Hapus pencarian"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
          </button>
        )}
      </div>

      {/* Segmented Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline-block">
          Status:
        </span>
        <div
          role="radiogroup"
          aria-label="Filter status periode"
          className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
        >
          {/* Semua */}
          <button
            type="button"
            role="radio"
            aria-checked={statusFilter === "all"}
            onClick={() => onStatusFilterChange("all")}
            className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-bold transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            Semua
          </button>

          {/* Aktif */}
          <button
            type="button"
            role="radio"
            aria-checked={statusFilter === "open"}
            onClick={() => onStatusFilterChange("open")}
            className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-bold transition ${
              statusFilter === "open"
                ? "bg-brandGreen-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            Aktif
          </button>

          {/* Ditutup */}
          <button
            type="button"
            role="radio"
            aria-checked={statusFilter === "closed"}
            onClick={() => onStatusFilterChange("closed")}
            className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-bold transition ${
              statusFilter === "closed"
                ? "bg-slate-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            Ditutup
          </button>
        </div>

        {/* Reset Filter Button with solid Primary color */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex min-h-[32px] items-center gap-1.5 rounded-xl bg-primary-500 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-primary-600 active:scale-95 transition"
            title="Reset Filter"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
