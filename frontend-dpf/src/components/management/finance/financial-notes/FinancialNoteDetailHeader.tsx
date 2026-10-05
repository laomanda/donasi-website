import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPenToSquare,
  faTrashCan,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import type { FinancialNote } from "@/types/finance";
import { FinancialNoteStatusBadge } from "./FinancialNoteStatusBadge";
import { FinancialNoteCategoryBadge } from "./FinancialNoteCategoryBadge";

interface FinancialNoteDetailHeaderProps {
  note: FinancialNote;
  periodId?: number | "";
  canManage: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDeleteClick: () => void;
}

export const FinancialNoteDetailHeader: React.FC<FinancialNoteDetailHeaderProps> = ({
  note,
  periodId,
  canManage,
  refreshing,
  onRefresh,
  onDeleteClick,
}) => {
  const backUrl = `/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`;
  const editUrl = `/finance/financial-notes/${note.id}/edit${periodId ? `?period_id=${periodId}` : ""}`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      {/* Title & Badge */}
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-3">
          <Link
            to={backUrl}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 shrink-0"
            title="Kembali ke Catatan atas Laporan Keuangan"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </Link>
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins truncate">
              {note.title}
            </h1>
            <FinancialNoteStatusBadge status={note.status} />
            <FinancialNoteCategoryBadge category={note.category} />
          </div>
        </div>
        <p className="text-xs text-slate-500 pl-12 font-mono">
          Nomor Urut: <span className="font-semibold text-slate-800">{note.sort_order ?? note.order ?? "-"}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:self-center">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Segarkan Data Catatan"
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faRotateRight}
            className={refreshing ? "animate-spin text-slate-400" : "text-slate-600"}
          />
          <span>Segarkan</span>
        </button>

        {canManage && (
          <>
            <Link
              to={editUrl}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-primary-600 active:scale-95"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="text-white text-xs" />
              <span>Edit Catatan</span>
            </Link>

            <button
              type="button"
              onClick={onDeleteClick}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 active:scale-95"
            >
              <FontAwesomeIcon icon={faTrashCan} className="text-white text-xs" />
              <span>Hapus</span>
            </button>
          </>
        )}

        <Link
          to={backUrl}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
        >
          <span>Kembali</span>
        </Link>
      </div>
    </div>
  );
};
