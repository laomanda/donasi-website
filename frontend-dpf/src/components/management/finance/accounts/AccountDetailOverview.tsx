import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faHashtag, faTag } from "@fortawesome/free-solid-svg-icons";
import type { Account } from "@/types/finance";
import { getNormalBalanceLabel } from "@/utils/financeUtils";
import { AccountTypeBadge } from "./AccountTypeBadge";

interface AccountDetailOverviewProps {
  account: Account;
}

export const AccountDetailOverview: React.FC<AccountDetailOverviewProps> = ({ account }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      {/* Top Header Row: Code, Name, Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {account.code}
            </span>
            <AccountTypeBadge type={account.account_type} />
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide ${
                account.is_active
                  ? "bg-brandGreen-500 text-white"
                  : "bg-slate-600 text-white"
              }`}
            >
              {account.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {account.name}
          </h2>
          {account.description && (
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {account.description}
            </p>
          )}
        </div>

        {/* Shortcut to Buku Besar */}
        <div className="shrink-0">
          <Link
            to={`/finance/general-ledger?account_id=${account.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition active:scale-95"
            title="Buka Buku Besar untuk akun ini"
          >
            <FontAwesomeIcon icon={faBookOpen} className="text-brandBlueTeal-500 text-xs" />
            <span>Lihat Buku Besar</span>
          </Link>
        </div>
      </div>

      {/* Identity & Classification Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Kode Akun */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <FontAwesomeIcon icon={faHashtag} className="text-slate-400 text-[10px]" />
            <span>Kode Akun</span>
          </div>
          <div className="font-mono font-bold text-slate-900 text-sm">
            {account.code}
          </div>
        </div>

        {/* Saldo Normal */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <FontAwesomeIcon icon={faTag} className="text-slate-400 text-[10px]" />
            <span>Saldo Normal</span>
          </div>
          <div className="font-semibold text-slate-800 text-sm">
            {getNormalBalanceLabel(account.normal_balance)}
          </div>
        </div>

        {/* Kategori Laporan */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1 sm:col-span-2 lg:col-span-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Kategori Laporan
          </div>
          <div className="font-semibold text-slate-800 text-sm">
            {account.report_category || (
              <span className="text-slate-400 italic font-normal">Tidak diklasifikasikan</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailOverview;
