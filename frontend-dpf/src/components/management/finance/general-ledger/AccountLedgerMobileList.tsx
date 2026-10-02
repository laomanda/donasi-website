import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { formatFinanceDate, formatRupiah } from "@/utils/financeUtils";
import type { GeneralLedgerAccount } from "@/types/finance";

interface AccountLedgerMobileListProps {
  account: GeneralLedgerAccount;
  startDate?: string | null;
}

export const AccountLedgerMobileList: React.FC<AccountLedgerMobileListProps> = ({
  account,
  startDate,
}) => {
  return (
    <div className="divide-y divide-slate-100">
      {/* 1. Saldo Awal Card */}
      <div className="p-4 bg-slate-50 space-y-2 border-b border-slate-200">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-slate-700">[SALDO AWAL]</span>
          <span className="text-slate-500">
            {startDate ? formatFinanceDate(startDate) : "Sebelum periode"}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          Saldo awal pembukuan sebelum periode transaksi
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-bold uppercase text-slate-500">
            Saldo Berjalan
          </span>
          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
            {formatRupiah(account.opening_balance)}
          </span>
        </div>
      </div>

      {/* 2. Transactions or Empty State */}
      {account.transactions.length === 0 ? (
        <div className="p-8 text-center text-slate-500 space-y-2">
          <FontAwesomeIcon icon={faCircleInfo} className="text-slate-400 text-xl" />
          <p className="font-semibold text-xs text-slate-700">
            Tidak ada mutasi pada periode atau rentang tanggal ini.
          </p>
          <p className="text-[11px] text-slate-500">
            Saldo akhir tetap:{" "}
            <strong className="text-slate-900 font-mono">
              {formatRupiah(account.closing_balance)}
            </strong>
          </p>
        </div>
      ) : (
        account.transactions.map((tx, idx) => (
          <div key={tx.line_id || idx} className="p-4 space-y-2.5 hover:bg-slate-50 transition">
            {/* Top row: Date & Journal Link */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">
                {formatFinanceDate(tx.transaction_date)}
              </span>

              {tx.journal_entry_id ? (
                <Link
                  to={`/finance/journals/${tx.journal_entry_id}`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 hover:text-primary-600 hover:underline transition"
                  title="Lihat Voucher Jurnal"
                >
                  <span>{tx.journal_number}</span>
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    className="text-[9px] text-slate-400"
                  />
                </Link>
              ) : (
                <span className="font-mono text-xs font-bold text-slate-800">
                  {tx.journal_number || "-"}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-xs text-slate-900 font-medium leading-relaxed">
              {tx.description || "-"}
            </div>

            {/* Reference */}
            {tx.reference_type && (
              <div className="text-[11px] font-mono text-slate-500">
                Ref: {tx.reference_type}
                {tx.reference_id ? ` #${tx.reference_id}` : ""}
              </div>
            )}

            {/* Amounts Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-100">
              <div>
                <span className="block text-[10px] uppercase font-bold text-brandGreen-600">
                  Debit
                </span>
                <span className="font-mono font-medium text-slate-900 tabular-nums">
                  {tx.debit > 0 ? formatRupiah(tx.debit) : "-"}
                </span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-brandPurple-600">
                  Kredit
                </span>
                <span className="font-mono font-medium text-slate-900 tabular-nums">
                  {tx.credit > 0 ? formatRupiah(tx.credit) : "-"}
                </span>
              </div>
            </div>

            {/* Running Balance */}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Saldo Berjalan
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                {formatRupiah(tx.running_balance)}
              </span>
            </div>
          </div>
        ))
      )}

      {/* 3. Footer Summary for Mobile */}
      <div className="p-4 bg-slate-100 space-y-2 border-t-2 border-slate-200">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Total Mutasi & Saldo Akhir
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-500">
              Total Debit
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {formatRupiah(account.total_debit)}
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-500">
              Total Kredit
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {formatRupiah(account.total_credit)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-900">
            Saldo Akhir (Closing)
          </span>
          <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
            {formatRupiah(account.closing_balance)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountLedgerMobileList;
