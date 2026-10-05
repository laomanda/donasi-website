import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPenToSquare,
  faTrashCan,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import type { FinancialNote } from "@/types/finance";
import { getCategorySectionLetter } from "@/config/finance/financialNoteCategories";
import {
  formatNoteOrderLabel,
  formatCreatorLabel,
} from "@/utils/finance/financialNotesDisplay";
import { formatFinanceDate } from "@/utils/financeUtils";
import { FinancialNoteStatusBadge } from "./FinancialNoteStatusBadge";
import { FinancialNoteCategoryBadge } from "./FinancialNoteCategoryBadge";

interface FinancialNotesMobileListProps {
  notes: FinancialNote[];
  periodId?: number | "";
  canManage: boolean;
  defaultPerPage?: number;
  onDeleteClick: (note: FinancialNote) => void;
  onResetFilters: () => void;
}

export const FinancialNotesMobileList: React.FC<FinancialNotesMobileListProps> = ({
  notes,
  periodId,
  canManage,
  defaultPerPage = 10,
  onDeleteClick,
  onResetFilters,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(defaultPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [notes, periodId]);

  if (notes.length === 0) {
    return (
      <div className="md:hidden flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FontAwesomeIcon icon={faInbox} className="text-xl" />
        </div>
        <p className="text-sm font-semibold text-slate-700 font-poppins">
          Tidak Ada Catatan Sesuai Kriteria
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mb-3">
          Silakan sesuaikan pilihan filter atau kata kunci pencarian.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
        >
          Reset Filter
        </button>
      </div>
    );
  }

  const totalItems = notes.length;
  const totalPages = perPage === -1 ? 1 : Math.max(1, Math.ceil(totalItems / perPage));
  const startRecord = perPage === -1 ? 1 : Math.min((currentPage - 1) * perPage + 1, totalItems);
  const endRecord = perPage === -1 ? totalItems : Math.min(currentPage * perPage, totalItems);

  const paginatedNotes =
    perPage === -1 ? notes : notes.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePerPageChange = (val: number) => {
    setPerPage(val);
    setCurrentPage(1);
  };

  const periodParam = periodId ? `?period_id=${periodId}` : "";

  return (
    <div className="md:hidden space-y-3 print:hidden">
      {paginatedNotes.map((note, idx) => {
        const letter = getCategorySectionLetter(note.category);
        const orderLabel = formatNoteOrderLabel(
          note,
          letter,
          (currentPage - 1) * (perPage === -1 ? 0 : perPage) + idx + 1
        );
        const creator = formatCreatorLabel(note.creator_name);
        const editUrl = `/finance/financial-notes/${note.id}/edit${periodParam}`;

        return (
          <div
            key={note.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
          >
            {/* Top row: Order label & Status */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {orderLabel}
              </span>
              <FinancialNoteStatusBadge status={note.status} />
            </div>

            {/* Note Title */}
            <div>
              <p className="text-sm font-bold text-slate-900 font-poppins line-clamp-2">
                {note.title}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <FinancialNoteCategoryBadge category={note.category} />
              </div>
            </div>

            {/* Meta info */}
            <div className="rounded-xl bg-slate-50 p-2.5 space-y-1 text-xs border border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Periode:</span>
                <span className="font-medium text-slate-800">
                  {note.period_name || (note.period_id ? `Periode #${note.period_id}` : "Semua Periode")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Penyusun:</span>
                <span className="font-medium text-slate-800">{creator}</span>
              </div>
              {note.updated_at && (
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                  <span>Diperbarui:</span>
                  <span>{formatFinanceDate(note.updated_at)}</span>
                </div>
              )}
            </div>

            {/* Action buttons (only for canManage) */}
            {canManage && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <Link
                  to={editUrl}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                  <span>Edit Catatan</span>
                </Link>

                <button
                  type="button"
                  onClick={() => onDeleteClick(note)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-red-600 shadow-2xs hover:bg-red-50 hover:border-red-300 transition"
                  title="Hapus Catatan"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination Bar - Selalu tampil jika ada data catatan */}
      {totalItems > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div>
              Menampilkan <strong className="text-slate-900">{startRecord}</strong>-
              <strong className="text-slate-900">{endRecord}</strong> dari{" "}
              <strong className="text-slate-900">{totalItems}</strong> catatan
            </div>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              aria-label="Baris per halaman"
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={-1}>Semua</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
              <span>Sebelumnya</span>
            </button>
            <span className="text-xs font-bold text-slate-800 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
            >
              <span>Selanjutnya</span>
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
