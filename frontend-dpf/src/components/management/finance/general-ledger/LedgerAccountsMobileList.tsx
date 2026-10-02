import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { formatRupiah } from "@/utils/financeUtils";
import { LedgerAccountTypeBadge } from "./LedgerAccountTypeBadge";
import type { GeneralLedgerAccount } from "@/types/finance";

interface LedgerAccountsMobileListProps {
  accounts: GeneralLedgerAccount[];
  onSelectAccount: (accountId: number) => void;
}

export const LedgerAccountsMobileList: React.FC<LedgerAccountsMobileListProps> = ({
  accounts,
  onSelectAccount,
}) => {
  return (
    <div className="divide-y divide-slate-100">
      {accounts.map((acc) => (
        <div
          key={acc.account_id}
          className="p-4 space-y-3 hover:bg-slate-50 transition cursor-pointer"
          onClick={() => onSelectAccount(acc.account_id)}
        >
          {/* Top row: Code + Badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-bold text-slate-900">
              {acc.code}
            </span>
            <LedgerAccountTypeBadge type={acc.account_type} />
          </div>

          {/* Account name & subtitle */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
              {acc.name}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {acc.transactions.length} transaksi mutasi
              {acc.report_category && <span> • {acc.report_category}</span>}
            </p>
          </div>

          {/* Balances grid: 2 columns */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Saldo Awal
              </span>
              <span className="font-mono font-medium text-slate-700 tabular-nums">
                {formatRupiah(acc.opening_balance)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Saldo Akhir
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(acc.closing_balance)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-brandGreen-600">
                Total Debit
              </span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {acc.total_debit > 0 ? formatRupiah(acc.total_debit) : "-"}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-brandPurple-600">
                Total Kredit
              </span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {acc.total_credit > 0 ? formatRupiah(acc.total_credit) : "-"}
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onSelectAccount(acc.account_id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition active:scale-95 shadow-2xs group"
            >
              <span>Lihat Rincian</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] text-slate-400 group-hover:text-slate-800 transition" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LedgerAccountsMobileList;
