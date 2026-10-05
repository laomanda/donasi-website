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
import { FINANCIAL_NOTE_CATEGORIES } from "@/config/finance/financialNoteCategories";

interface FinancialNotesFiltersProps {
  periods: AccountingPeriod[];
  periodId: number | "";
  category: string;
  status: string;
  searchQuery: string;
  isFilterActive: boolean;
  onPeriodChange: (id: number | "") => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
}

export const FinancialNotesFilters: React.FC<FinancialNotesFiltersProps> = ({
  periods,
  periodId,
  category,
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
      {/* 4-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Periode Akuntansi */}
        <div>
          <label
            htmlFor="fn-filter-period"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Periode Akuntansi
          </label>
          <SearchableSelect<number | "">
            id="fn-filter-period"
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
                      ? "bg-rose-600 text-white"
                      : "bg-brandGreen-500 text-white",
                };
              }),
            ]}
            placeholder="-- Semua Periode --"
            searchPlaceholder="Ketik nama atau tahun periode..."
            icon={faCalendarAlt}
          />
        </div>

        {/* 2. Kategori Pos CLK */}
        <div>
          <label
            htmlFor="fn-filter-category"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Kategori CLK
          </label>
          <SearchableSelect<string>
            id="fn-filter-category"
            value={category}
            onChange={(val) => onCategoryChange(val)}
            options={[
              { value: "", label: "-- Semua Kategori --" },
              ...FINANCIAL_NOTE_CATEGORIES.map((c) => ({
                value: c.key,
                label: c.label,
              })),
            ]}
            placeholder="-- Semua Kategori --"
            searchPlaceholder="Cari kategori catatan..."
            icon={faLayerGroup}
          />
        </div>

        {/* 3. Status Publikasi */}
        <div>
          <label
            htmlFor="fn-filter-status"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Status Publikasi
          </label>
          <SearchableSelect<string>
            id="fn-filter-status"
            value={status}
            onChange={(val) => onStatusChange(val)}
            options={[
              { value: "", label: "Semua Status" },
              {
                value: "published",
                label: "Dipublikasikan",
                badge: "Dipublikasikan",
                badgeColor: "bg-brandGreen-500 text-white",
              },
              {
                value: "draft",
                label: "Draft",
                badge: "Draft",
                badgeColor: "bg-brandWarmOrange-500 text-white",
              },
            ]}
            placeholder="Semua Status"
            searchPlaceholder="Pilih status..."
            icon={faCircleCheck}
          />
        </div>

        {/* 4. Pencarian Cepat */}
        <div>
          <label
            htmlFor="fn-filter-search"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Cari Catatan
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-xs" />
            </div>
            <input
              id="fn-filter-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Judul, isi, penyusun..."
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
