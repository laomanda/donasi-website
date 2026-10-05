import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { formatFinanceDate } from "@/utils/financeUtils";
import type { FinancialStatementPeriod } from "@/types/finance";

interface BalanceSheetReportHeaderProps {
  period: FinancialStatementPeriod | null;
  startDate: string | null;
  endDate: string | null;
}

export const BalanceSheetReportHeader: React.FC<BalanceSheetReportHeaderProps> = ({
  period,
  startDate,
  endDate,
}) => {
  return (
    <div className="rounded-2xl border-t-4 border-t-slate-800 bg-slate-200 p-6 text-white shadow-xs print:rounded-none print:border-b-2 print:border-black print:bg-white print:p-0 print:text-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Organization & Report Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 print:text-slate-700">
            <FontAwesomeIcon icon={faBuilding} />
            <span>Yayasan Wakaf Djalaluddin Pane (YWDP)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-poppins tracking-tight text-slate-800 print:text-black">
            LAPORAN POSISI KEUANGAN
          </h2>
          <p className="text-xs text-slate-800 print:text-slate-600">
            Ringkasan posisi aset, liabilitas, dan aset neto berdasarkan seluruh jurnal yang telah diposting.
          </p>
        </div>

        {/* Period Context & Status */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border-t-4 border-t-primary-600 bg-white px-4 py-3 text-xs print:border-none print:bg-white print:p-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 print:text-slate-600">
              <FontAwesomeIcon icon={faCalendarDays} className="text-brandGreen-600 print:text-slate-700" />
              <span>Periode Laporan:</span>
            </div>
            <p className="font-bold text-slate-800 print:text-black">
              {period?.name || "Semua Periode"}
              {(startDate || endDate) && (
                <span className="font-normal text-slate-800 print:text-slate-600 ml-1.5">
                  ({formatFinanceDate(startDate)} s/d {formatFinanceDate(endDate)})
                </span>
              )}
            </p>
          </div>

          {period?.status && (
            <span
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                period.status === "open"
                  ? "bg-brandGreen-500 text-white print:border print:border-black print:text-black"
                  : "bg-slate-700 text-slate-200 print:border print:border-black print:text-black"
              }`}
            >
              {period.status === "open" ? "Periode Terbuka" : "Periode Ditutup"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetReportHeader;
