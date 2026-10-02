import React from "react";
import { Link } from "react-router-dom";
import type { JournalEntry } from "@/types/finance";
import { formatRupiah, formatFinanceDate } from "@/utils/financeUtils";
import { JournalStatusBadge } from "./JournalStatusBadge";
import { JournalRowActions } from "./JournalRowActions";

interface JournalsMobileListProps {
  journals: JournalEntry[];
  loading?: boolean;
  canManage?: boolean;
  onPost?: (journal: JournalEntry) => void;
  onVoid?: (journal: JournalEntry) => void;
  onReverse?: (journal: JournalEntry) => void;
  pagination?: React.ReactNode;
}

export const JournalsMobileList: React.FC<JournalsMobileListProps> = ({
  journals,
  loading = false,
  canManage = false,
  onPost,
  onVoid,
  onReverse,
  pagination,
}) => {
  if (loading && journals.length === 0) {
    return (
      <div className="md:hidden space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-5 w-16 bg-slate-200 rounded-full" />
            </div>
            <div className="h-3 w-44 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (journals.length === 0) {
    return (
      <div className="md:hidden rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        <p className="text-sm font-semibold">Tidak ada jurnal ditemukan</p>
        <p className="text-xs text-slate-400 mt-1">
          Sesuaikan kriteria filter atau buat jurnal baru.
        </p>
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {journals.map((journal) => {
        const debitDisplay =
          journal.total_debit !== undefined && journal.total_debit !== null
            ? formatRupiah(journal.total_debit)
            : "—";

        const creditDisplay =
          journal.total_credit !== undefined && journal.total_credit !== null
            ? formatRupiah(journal.total_credit)
            : "—";

        return (
          <div
            key={journal.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
          >
            {/* Top row: Number and Status */}
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/finance/journals/${journal.id}`}
                className="font-mono font-bold text-sm text-slate-900 hover:text-primary-600 transition"
              >
                {journal.journal_number}
              </Link>
              <JournalStatusBadge status={journal.status} />
            </div>

            {/* Date & Reference */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{formatFinanceDate(journal.transaction_date || journal.date)}</span>
              {journal.program?.title && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="rounded-md bg-brandBlueTeal-500 text-white px-2 py-0.5 text-[10px] font-semibold truncate max-w-[150px]">
                    {journal.program.title}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-800 line-clamp-2">
              {journal.description || "—"}
            </p>

            {/* Debit & Credit cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  Debit
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {debitDisplay}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  Kredit
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {creditDisplay}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <Link
                to={`/finance/journals/${journal.id}`}
                className="text-xs font-bold text-primary-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Rincian &rarr;</span>
              </Link>

              <JournalRowActions
                journal={journal}
                canManage={canManage}
                onPost={onPost}
                onVoid={onVoid}
                onReverse={onReverse}
              />
            </div>
          </div>
        );
      })}

      {pagination}
    </div>
  );
};

export default JournalsMobileList;
