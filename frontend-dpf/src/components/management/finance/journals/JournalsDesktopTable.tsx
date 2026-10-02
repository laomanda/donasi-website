import React from "react";
import { Link } from "react-router-dom";
import type { JournalEntry } from "@/types/finance";
import { formatRupiah, formatFinanceDate } from "@/utils/financeUtils";
import { JournalStatusBadge } from "./JournalStatusBadge";
import { JournalRowActions } from "./JournalRowActions";

interface JournalsDesktopTableProps {
  journals: JournalEntry[];
  canManage: boolean;
  loading?: boolean;
  refreshing?: boolean;
  onPost?: (journal: JournalEntry) => void;
  onVoid?: (journal: JournalEntry) => void;
  onReverse?: (journal: JournalEntry) => void;
  pagination?: React.ReactNode;
}

export const JournalsDesktopTable: React.FC<JournalsDesktopTableProps> = ({
  journals,
  canManage,
  loading = false,
  refreshing = false,
  onPost,
  onVoid,
  onReverse,
  pagination,
}) => {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4 w-44">
                Nomor Jurnal
              </th>
              <th scope="col" className="py-3.5 px-4 w-28">
                Tanggal
              </th>
              <th scope="col" className="py-3.5 px-4 min-w-[200px]">
                Keterangan
              </th>
              <th scope="col" className="py-3.5 px-4 w-36">
                Program
              </th>
              <th scope="col" className="py-3.5 px-4 w-36 text-right">
                Debit
              </th>
              <th scope="col" className="py-3.5 px-4 w-36 text-right">
                Kredit
              </th>
              <th scope="col" className="py-3.5 px-4 w-28 text-center">
                Status
              </th>
              <th scope="col" className="py-3.5 px-4 w-28 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 text-xs ${refreshing ? "opacity-70 transition-opacity" : ""}`}>
            {loading && journals.length === 0 ? (
              // Table loading skeletons
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse bg-white">
                  <td className="py-4 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-48 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-4 px-4 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-7 w-20 bg-slate-200 rounded-lg mx-auto" /></td>
                </tr>
              ))
            ) : journals.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-slate-500 font-medium bg-slate-50/50"
                >
                  <p className="text-sm">Tidak ada transaksi jurnal yang sesuai filter.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba sesuaikan kata kunci pencarian, periode, atau tanggal.
                  </p>
                </td>
              </tr>
            ) : (
              journals.map((journal) => {
                const debitDisplay =
                  journal.total_debit !== undefined && journal.total_debit !== null
                    ? formatRupiah(journal.total_debit)
                    : "—";

                const creditDisplay =
                  journal.total_credit !== undefined && journal.total_credit !== null
                    ? formatRupiah(journal.total_credit)
                    : "—";

                return (
                  <tr
                    key={journal.id}
                    className="hover:bg-slate-50 transition group bg-white"
                  >
                    {/* Journal Number as Link */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <Link
                        to={`/finance/journals/${journal.id}`}
                        className="text-slate-900 hover:text-primary-600 hover:underline transition"
                        title={journal.journal_number}
                      >
                        {journal.journal_number}
                      </Link>
                    </td>

                    {/* Transaction Date */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatFinanceDate(journal.transaction_date || journal.date)}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-slate-800">
                      <div className="max-w-[280px] lg:max-w-md truncate" title={journal.description}>
                        {journal.description || "—"}
                      </div>
                      {journal.reference_type && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Ref: {journal.reference_type}
                          {journal.reference_id ? ` #${journal.reference_id}` : ""}
                        </div>
                      )}
                    </td>

                    {/* Program */}
                    <td className="py-3 px-4">
                      {journal.program?.title ? (
                        <span
                          className="inline-block max-w-[130px] truncate rounded-md px-2 py-0.5 text-[10px] font-semibold bg-brandBlueTeal-500 text-white"
                          title={journal.program.title}
                        >
                          {journal.program.title}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Debit */}
                    <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-800">
                      {debitDisplay}
                    </td>

                    {/* Credit */}
                    <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-800">
                      {creditDisplay}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <JournalStatusBadge status={journal.status} />
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-center">
                      <JournalRowActions
                        journal={journal}
                        canManage={canManage}
                        onPost={onPost}
                        onVoid={onVoid}
                        onReverse={onReverse}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination}
    </div>
  );
};

export default JournalsDesktopTable;
