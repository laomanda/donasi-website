import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faTable,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

interface FinancialNotesToolbarProps {
  viewMode: "narrative" | "table";
  periodId: number | "";
  searchQuery: string;
  totalCount: number;
  filteredCount: number;
  onViewModeChange: (mode: "narrative" | "table") => void;
  onClearSearch: () => void;
}

export const FinancialNotesToolbar: React.FC<FinancialNotesToolbarProps> = ({
  viewMode,
  periodId,
  searchQuery,
  totalCount,
  filteredCount,
  onViewModeChange,
  onClearSearch,
}) => {
  const periodParam = periodId !== "" ? `?period_id=${periodId}` : "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
      {/* View Mode Segmented Control */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs self-start">
        <button
          type="button"
          onClick={() => onViewModeChange("narrative")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            viewMode === "narrative"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title="Tampilan Naratif Resmi Laporan"
        >
          <FontAwesomeIcon icon={faAlignLeft} className="text-xs" />
          <span>Tampilan Naratif</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange("table")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            viewMode === "table"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title="Tampilan Tabel Ringkas / Register"
        >
          <FontAwesomeIcon icon={faTable} className="text-xs" />
          <span>Tabel Ringkas</span>
        </button>
      </div>

      {/* Quick Navigation to Related Financial Reports */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-400">Laporan Terkait:</span>
        <Link
          to={`/finance/balance-sheet${periodParam}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <span>Posisi Keuangan</span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-slate-400" />
        </Link>
        <Link
          to={`/finance/activity-statement${periodParam}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <span>Aktivitas</span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-slate-400" />
        </Link>
        <Link
          to={`/finance/waqf-assets${periodParam}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <span>Aset Wakaf</span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-slate-400" />
        </Link>
      </div>

      {/* Search Feedback */}
      {searchQuery && (
        <div className="sm:hidden flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-full">
          <span>
            {filteredCount} dari {totalCount} catatan
          </span>
          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
};
