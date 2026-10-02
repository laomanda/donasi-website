import React from "react";
import { formatRupiah } from "@/utils/financeUtils";
import type { GeneralLedgerResponse } from "@/types/finance";

interface LedgerOverviewSummaryProps {
  data: GeneralLedgerResponse;
}

export const LedgerOverviewSummary: React.FC<LedgerOverviewSummaryProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Akun Beraktivitas */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Akun Beraktivitas
        </div>
        <div className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
          {data.total_accounts ?? 0}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">Memiliki mutasi atau saldo</div>
      </div>

      {/* 2. Grand Total Debit */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brandGreen-500" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-brandGreen-500">
          Grand Total Debit
        </div>
        <div
          className="mt-1.5 font-mono text-lg sm:text-xl font-bold text-slate-900 tabular-nums truncate"
          title={formatRupiah(data.grand_total_debit ?? 0)}
        >
          {formatRupiah(data.grand_total_debit ?? 0)}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">Seluruh akun perkiraan</div>
      </div>

      {/* 3. Grand Total Kredit */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brandPurple-500" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-brandPurple-500">
          Grand Total Kredit
        </div>
        <div
          className="mt-1.5 font-mono text-lg sm:text-xl font-bold text-slate-900 tabular-nums truncate"
          title={formatRupiah(data.grand_total_credit ?? 0)}
        >
          {formatRupiah(data.grand_total_credit ?? 0)}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">Seluruh akun perkiraan</div>
      </div>

      {/* 4. Periode Aktif */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brandBlueTeal-500" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-brandBlueTeal-500">
          Periode Aktif
        </div>
        <div
          className="mt-1.5 font-semibold text-base text-slate-900 truncate"
          title={data.period?.name || "Semua Periode"}
        >
          {data.period?.name || "Semua Periode"}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {data.period ? (data.period.status === "closed" ? "Status: Tertutup" : "Status: Terbuka / Aktif") : "Rentang Kumulatif"}
        </div>
      </div>
    </div>
  );
};

export default LedgerOverviewSummary;
