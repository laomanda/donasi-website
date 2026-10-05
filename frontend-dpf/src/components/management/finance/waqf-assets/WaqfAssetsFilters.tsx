import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCalendarAlt,
  faLayerGroup,
  faCircleCheck,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { SearchableSelect } from "@/components/management/finance/shared";
import type { AccountingPeriod } from "@/types/finance";
import type { WaqfCategoryOption } from "@/utils/finance/waqfAssetDisplay";

interface WaqfAssetsFiltersProps {
  periods: AccountingPeriod[];
  categories: WaqfCategoryOption[];
  periodId: number | "";
  categoryId: number | "";
  status: string;
  searchQuery: string;
  isFilterActive: boolean;
  onPeriodChange: (id: number | "") => void;
  onCategoryChange: (id: number | "") => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
}

export const WaqfAssetsFilters: React.FC<WaqfAssetsFiltersProps> = ({
  periods,
  categories,
  periodId,
  categoryId,
  status,
  searchQuery,
  isFilterActive,
  onPeriodChange,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs print:hidden space-y-4">
      {/* 4-Column Responsive Grid for Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Periode Akuntansi */}
        <div>
          <label
            htmlFor="wa-filter-period"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Periode Akuntansi
          </label>
          <SearchableSelect<number | "">
            id="wa-filter-period"
            value={periodId}
            onChange={(val) => onPeriodChange(val === "" ? "" : Number(val))}
            options={[
              { value: "", label: "-- Semua Periode --" },
              ...periods.map((p) => {
                const pName = p.name || p.period_name || `Periode #${p.id}`;
                return {
                  value: p.id,
                  label: pName,
                  badge: p.status === "closed" ? "Tertutup" : "Aktif",
                  badgeColor:
                    p.status === "closed"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-brandGreen-500 text-white",
                };
              }),
            ]}
            placeholder="-- Semua Periode --"
            searchPlaceholder="Ketik nama atau tahun periode..."
            icon={faCalendarAlt}
          />
        </div>

        {/* 2. Kategori Aset */}
        <div>
          <label
            htmlFor="wa-filter-category"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Kategori Aset
          </label>
          <SearchableSelect<number | "">
            id="wa-filter-category"
            value={categoryId}
            onChange={(val) => onCategoryChange(val === "" ? "" : Number(val))}
            options={[
              { value: "", label: "-- Semua Kategori --" },
              ...categories.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
            placeholder="-- Semua Kategori --"
            searchPlaceholder="Cari kategori aset..."
            icon={faLayerGroup}
          />
        </div>

        {/* 3. Status Aset */}
        <div>
          <label
            htmlFor="wa-filter-status"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Status Aset
          </label>
          <SearchableSelect<string>
            id="wa-filter-status"
            value={status}
            onChange={(val) => onStatusChange(val)}
            options={[
              { value: "", label: "Semua Status" },
              { value: "active", label: "Aktif", badge: "Aktif", badgeColor: "bg-brandGreen-500 text-white" },
              { value: "disposed", label: "Dihapuskan", badge: "Dihapuskan", badgeColor: "bg-slate-700 text-white" },
              { value: "transferred", label: "Dimutasi", badge: "Dimutasi", badgeColor: "bg-brandPurple-500 text-white" },
            ]}
            placeholder="Semua Status"
            searchPlaceholder="Pilih status aset..."
            icon={faCircleCheck}
          />
        </div>

        {/* 4. Pencarian Cepat */}
        <div>
          <label
            htmlFor="wa-filter-search"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Cari Aset
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-xs" />
            </div>
            <input
              id="wa-filter-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Kode, nama, wakif, lokasi..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Hapus pencarian"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Action Toolbar */}
      {isFilterActive && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-block h-2 w-2 rounded-full bg-primary-500" />
            <span>Filter sedang aktif</span>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
          >
            <FontAwesomeIcon icon={faTimes} className="text-slate-400 text-[10px]" />
            <span>Reset Filter</span>
          </button>
        </div>
      )}
    </div>
  );
};
