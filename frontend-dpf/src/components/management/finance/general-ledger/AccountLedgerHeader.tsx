import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getNormalBalanceLabel } from "@/utils/financeUtils";
import { LedgerAccountTypeBadge } from "./LedgerAccountTypeBadge";
import type { GeneralLedgerAccount } from "@/types/finance";

interface AccountLedgerHeaderProps {
  account: GeneralLedgerAccount;
  periodName?: string | null;
  onBackToOverview: () => void;
}

export const AccountLedgerHeader: React.FC<AccountLedgerHeaderProps> = ({
  account,
  periodName,
  onBackToOverview,
}) => {
  return (
    <div className="space-y-3">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={onBackToOverview}
            className="hover:text-slate-900 transition flex items-center gap-1.5 font-semibold text-slate-600"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
            <span>Buku Besar (Semua Akun)</span>
          </button>
          <span>/</span>
          <span className="font-bold text-slate-900">Rincian Akun</span>
          <span>/</span>
          <span className="font-mono font-bold text-slate-900">{account.code}</span>
        </div>

        <button
          type="button"
          onClick={onBackToOverview}
          className="inline-flex items-center justify-center gap-2 self-start sm:self-auto rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition active:scale-95 shadow-2xs group"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="text-[10px] text-slate-500 group-hover:text-slate-800 transition"
          />
          <span>Kembali ke Ikhtisar Semua Akun</span>
        </button>
      </div>

      {/* Main Account Identity Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shrink-0 shadow-2xs">
            <FontAwesomeIcon icon={faBookOpen} className="text-lg" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-lg sm:text-xl font-bold text-slate-900">
                {account.code}
              </span>
              <span className="text-slate-300">•</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {account.name}
              </h2>
              <LedgerAccountTypeBadge type={account.account_type} />
            </div>

            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span>
                Saldo Normal:{" "}
                <strong className="text-slate-800 font-semibold">
                  {getNormalBalanceLabel(account.normal_balance)}
                </strong>
              </span>
              {account.report_category && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>Kategori: <strong className="text-slate-700">{account.report_category}</strong></span>
                </>
              )}
              {periodName && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>Periode: <strong className="text-slate-700">{periodName}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLedgerHeader;
