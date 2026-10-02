import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faRotateRight,
  faFolderTree,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import type { AccountType } from "@/types/finance";

interface AccountsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: AccountType | "";
  onTypeFilterChange: (type: AccountType | "") => void;
  statusFilter: "" | "active" | "inactive";
  onStatusFilterChange: (status: "" | "active" | "inactive") => void;
  viewMode: "tree" | "flat";
  onViewModeChange: (mode: "tree" | "flat") => void;
  displayedCount: number;
  totalCount: number;
  isFiltered: boolean;
  onResetFilters: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const AccountsToolbar: React.FC<AccountsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  displayedCount,
  totalCount,
  isFiltered,
  onResetFilters,
  onExpandAll,
  onCollapseAll,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* Primary Row: Search & Filters & View Switch */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Search Input - Full width on mobile, flexible on desktop */}
        <div className="relative flex-1 min-w-0">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode atau nama akun..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 transition focus:border-primary-500 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          )}
        </div>

        {/* Filters and View Toggle Wrapper */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Filter Jenis */}
          <div className="w-1/2 sm:w-40 flex-1 sm:flex-none">
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as AccountType | "")}
              aria-label="Filter jenis akun"
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 transition focus:border-primary-500 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Semua Jenis</option>
              <option value="asset">Aset</option>
              <option value="liability">Liabilitas</option>
              <option value="net_asset">Aset Neto</option>
              <option value="revenue">Penerimaan</option>
              <option value="expense">Beban</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="w-1/2 sm:w-32 flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as "" | "active" | "inactive")
              }
              aria-label="Filter status akun"
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 transition focus:border-primary-500 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-100 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => onViewModeChange("tree")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "tree"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FontAwesomeIcon icon={faFolderTree} className="text-xs" />
              <span>Hierarki</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("flat")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "flat"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FontAwesomeIcon icon={faTable} className="text-xs" />
              <span>Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: Counters, Expand/Collapse & Reset Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Menampilkan{" "}
            <strong className="text-slate-900 font-mono font-bold">
              {displayedCount}
            </strong>{" "}
            dari <strong className="text-slate-900 font-mono font-bold">{totalCount}</strong>{" "}
            akun
          </span>

          {isFiltered && (
            <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold tracking-wide">
              Filter Aktif
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "tree" && (
            <>
              <button
                type="button"
                onClick={onExpandAll}
                className="text-slate-700 hover:text-primary-600 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition"
              >
                Buka Semua
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onCollapseAll}
                className="text-slate-700 hover:text-primary-600 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition"
              >
                Tutup Semua
              </button>
            </>
          )}

          {isFiltered && (
            <>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onResetFilters}
                className="text-rose-600 hover:bg-rose-600 hover:text-white font-bold px-2 py-1 rounded transition"
              >
                Reset Filter
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Muat ulang data"
            aria-label="Muat ulang data akun"
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200 transition"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={isRefreshing ? "animate-spin text-xs text-primary-500" : "text-xs"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsToolbar;
