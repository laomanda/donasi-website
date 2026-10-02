import React from "react";
import { formatRupiah } from "@/utils/financeUtils";
import { LedgerAccountTypeBadge } from "./LedgerAccountTypeBadge";
import type { GeneralLedgerAccount } from "@/types/finance";

interface LedgerAccountsTableProps {
  accounts: GeneralLedgerAccount[];
  onSelectAccount: (accountId: number) => void;
}

export const LedgerAccountsTable: React.FC<LedgerAccountsTableProps> = ({
  accounts,
  onSelectAccount,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        {/* Solid Dark Table Header */}
        <thead className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3.5 w-28">Kode Akun</th>
            <th className="px-4 py-3.5 min-w-[200px]">Nama Akun Perkiraan</th>
            <th className="px-4 py-3.5 w-32">Jenis</th>
            <th className="px-4 py-3.5 w-36 text-right">Saldo Awal</th>
            <th className="px-4 py-3.5 w-36 text-right">Total Debit</th>
            <th className="px-4 py-3.5 w-36 text-right">Total Kredit</th>
            <th className="px-4 py-3.5 w-36 text-right">Saldo Akhir</th>
            <th className="px-5 py-3.5 w-24 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {accounts.map((acc) => (
            <tr
              key={acc.account_id}
              className="hover:bg-slate-50 transition cursor-pointer"
              onClick={() => onSelectAccount(acc.account_id)}
            >
              {/* Kode Akun */}
              <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                {acc.code}
              </td>

              {/* Nama Akun */}
              <td className="px-4 py-3.5">
                <div className="font-semibold text-slate-900">{acc.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {acc.transactions.length} mutasi
                  {acc.report_category && <span> • {acc.report_category}</span>}
                </div>
              </td>

              {/* Jenis Akun */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <LedgerAccountTypeBadge type={acc.account_type} />
              </td>

              {/* Saldo Awal */}
              <td className="px-4 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                {formatRupiah(acc.opening_balance)}
              </td>

              {/* Total Debit */}
              <td className="px-4 py-3.5 text-right font-mono text-slate-900 font-semibold tabular-nums">
                {acc.total_debit > 0 ? formatRupiah(acc.total_debit) : "-"}
              </td>

              {/* Total Kredit */}
              <td className="px-4 py-3.5 text-right font-mono text-slate-900 font-semibold tabular-nums">
                {acc.total_credit > 0 ? formatRupiah(acc.total_credit) : "-"}
              </td>

              {/* Saldo Akhir */}
              <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(acc.closing_balance)}
              </td>

              {/* Aksi */}
              <td
                className="px-5 py-3.5 text-center whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onSelectAccount(acc.account_id)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition active:scale-95 shadow-2xs group"
                >
                  <span>Rincian</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LedgerAccountsTable;
