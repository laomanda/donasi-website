import React from "react";
import type { JournalEntry } from "@/types/finance";
import { formatRupiah } from "@/utils/financeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faBan } from "@fortawesome/free-solid-svg-icons";

interface JournalLinesTableProps {
  journal: JournalEntry;
}

export const JournalLinesTable: React.FC<JournalLinesTableProps> = ({ journal }) => {
  const lines = journal.lines ?? [];
  const totalDebit = journal.total_debit;
  const totalCredit = journal.total_credit;
  const isBalanced = journal.is_balanced;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Rincian Baris Jurnal
          </h2>
          <p className="text-xs text-slate-500">
            Daftar pos akun debit dan kredit pembukuan berpasangan ({lines.length} baris)
          </p>
        </div>

        {/* Balanced Badge from Backend */}
        {isBalanced !== undefined && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {isBalanced ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brandGreen-600 px-3 py-1 text-xs font-bold text-white shadow-2xs">
                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                <span>Seimbang (Balanced)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-2xs">
                <FontAwesomeIcon icon={faBan} className="text-xs" />
                <span>Tidak Seimbang</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center text-slate-400">#</th>
              <th className="py-3 px-4 w-32">Kode Akun</th>
              <th className="py-3 px-4 min-w-[200px]">Nama Akun</th>
              <th className="py-3 px-4 min-w-[180px]">Keterangan Baris</th>
              <th className="py-3 px-4 w-36 text-right">Debit</th>
              <th className="py-3 px-4 w-36 text-right">Kredit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                  Tidak ada baris jurnal yang tercatat.
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => {
                const debitNum = Number(line.debit || 0);
                const creditNum = Number(line.credit || 0);
                return (
                  <tr key={line.id ?? idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {line.account?.code ?? line.account_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {line.account?.name ?? `Akun #${line.account_id}`}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {line.description || line.memo || "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-800">
                      {debitNum > 0 ? formatRupiah(debitNum) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-800">
                      {creditNum > 0 ? formatRupiah(creditNum) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Authoritative Totals Footer */}
          <tfoot className="border-t-2 border-slate-200 bg-slate-100 font-bold text-xs text-slate-900">
            <tr>
              <td colSpan={4} className="py-3.5 px-4 text-right tracking-wide uppercase text-[11px] text-slate-600">
                Total Otoritatif
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-900 tabular-nums">
                {totalDebit !== undefined && totalDebit !== null ? formatRupiah(totalDebit) : "—"}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-900 tabular-nums">
                {totalCredit !== undefined && totalCredit !== null ? formatRupiah(totalCredit) : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="md:hidden divide-y divide-slate-100">
        {lines.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs italic">
            Tidak ada baris jurnal yang tercatat.
          </div>
        ) : (
          lines.map((line, idx) => {
            const debitNum = Number(line.debit || 0);
            const creditNum = Number(line.credit || 0);
            return (
              <div key={line.id ?? idx} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[11px]">#{idx + 1}</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {line.account?.code ?? line.account_id}
                    </span>
                  </div>
                </div>

                <div className="font-semibold text-slate-900 text-sm">
                  {line.account?.name ?? `Akun #${line.account_id}`}
                </div>

                {(line.description || line.memo) && (
                  <p className="text-xs text-slate-500 italic">
                    {line.description || line.memo}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Debit</span>
                    <span className="font-mono font-bold text-slate-800">
                      {debitNum > 0 ? formatRupiah(debitNum) : "—"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Kredit</span>
                    <span className="font-mono font-bold text-slate-800">
                      {creditNum > 0 ? formatRupiah(creditNum) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Total */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Total Otoritatif
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-400">Total Debit</span>
              <span className="font-mono font-bold text-xs text-slate-900">
                {totalDebit !== undefined && totalDebit !== null ? formatRupiah(totalDebit) : "—"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="block text-[10px] font-bold uppercase text-slate-400">Total Kredit</span>
              <span className="font-mono font-bold text-xs text-slate-900">
                {totalCredit !== undefined && totalCredit !== null ? formatRupiah(totalCredit) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
