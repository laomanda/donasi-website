import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FinanceStatusBadge } from "@/components/management/finance/shared";
import type { AccountingPeriod } from "@/types/finance";

interface FinanceDashboardHeaderProps {
  selectedPeriod: AccountingPeriod | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export const FinanceDashboardHeader: React.FC<FinanceDashboardHeaderProps> = ({
  selectedPeriod,
  refreshing,
  onRefresh,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Ringkasan Keuangan
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
          Sistem pembukuan berpasangan dan kontrol keuangan terverifikasi YWDP.
        </p>
        {selectedPeriod && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <FinanceStatusBadge
              status={selectedPeriod.status === "open" ? "open" : "closed"}
              label={
                selectedPeriod.status === "open"
                  ? "Periode Berjalan: Terbuka"
                  : "Periode: Telah Ditutup"
              }
            />
            <span className="text-xs font-bold text-slate-600">
              {selectedPeriod.period_name || selectedPeriod.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
          aria-label="Segarkan Data Dashboard"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={refreshing ? "animate-spin text-slate-500" : "text-slate-600"}
          />
          Segarkan
        </button>
        <Link
          to="/finance/journals"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
          Jurnal Umum
        </Link>
      </div>
    </header>
  );
};

export default FinanceDashboardHeader;
