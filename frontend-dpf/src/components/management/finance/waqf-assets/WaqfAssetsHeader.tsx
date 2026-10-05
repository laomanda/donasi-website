import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faFileExcel,
  faPrint,
  faBuildingColumns,
} from "@fortawesome/free-solid-svg-icons";

interface WaqfAssetsHeaderProps {
  totalAssetsCount?: number;
  hasData: boolean;
  refreshing: boolean;
  exporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onPrint: () => void;
}

export const WaqfAssetsHeader: React.FC<WaqfAssetsHeaderProps> = ({
  totalAssetsCount,
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
            Aset Wakaf
          </h1>
          {hasData && totalAssetsCount !== undefined && totalAssetsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-xs bg-brandBlueTeal-500 text-white">
              <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
              <span>{totalAssetsCount} Aset Terdaftar</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Kelola dan tinjau register aset wakaf berdasarkan kategori, nilai, kondisi, dan status aset.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:self-center">
        {/* Cetak */}
        <button
          type="button"
          onClick={onPrint}
          disabled={!hasData}
          title="Cetak Laporan Rincian Aset Wakaf"
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
          title="Segarkan Data Aset Wakaf"
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
