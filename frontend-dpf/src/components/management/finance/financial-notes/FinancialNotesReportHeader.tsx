import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
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

      {/* 2. Interactive Screen Banner (Solid bg-slate-900, No Gradient, No Glass) */}
      <div className="rounded-2xl border-t-4 border-t-slate-800 bg-slate-200 p-5 sm:p-6 text-slate-800 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800 block">
              Yayasan Wakaf Djalaluddin Pane (YWDP)
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-poppins tracking-tight text-slate-800">
              Naskah Pengungkapan Catatan atas Laporan Keuangan
            </h2>
            <p className="text-xs text-slate-800 max-w-xl">
              Informasi pelengkap, kebijakan akuntansi, dan rincian akun sesuai standar pelaporan PSAK 109 & 112.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 rounded-xl bg-none border-t-4 border-primary-600 p-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <FontAwesomeIcon icon={faCalendarDays} className="text-brandGreen-600" />
                <span>Periode:</span>
              </div>
              <p className="font-bold text-slate-800">
                {period ? (period.name || period.period_name || `Periode #${period.id}`) : "Semua Periode"}
              </p>
            </div>

            {period?.status && (
              <span
                className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  period.status === "open"
                    ? "bg-brandGreen-500 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {period.status === "open" ? "Aktif" : "Ditutup"}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
