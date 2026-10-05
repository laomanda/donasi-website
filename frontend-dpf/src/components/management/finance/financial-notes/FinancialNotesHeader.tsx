import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRotateRight,
  faFileExcel,
  faPrint,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

interface FinancialNotesHeaderProps {
  totalNotesCount?: number;
  canManage: boolean;
  refreshing: boolean;
  exporting: boolean;
  createUrl: string;
  onRefresh: () => void;
  onExport: () => void;
  onPrint: () => void;
}

export const FinancialNotesHeader: React.FC<FinancialNotesHeaderProps> = ({
  totalNotesCount,
  canManage,
  refreshing,
  exporting,
  createUrl,
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
            Catatan atas Laporan Keuangan
          </h1>
          {totalNotesCount !== undefined && totalNotesCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-xs bg-brandPurple-500 text-white">
              <FontAwesomeIcon icon={faFileLines} className="text-xs" />
              <span>{totalNotesCount} Catatan</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Kelola catatan pengungkapan dan informasi penjelas laporan keuangan berdasarkan periode akuntansi.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:self-center">
        {/* Tambah Catatan (Primary) */}
        {canManage && (
          <Link
            to={createUrl}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-primary-600 active:scale-95"
            title="Tambah Catatan Pengungkapan Baru"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span>Tambah Catatan</span>
          </Link>
        )}

        {/* Cetak */}
        <button
          type="button"
          onClick={onPrint}
          title="Cetak Catatan atas Laporan Keuangan"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
        >
          <FontAwesomeIcon icon={faPrint} className="text-slate-600" />
          <span>Cetak</span>
        </button>

        {/* Segarkan */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Segarkan Data Catatan"
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
          disabled={exporting}
          title="Ekspor Catatan ke Excel"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faFileExcel} className="text-brandGreen-600" />
          <span>{exporting ? "Mengunduh..." : "Ekspor Excel"}</span>
        </button>
      </div>
    </div>
  );
};
