import React from "react";
import { formatRupiah } from "@/utils/financeUtils";
import type { GeneralLedgerAccount } from "@/types/finance";

interface AccountLedgerSummaryProps {
  account: GeneralLedgerAccount;
}

export const AccountLedgerSummary: React.FC<AccountLedgerSummaryProps> = ({ account }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Saldo Awal */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Saldo Awal
        </div>
        <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
          {formatRupiah(account.opening_balance)}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Sebelum rentang tanggal</div>
      </div>

      {/* 2. Mutasi Debit */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brandGreen-500" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-brandGreen-500">
          Mutasi Debit
        </div>
        <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
          {formatRupiah(account.total_debit)}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Penambahan / Pengurangan</div>
      </div>

      {/* 3. Mutasi Kredit */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brandPurple-500" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-brandPurple-500">
          Mutasi Kredit
        </div>
        <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
          {formatRupiah(account.total_credit)}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Pengurangan / Penambahan</div>
      </div>

      {/* 4. Saldo Akhir (Closing) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-primary-500">
          Saldo Akhir (Closing)
        </div>
        <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
          {formatRupiah(account.closing_balance)}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Saldo berjalan final</div>
      </div>
    </div>
  );
};

export default AccountLedgerSummary;
