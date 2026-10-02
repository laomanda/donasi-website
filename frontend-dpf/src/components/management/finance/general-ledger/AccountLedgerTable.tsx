import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faCircleInfo, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { formatFinanceDate, formatRupiah } from "@/utils/financeUtils";
import type { GeneralLedgerAccount } from "@/types/finance";

interface AccountLedgerTableProps {
  account: GeneralLedgerAccount;
  startDate?: string | null;
  onBackToOverview?: () => void;
}

export const AccountLedgerTable: React.FC<AccountLedgerTableProps> = ({
  account,
  startDate,
  onBackToOverview,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs">
        {/* Solid Dark Table Header */}
        <thead className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3.5 w-32">Tanggal</th>
            <th className="px-4 py-3.5 w-44">No. Jurnal</th>
            <th className="px-4 py-3.5 min-w-[220px]">Keterangan Transaksi</th>
            <th className="px-4 py-3.5 w-32">Referensi</th>
            <th className="px-4 py-3.5 w-36 text-right">Debit (Rp)</th>
            <th className="px-4 py-3.5 w-36 text-right">Kredit (Rp)</th>
            <th className="px-5 py-3.5 w-40 text-right">Saldo Berjalan (Rp)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {/* Row Saldo Awal (Neutral starting row) */}
          <tr className="bg-slate-50 font-semibold text-slate-800">
            <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
              {startDate ? formatFinanceDate(startDate) : "-"}
            </td>
            <td className="px-4 py-3 font-mono text-slate-500 italic">
              [SALDO AWAL]
            </td>
            <td className="px-4 py-3 italic text-slate-600" colSpan={2}>
              Saldo awal pembukuan sebelum periode transaksi
            </td>
            <td className="px-4 py-3 text-right font-mono text-slate-400">-</td>
            <td className="px-4 py-3 text-right font-mono text-slate-400">-</td>
            <td className="px-5 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
              {formatRupiah(account.opening_balance)}
            </td>
          </tr>

          {/* Mutasi Rows */}
          {account.transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-slate-500">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <FontAwesomeIcon icon={faCircleInfo} className="text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">
                      Tidak Ada Mutasi Transaksi
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tidak ditemukan jurnal yang diposting untuk akun ini pada periode atau rentang tanggal yang dipilih.
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Saldo akhir tetap sama dengan saldo awal:{" "}
                      <strong className="text-slate-900 font-mono font-bold">
                        {formatRupiah(account.closing_balance)}
                      </strong>
                    </p>
                  </div>
                  {onBackToOverview && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onBackToOverview}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                      >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
                        <span>Kembali ke Ikhtisar Semua Akun</span>
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            account.transactions.map((tx, idx) => (
              <tr key={tx.line_id || idx} className="hover:bg-slate-50 transition">
                {/* Tanggal */}
                <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                  {formatFinanceDate(tx.transaction_date)}
                </td>

                {/* No Jurnal - Route Link to dedicated Journal Detail Page */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {tx.journal_entry_id ? (
                    <Link
                      to={`/finance/journals/${tx.journal_entry_id}`}
                      className="inline-flex items-center gap-2 font-mono font-bold text-slate-800 hover:text-primary-600 hover:underline transition group"
                      title="Lihat Rincian Voucher Jurnal"
                    >
                      <span>{tx.journal_number}</span>
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className="text-[10px] text-slate-400 group-hover:text-primary-600 transition"
                      />
                    </Link>
                  ) : (
                    <span className="font-mono font-bold text-slate-800">
                      {tx.journal_number || "-"}
                    </span>
                  )}
                </td>

                {/* Keterangan */}
                <td className="px-4 py-3 max-w-md">
                  <div className="font-medium text-slate-900 line-clamp-2">
                    {tx.description || "-"}
                  </div>
                </td>

                {/* Referensi */}
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                  {tx.reference_type
                    ? `${tx.reference_type}${tx.reference_id ? ` #${tx.reference_id}` : ""}`
                    : "-"}
                </td>

                {/* Debit */}
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {tx.debit > 0 ? (
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(tx.debit)}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Kredit */}
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {tx.credit > 0 ? (
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(tx.credit)}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Saldo Berjalan (Authoritative backend running_balance) */}
                <td className="px-5 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                  {formatRupiah(tx.running_balance)}
                </td>
              </tr>
            ))
          )}
        </tbody>

        {/* Footer Summary Row */}
        <tfoot className="border-t-2 border-slate-200 bg-slate-100 font-bold text-xs text-slate-900">
          <tr>
            <td colSpan={4} className="px-5 py-3.5 text-right uppercase tracking-wider text-slate-700">
              Total Mutasi & Saldo Akhir
            </td>
            <td className="px-4 py-3.5 text-right font-mono text-slate-900 tabular-nums">
              {formatRupiah(account.total_debit)}
            </td>
            <td className="px-4 py-3.5 text-right font-mono text-slate-900 tabular-nums">
              {formatRupiah(account.total_credit)}
            </td>
            <td className="px-5 py-3.5 text-right font-mono text-slate-900 text-sm tabular-nums">
              {formatRupiah(account.closing_balance)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default AccountLedgerTable;
