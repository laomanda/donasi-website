import React from "react";
import { formatRupiah } from "@/utils/financeUtils";
import type { TrialBalanceResponse } from "@/types/finance";

interface TrialBalanceSummaryProps {
  data: TrialBalanceResponse;
}

export const TrialBalanceSummary: React.FC<TrialBalanceSummaryProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Akun */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs border-t-4 border-t-slate-800 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Total Akun
        </div>
        <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
          {data.total_accounts}
        </div>
        <div className="text-[11px] text-slate-400">
          Akun terdaftar dalam neraca saldo
        </div>
      </div>

      {/* 2. Total Mutasi Debit */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs border-t-4 border-t-brandGreen-500 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Total Mutasi Debit
        </div>
        <div
          className="font-mono text-lg sm:text-xl font-bold text-slate-900 truncate tabular-nums"
          title={formatRupiah(data.total_debit)}
        >
          {formatRupiah(data.total_debit)}
        </div>
        <div className="text-[11px] text-slate-400">
          Akumulasi mutasi debit jurnal terposting
        </div>
      </div>

      {/* 3. Total Mutasi Kredit */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs border-t-4 border-t-brandBlueTeal-500 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Total Mutasi Kredit
        </div>
        <div
          className="font-mono text-lg sm:text-xl font-bold text-slate-900 truncate tabular-nums"
          title={formatRupiah(data.total_credit)}
        >
          {formatRupiah(data.total_credit)}
        </div>
        <div className="text-[11px] text-slate-400">
          Akumulasi mutasi kredit jurnal terposting
        </div>
      </div>

      {/* 4. Total Saldo Neraca */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs border-t-4 border-t-brandPurple-500 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Total Saldo Neraca
        </div>
        <div
          className="font-mono text-lg sm:text-xl font-bold text-slate-900 truncate tabular-nums"
          title={`Saldo Debit: ${formatRupiah(data.total_debit_balance)} | Saldo Kredit: ${formatRupiah(data.total_credit_balance)}`}
        >
          {formatRupiah(data.total_debit_balance)}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Debit: {formatRupiah(data.total_debit_balance)}</span>
          <span>Kredit: {formatRupiah(data.total_credit_balance)}</span>
        </div>
      </div>
    </div>
  );
};

export default TrialBalanceSummary;
