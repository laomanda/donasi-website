import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrashCan,
  faCalendarAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import type { FinancialNote } from "@/types/finance";
import type { FinancialNoteGroup } from "@/utils/finance/financialNotesDisplay";
import {
  formatNoteOrderLabel,
  formatCreatorLabel,
} from "@/utils/finance/financialNotesDisplay";
import { formatFinanceDate } from "@/utils/financeUtils";
import { FinancialNoteStatusBadge } from "./FinancialNoteStatusBadge";

interface FinancialNotesNarrativeSectionProps {
  group: FinancialNoteGroup;
  periodId?: number | "";
  canManage: boolean;
  onDeleteClick: (note: FinancialNote) => void;
}

export const FinancialNotesNarrativeSection: React.FC<FinancialNotesNarrativeSectionProps> = ({
  group,
  periodId,
  canManage,
  onDeleteClick,
}) => {
  const periodParam = periodId ? `?period_id=${periodId}` : "";

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandPurple-500 font-bold text-white text-sm shadow-xs">
          {group.sectionLetter}
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-poppins truncate">
            {group.categoryLabel}
          </h2>
          <p className="text-xs text-slate-500 truncate">
            {group.description}
          </p>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {group.notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
            Belum ada catatan pengungkapan untuk kategori ini.
          </div>
        ) : (
          group.notes.map((note, idx) => {
            const orderLabel = formatNoteOrderLabel(note, group.sectionLetter, idx + 1);
            const creator = formatCreatorLabel(note.creator_name);
            const detailUrl = `/finance/financial-notes/${note.id}${periodParam}`;
            const editUrl = `/finance/financial-notes/${note.id}/edit${periodParam}`;

            return (
              <article
                key={note.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5 transition hover:border-slate-300 print:border-none print:p-0 print:shadow-none"
              >
                {/* Note Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 px-2 items-center justify-center rounded-md bg-slate-900 font-mono text-xs font-bold text-white">
                      {orderLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-poppins truncate">
                      {note.title}
                    </h3>
                    <FinancialNoteStatusBadge status={note.status} />
                  </div>

                  {/* Actions (Screen only) */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto print:hidden">
                    <Link
                      to={detailUrl}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                      title="Lihat Detail Naskah"
                    >
                      <FontAwesomeIcon icon={faEye} className="text-slate-400 text-[10px]" />
                      <span>Detail</span>
                    </Link>

                    {canManage && (
                      <>
                        <Link
                          to={editUrl}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                          title="Edit Catatan"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-slate-400 text-[10px]" />
                          <span>Edit</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => onDeleteClick(note)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 shadow-2xs transition hover:bg-red-50 hover:border-red-300"
                          title="Hapus Catatan"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="text-red-500 text-[10px]" />
                          <span>Hapus</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-[11px]" />
                    <span>
                      Periode:{" "}
                      <strong className="text-slate-700 font-medium">
                        {note.period_name || (note.period_id ? `Periode #${note.period_id}` : "Semua Periode")}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUser} className="text-slate-400 text-[11px]" />
                    <span>
                      Penyusun:{" "}
                      <strong className="text-slate-700 font-medium">{creator}</strong>
                    </span>
                  </div>

                  {note.updated_at && (
                    <span className="text-slate-400 text-[11px]">
                      Diperbarui: {formatFinanceDate(note.updated_at)}
                    </span>
                  )}
                </div>

                {/* Narrative Content Body */}
                <div className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line rounded-xl bg-slate-50/50 p-4 border border-slate-100 font-sans print:bg-white print:border-none print:p-0">
                  {note.content}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
