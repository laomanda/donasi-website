import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faLayerGroup,
  faBoxesStacked,
} from "@fortawesome/free-solid-svg-icons";
import { formatFinanceDate } from "@/utils/financeUtils";
import type { FinancialStatementPeriod, WaqfAssetReportSummary } from "@/types/finance";

interface WaqfAssetsReportHeaderProps {
  period: FinancialStatementPeriod | null;
  summary: WaqfAssetReportSummary;
  asOfDate?: string;
}

export const WaqfAssetsReportHeader: React.FC<WaqfAssetsReportHeaderProps> = ({
  period,
  summary,
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
            LAPORAN RINCIAN ASET WAKAF (LRAW)
          </h1>
          <p className="text-xs text-slate-700 font-medium">
            {period
              ? `Periode: ${period.name} (${formatFinanceDate(period.start_date)} s/d ${formatFinanceDate(period.end_date)})`
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
            })}{" "}
            WIB
          </p>
        </div>
      </div>

      {/* 2. Interactive Screen Context Strip */}
      <div className="rounded-2xl border border-slate-200 border-l-4 border-l-slate-900 bg-white p-4 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-700">
            <div className="flex items-center gap-1.5 font-medium">
              <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400" />
              <span>
                {period
                  ? `Periode: ${period.name} (${formatFinanceDate(period.start_date)} s/d ${formatFinanceDate(period.end_date)})`
                  : "Menampilkan akumulasi seluruh periode akuntansi."}
              </span>
            </div>
            {period?.status && (
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  period.status === "open"
                    ? "bg-brandGreen-500 text-white"
                    : "bg-slate-700 text-white"
                }`}
              >
                {period.status === "open" ? "Aktif" : "Ditutup"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-xs shrink-0">
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-slate-400 text-[11px]" />
              <span>Total Unit:</span>
              <strong className="text-slate-900 font-bold">{summary.total_assets}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLayerGroup} className="text-slate-400 text-[11px]" />
              <span>Kategori:</span>
              <strong className="text-slate-900 font-bold">{summary.by_category?.length || 0}</strong>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
