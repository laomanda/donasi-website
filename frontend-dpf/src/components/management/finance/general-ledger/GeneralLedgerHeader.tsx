import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faFileExcel, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FinancePageHeader } from "@/components/management/finance/shared";
import { LedgerAccountTypeBadge } from "./LedgerAccountTypeBadge";
import type { GeneralLedgerAccount } from "@/types/finance";

interface GeneralLedgerHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing: boolean;
  isExporting: boolean;
  disableRefresh?: boolean;
  disableExport?: boolean;
  account?: GeneralLedgerAccount | null;
  onBackToOverview?: () => void;
}

export const GeneralLedgerHeader: React.FC<GeneralLedgerHeaderProps> = ({
  onRefresh,
  onExport,
  isRefreshing,
  isExporting,
  disableRefresh = false,
  disableExport = false,
  account,
  onBackToOverview,
}) => {
  return (
    <FinancePageHeader
      title={account ? `Buku Besar: ${account.code} — ${account.name}` : "Buku Besar"}
      description={
        account
          ? `Riwayat mutasi debet/kredit dan saldo berjalan untuk akun ${account.name}.`
          : "Telusuri mutasi dan saldo akun berdasarkan jurnal yang telah diposting."
      }
      badge={account ? <LedgerAccountTypeBadge type={account.account_type} /> : undefined}
      actions={
        <div className="flex w-full sm:w-auto items-center gap-2 sm:gap-2.5">
          {/* Back button visible in header when account is selected */}
          {account && onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
              <span className="hidden sm:inline">Kembali ke Ikhtisar</span>
            </button>
          )}

          {/* Segarkan Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={disableRefresh || isRefreshing}
            title="Segarkan Data Buku Besar"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={isRefreshing ? "animate-spin text-slate-400" : "text-slate-500"}
            />
            <span>{isRefreshing ? "Menyegarkan..." : "Segarkan"}</span>
          </button>

          {/* Ekspor Excel Button */}
          <button
            type="button"
            onClick={onExport}
            disabled={disableExport || isExporting}
            title="Ekspor Laporan Buku Besar ke Excel"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 hover:bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon
              icon={faFileExcel}
              className={isExporting ? "animate-bounce text-white" : "text-white"}
            />
            <span>{isExporting ? "Mengunduh..." : "Ekspor Excel"}</span>
          </button>
        </div>
      }
    />
  );
};

export default GeneralLedgerHeader;
