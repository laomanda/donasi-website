import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import {
  formatRupiah,
  getNormalBalanceLabel,
} from "@/utils/financeUtils";
import { CurrencyDisplay } from "@/components/management/finance/shared";
import { TrialBalanceAccountTypeBadge } from "./TrialBalanceAccountTypeBadge";
import type {
  TrialBalanceAccount,
  TrialBalanceResponse,
} from "@/types/finance";

interface TrialBalanceMobileListProps {
  accounts: TrialBalanceAccount[];
  summaryData: TrialBalanceResponse;
  periodId: number | "";
  startDate: string;
  endDate: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TrialBalanceMobileList: React.FC<TrialBalanceMobileListProps> = ({
  accounts,
  summaryData,
  periodId,
  startDate,
  endDate,
  searchQuery,
  onSearchChange,
}) => {
  // Build drilldown URL helper
  const getLedgerUrl = (accountId: number) => {
    const params = new URLSearchParams();
    params.set("account_id", String(accountId));
    if (periodId !== "") {
      params.set("period_id", String(periodId));
    }
    if (startDate.trim()) {
      params.set("start_date", startDate.trim());
    }
    if (endDate.trim()) {
      params.set("end_date", endDate.trim());
    }
    return `/finance/general-ledger?${params.toString()}`;
  };

  return (
    <div className="space-y-3">
      {/* Mobile Search Input */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode atau nama akun perkiraan..."
          className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5"
            title="Hapus pencarian"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
          </button>
        )}
      </div>

      {/* Account Cards */}
      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
          Tidak ada akun yang sesuai dengan pencarian.
        </div>
      ) : (
        accounts.map((acc) => (
          <div
            key={acc.account_id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
          >
            {/* Header: Code + Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {acc.code}
                </span>
                <TrialBalanceAccountTypeBadge type={acc.account_type} />
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Normal:{" "}
                <strong className="text-slate-700">
                  {getNormalBalanceLabel(acc.normal_balance)}
                </strong>
              </div>
            </div>

            {/* Account Name */}
            <div>
              <div className="text-xs font-bold text-slate-900">
                {acc.name}
              </div>
            </div>

            {/* Mutasi Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mutasi Debit
                </span>
                <span className="font-mono tabular-nums text-xs">
                  {acc.total_debit > 0 ? (
                    <CurrencyDisplay amount={acc.total_debit} tone="debit" />
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mutasi Kredit
                </span>
                <span className="font-mono tabular-nums text-xs">
                  {acc.total_credit > 0 ? (
                    <CurrencyDisplay amount={acc.total_credit} tone="credit" />
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </span>
              </div>
            </div>

            {/* Saldo Akhir Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 p-2.5 text-xs">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Saldo Debit
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums text-xs">
                  {acc.debit_balance > 0 ? (
                    formatRupiah(acc.debit_balance)
                  ) : (
                    <span className="text-slate-400 font-normal">-</span>
                  )}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Saldo Kredit
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums text-xs">
                  {acc.credit_balance > 0 ? (
                    formatRupiah(acc.credit_balance)
                  ) : (
                    <span className="text-slate-400 font-normal">-</span>
                  )}
                </span>
              </div>
            </div>

            {/* Drilldown Action: >= 40px touch target */}
            <div className="pt-1">
              <Link
                to={getLedgerUrl(acc.account_id)}
                className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
              >
                <FontAwesomeIcon icon={faBookOpen} className="text-xs text-slate-500" />
                <span>Buku Besar</span>
              </Link>
            </div>
          </div>
        ))
      )}

      {/* Mobile Footer Totals Card */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-xs space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
          Total Neraca Saldo
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-medium">
              Mutasi Debit
            </span>
            <span className="font-mono text-emerald-400 font-bold tabular-nums">
              {formatRupiah(summaryData.total_debit)}
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-medium">
              Mutasi Kredit
            </span>
            <span className="font-mono text-sky-400 font-bold tabular-nums">
              {formatRupiah(summaryData.total_credit)}
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-medium">
              Saldo Debit
            </span>
            <span className="font-mono text-emerald-300 font-bold tabular-nums">
              {formatRupiah(summaryData.total_debit_balance)}
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-medium">
              Saldo Kredit
            </span>
            <span className="font-mono text-sky-300 font-bold tabular-nums">
              {formatRupiah(summaryData.total_credit_balance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialBalanceMobileList;
