import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faArrowUpRightFromSquare,
  faUser,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import type { FinancialStatementNoteItem } from "@/types/finance";

interface ActivityStatementFinancialNotesProps {
  notes?: FinancialStatementNoteItem[];
  periodId?: number | "";
}

export const ActivityStatementFinancialNotes: React.FC<ActivityStatementFinancialNotesProps> = ({
  notes = [],
  periodId,
}) => {
  if (!notes || notes.length === 0) {
    return null;
  }

  const managementUrl =
    periodId !== "" && periodId !== undefined
      ? `/finance/financial-notes?period_id=${periodId}`
      : "/finance/financial-notes";

  return (
    <section className="rounded-2xl border border-slate-200 border-t-4 border-t-brandPurple-500 bg-white shadow-xs overflow-hidden print:border print:border-black print:rounded-none print:shadow-none mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/75 px-5 py-4 print:border-b-2 print:border-black print:bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brandPurple-500 text-xs font-bold text-white shadow-2xs print:border print:border-black print:bg-white print:text-black">
            <FontAwesomeIcon icon={faFileLines} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
              Catatan atas Laporan Keuangan
            </h3>
            <span className="text-[11px] text-slate-500">
              {notes.length} catatan terlampir untuk periode ini
            </span>
          </div>
        </div>

        {/* Link to manage notes (Hidden in Print) */}
        <div className="print:hidden">
          <Link
            to={managementUrl}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 touch-manipulation"
          >
            <span>Kelola Catatan</span>
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              className="text-[10px] text-slate-400"
            />
          </Link>
        </div>
      </div>

      {/* Notes List */}
      <div className="p-5 space-y-4 divide-y divide-slate-100">
        {notes.map((note, idx) => (
          <article
            key={note.id || idx}
            className={idx > 0 ? "pt-4" : ""}
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-block rounded-md bg-brandPurple-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider print:border print:border-black print:bg-white print:text-black">
                {note.category_label || note.category || "Umum"}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {note.title}
              </h4>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 rounded-xl p-3.5 border border-slate-100 print:border print:border-black print:bg-white print:p-2">
              {note.content}
            </div>

            {/* Creator / Date Metadata */}
            {(note.creator_name || note.created_at) && (
              <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400 print:text-black">
                {note.creator_name && (
                  <span className="inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                    <span>{note.creator_name}</span>
                  </span>
                )}
                {note.created_at && (
                  <span className="inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarDay} className="text-[10px]" />
                    <span>{note.created_at.substring(0, 10)}</span>
                  </span>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default ActivityStatementFinancialNotes;
