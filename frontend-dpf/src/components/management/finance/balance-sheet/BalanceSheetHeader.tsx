import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faFileExcel,
  faPrint,
  faCheckCircle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

interface BalanceSheetHeaderProps {
  isBalanced?: boolean;
  hasData: boolean;
  refreshing: boolean;
  exporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onPrint: () => void;
}

export const BalanceSheetHeader: React.FC<BalanceSheetHeaderProps> = ({
  isBalanced,
  hasData,
  refreshing,
  exporting,
  onRefresh,
  onExport,
  onPrint,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      {/* Title & Description */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-poppins">
            Laporan Posisi Keuangan
          </h1>
          {hasData && isBalanced !== undefined && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-xs ${
                isBalanced
                  ? "bg-brandGreen-500 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              <FontAwesomeIcon
                icon={isBalanced ? faCheckCircle : faTriangleExclamation}
                className="text-xs"
              />
              <span>{isBalanced ? "Neraca Seimbang" : "Neraca Tidak Seimbang"}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Ringkasan aset, liabilitas, dan aset neto berdasarkan jurnal yang telah diposting.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:self-center">
        {/* Cetak */}
        <button
          type="button"
          onClick={onPrint}
          disabled={!hasData}
          title="Cetak Laporan Posisi Keuangan"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPrint} className="text-slate-600" />
          <span>Cetak</span>
        </button>

        {/* Segarkan */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Segarkan Data Laporan"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={refreshing ? "animate-spin text-slate-400" : "text-slate-600"}
          />
          <span>Segarkan</span>
        </button>

        {/* Ekspor Excel */}
        <button
          type="button"
          onClick={onExport}
          disabled={exporting || !hasData}
          title="Ekspor Laporan ke Excel"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-primary-600 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faFileExcel} className="text-white" />
          <span>{exporting ? "Mengunduh..." : "Ekspor Excel"}</span>
        </button>
      </div>
    </div>
  );
};

export default BalanceSheetHeader;
