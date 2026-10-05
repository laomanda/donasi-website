import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { SearchableSelect } from "@/components/management/finance/shared";
import type { AccountingPeriod } from "@/types/finance";

interface BalanceSheetFiltersProps {
  periods: AccountingPeriod[];
  periodId: number | "";
  startDate: string;
  endDate: string;
  isFilterActive: boolean;
  activePeriodName?: string;
  onPeriodChange: (id: number | "") => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

export const BalanceSheetFilters: React.FC<BalanceSheetFiltersProps> = ({
  periods,
  periodId,
  startDate,
  endDate,
  isFilterActive,
  activePeriodName,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs print:hidden space-y-4">
      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Periode Akuntansi */}
        <div>
          <label
            htmlFor="bs-filter-period"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Periode Akuntansi
          </label>
          <SearchableSelect<number | "">
            id="bs-filter-period"
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

        {/* 2. Tanggal Mulai */}
        <div>
          <label
            htmlFor="bs-filter-start-date"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Tanggal Mulai
          </label>
          <input
            id="bs-filter-start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>

        {/* 3. Tanggal Akhir */}
        <div>
          <label
            htmlFor="bs-filter-end-date"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Tanggal Akhir
          </label>
          <input
            id="bs-filter-end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>
      </div>

      {/* Bottom Row: Quick Navigation & Active Period Context & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-500">
          <span className="text-[11px] font-semibold text-slate-400">Navigasi:</span>
          <Link
            to={periodId ? `/finance/trial-balance?period_id=${periodId}` : "/finance/trial-balance"}
            className="font-bold text-slate-700 hover:text-primary-600 transition"
          >
            Neraca Saldo
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to={periodId ? `/finance/general-ledger?period_id=${periodId}` : "/finance/general-ledger"}
            className="font-bold text-slate-700 hover:text-primary-600 transition"
          >
            Buku Besar
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to={periodId ? `/finance/activity-statement?period_id=${periodId}` : "/finance/activity-statement"}
            className="font-bold text-slate-700 hover:text-primary-600 transition"
          >
            Laporan Aktivitas
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activePeriodName && (
            <span className="text-slate-500">
              Periode: <strong className="text-slate-800 font-semibold">{activePeriodName}</strong>
            </span>
          )}

          {isFilterActive && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
            >
              <FontAwesomeIcon icon={faTimes} className="text-[10px] text-slate-500" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetFilters;
