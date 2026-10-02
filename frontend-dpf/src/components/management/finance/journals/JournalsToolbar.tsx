import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faRotateRight,
  faFilter,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import type { AccountingPeriod, JournalStatus } from "@/types/finance";
import { SearchableSelect } from "@/components/management/finance/shared";
import { JournalStatusFilters } from "./JournalStatusFilters";

export interface JournalsToolbarProps {
  searchInput: string;
  onSearchChange: (val: string) => void;
  statusFilter?: JournalStatus | "";
  status?: JournalStatus | "";
  onStatusChange: (val: JournalStatus | "") => void;
  periodFilter?: number | "";
  periodId?: number | "";
  onPeriodChange: (val: number | "") => void;
  periods: AccountingPeriod[];
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  isFilterActive?: boolean;
  onResetFilters: () => void;
  totalItems?: number;
  totalCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const JournalsToolbar: React.FC<JournalsToolbarProps> = ({
  searchInput,
  onSearchChange,
  statusFilter,
  status,
  onStatusChange,
  periodFilter,
  periodId,
  onPeriodChange,
  periods,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  isFilterActive,
  onResetFilters,
  totalItems,
  totalCount,
  onRefresh,
  isRefreshing = false,
}) => {
  const activeStatus = statusFilter !== undefined ? statusFilter : (status || "");
  const activePeriod = periodFilter !== undefined ? periodFilter : (periodId !== undefined ? periodId : "");
  const count = totalItems !== undefined ? totalItems : (totalCount !== undefined ? totalCount : 0);
  const hasActiveFilter =
    isFilterActive !== undefined
      ? isFilterActive
      : Boolean(searchInput || activeStatus || activePeriod !== "" || dateFrom || dateTo);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Row: Search Input + Status Segmented Filters + Refresh Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <FontAwesomeIcon icon={faSearch} className="text-xs" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nomor jurnal, uraian transaksi, atau referensi..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-9 text-xs text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-primary-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          />
          {searchInput && (
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

        {/* Status Filters */}
        <div className="w-full lg:w-auto min-w-0 max-w-full flex items-center justify-between lg:justify-end gap-2">
          <div className="min-w-0 flex-1 lg:flex-initial overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <JournalStatusFilters
              statusFilter={activeStatus}
              onSelectStatus={onStatusChange}
            />
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Segarkan Data"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 shadow-2xs hover:bg-slate-100 transition active:scale-95 disabled:opacity-50 shrink-0"
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className={`text-xs ${isRefreshing ? "animate-spin text-primary-500" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Period Select + Date Range + Reset + Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label htmlFor="journal-period-select" className="text-slate-500 font-semibold text-[11px] whitespace-nowrap">
              Periode:
            </label>
            <div className="w-full sm:w-56">
              <SearchableSelect<number | "">
                id="journal-period-select"
                value={activePeriod}
                onChange={(val) =>
                  onPeriodChange(val === "" ? "" : Number(val))
                }
                options={[
                  { value: "", label: "Semua Periode" },
                  ...periods.map((p) => ({
                    value: p.id,
                    label: p.period_name || p.name || `Periode #${p.id}`,
                    badge: p.status === "open" ? "Aktif" : "Tutup",
                    badgeColor:
                      p.status === "open"
                        ? "bg-brandGreen-500 text-white"
                        : "bg-slate-200 text-slate-700",
                  })),
                ]}
                placeholder="Semua Periode"
                searchPlaceholder="Cari periode..."
                icon={faCalendarAlt}
                size="sm"
              />
            </div>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-[11px] whitespace-nowrap">Dari:</span>
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-primary-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Date To */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-[11px] whitespace-nowrap">Sampai:</span>
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-primary-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-rose-600 font-semibold transition active:scale-95"
            >
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="text-right text-xs text-slate-500 font-medium">
          Ditemukan <strong className="text-slate-900 font-bold">{count}</strong> jurnal
        </div>
      </div>
    </div>
  );
};

export default JournalsToolbar;
