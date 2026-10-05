import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { formatFinanceDate } from "@/utils/financeUtils";
import type { AccountingPeriod } from "@/types/finance";

interface FinancialNotesReportHeaderProps {
  period: AccountingPeriod | null;
}

export const FinancialNotesReportHeader: React.FC<FinancialNotesReportHeaderProps> = ({
  period,
}) => {
  return (
    <>
      {/* 1. Formal Print-Only Document Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="text-center space-y-1">
          <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
            Yayasan Wakaf Djalaluddin Pane (YWDP)
          </p>
          <h1 className="text-lg font-black text-slate-950 uppercase font-poppins">
            CATATAN ATAS LAPORAN KEUANGAN (CLK)
          </h1>
          <p className="text-xs text-slate-700 font-medium">
            {period
              ? `Periode: ${period.name || period.period_name} (${formatFinanceDate(period.start_date)} s/d ${formatFinanceDate(period.end_date)})`
              : "Semua Periode Akuntansi"}
          </p>
          <p className="text-[10px] text-slate-500 pt-1">
            Dicetak pada:{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* 2. Interactive Screen Banner (Standardized with ActivityStatement & BalanceSheet) */}
      <div className="rounded-2xl border-t-4 border-t-slate-800 bg-slate-200 p-6 text-slate-800 shadow-xs print:rounded-none print:border-b-2 print:border-black print:bg-white print:p-0 print:text-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 print:text-slate-700">
              <FontAwesomeIcon icon={faBuilding} />
              <span>Yayasan Wakaf Djalaluddin Pane (YWDP)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-poppins tracking-tight text-slate-800 print:text-black">
              CATATAN ATAS LAPORAN KEUANGAN
            </h2>
            <p className="text-xs text-slate-800 print:text-slate-600">
              Informasi pelengkap, kebijakan akuntansi, dan rincian akun sesuai standar pelaporan PSAK 109 &amp; 112.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border-t-4 border-t-primary-600 bg-white px-4 py-3 text-xs print:border-none print:bg-white print:p-0">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 print:text-slate-600">
                <FontAwesomeIcon icon={faCalendarDays} className="text-brandGreen-600 print:text-slate-700" />
                <span>Periode Laporan:</span>
              </div>
              <p className="font-bold text-slate-800 print:text-black">
                {period ? (period.name || period.period_name || `Periode #${period.id}`) : "Semua Periode"}
                {period && (period.start_date || period.end_date) && (
                  <span className="font-normal text-slate-800 print:text-slate-600 ml-1.5">
                    ({formatFinanceDate(period.start_date)} s/d {formatFinanceDate(period.end_date)})
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
    </>
  );
};
