import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import type { ReconciliationTabFilter } from "./reconciliationTypes";

interface ReconciliationControlsToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  tabFilter: ReconciliationTabFilter;
  onTabFilterChange: (tab: ReconciliationTabFilter) => void;
  totalChecks: number;
  reviewChecks: number;
  passedChecks: number;
}

export const ReconciliationControlsToolbar: React.FC<ReconciliationControlsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  tabFilter,
  onTabFilterChange,
  totalChecks,
  reviewChecks,
  passedChecks,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <label htmlFor="control-search-input" className="sr-only">
          Cari titik kontrol
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <FontAwesomeIcon icon={faSearch} className="text-xs" />
        </div>
        <input
          id="control-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama kontrol, kode, atau keterangan..."
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

      {/* Segmented Filter Tabs with Truthful Counts */}
      <div
        role="tablist"
        aria-label="Filter titik kontrol rekonsiliasi"
        className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
      >
        {/* Semua */}
        <button
          type="button"
          role="tab"
          aria-selected={tabFilter === "all"}
          onClick={() => onTabFilterChange("all")}
          className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-bold transition ${
            tabFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          Semua ({totalChecks})
        </button>

        {/* Perlu Tinjauan */}
        <button
          type="button"
          role="tab"
          aria-selected={tabFilter === "review"}
          onClick={() => onTabFilterChange("review")}
          className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-bold transition ${
            tabFilter === "review"
              ? "bg-brandWarmOrange-500 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          Perlu Tinjauan ({reviewChecks})
        </button>

        {/* Lulus */}
        <button
          type="button"
          role="tab"
          aria-selected={tabFilter === "passed"}
          onClick={() => onTabFilterChange("passed")}
          className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-bold transition ${
            tabFilter === "passed"
              ? "bg-brandGreen-500 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          Lulus ({passedChecks})
        </button>
      </div>
    </div>
  );
};
