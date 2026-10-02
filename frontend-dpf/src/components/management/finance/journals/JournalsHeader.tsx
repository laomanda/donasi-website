import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRotateRight,
  faFileExcel,
  faFileImport,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";

interface JournalsHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  onExport: () => void;
  isExporting?: boolean;
  canManage?: boolean;
}

export const JournalsHeader: React.FC<JournalsHeaderProps> = ({
  onRefresh,
  isRefreshing = false,
  onExport,
  isExporting = false,
  canManage = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brandGreen-700 via-brandGreen-600 to-primary-600 p-5 sm:p-7 text-white shadow-lg">
      {/* Decorative background light accents */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute right-1/4 -bottom-16 h-36 w-36 rounded-full bg-black/10 blur-xl" />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Title & Description */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white border border-white/30 shadow-xs backdrop-blur-xs">
              <FontAwesomeIcon icon={faBookOpen} className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Jurnal Umum
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/20 text-white border border-white/20">
                  Double-Entry
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90">
                Kelola pencatatan, peninjauan, dan status jurnal keuangan YWDP.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2 lg:pt-0">
          {/* Segarkan */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Segarkan data jurnal"
            title="Segarkan data dari server"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 text-xs font-semibold text-white hover:bg-white/25 transition disabled:opacity-50 active:scale-95 shadow-xs backdrop-blur-xs"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={`text-xs ${isRefreshing ? "animate-spin text-white" : ""}`}
            />
            <span className="hidden xs:inline">Segarkan</span>
          </button>

          {/* Import / Export */}
          <Link
            to="/finance/import"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 text-xs font-semibold text-white hover:bg-white/25 transition active:scale-95 shadow-xs backdrop-blur-xs"
            title="Import / Export Data Keuangan"
          >
            <FontAwesomeIcon icon={faFileImport} className="text-xs text-white/80" />
            <span className="hidden sm:inline">Import / Export</span>
            <span className="sm:hidden">Import</span>
          </Link>

          {/* Export Excel */}
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 text-xs font-semibold text-white hover:bg-white/25 transition disabled:opacity-50 active:scale-95 shadow-xs backdrop-blur-xs"
            title="Unduh data jurnal ke Excel"
          >
            <FontAwesomeIcon icon={faFileExcel} className="text-xs text-white" />
            <span>{isExporting ? "Mengunduh..." : "Export Excel"}</span>
          </button>

          {/* Buat Jurnal */}
          {canManage && (
            <Link
              to="/finance/journals/create"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 px-4 text-xs font-bold text-slate-900 transition active:scale-95 shadow-md hover:shadow-lg"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs text-primary-500" />
              <span>Buat Jurnal</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalsHeader;
