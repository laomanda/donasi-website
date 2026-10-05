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

interface FinancialNotesDesktopTableProps {
  notes: FinancialNote[];
  periodId?: number | "";
  canManage: boolean;
  defaultPerPage?: number;
  onDeleteClick: (note: FinancialNote) => void;
  onResetFilters: () => void;
}

export const FinancialNotesDesktopTable: React.FC<FinancialNotesDesktopTableProps> = ({
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
      <div className="hidden md:flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FontAwesomeIcon icon={faInbox} className="text-xl" />
        </div>
        <p className="text-sm font-semibold text-slate-700 font-poppins">
          Tidak Ada Catatan Sesuai Kriteria
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
          Sesuaikan pilihan filter periode, kategori, atau pencarian Anda.
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
    <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="px-4 py-3.5 whitespace-nowrap text-center w-16">Urutan</th>
              <th className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">Judul Catatan</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Kategori</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Periode</th>
              <th className="px-4 py-3.5 whitespace-nowrap">Penyusun</th>
              <th className="px-3 py-3.5 whitespace-nowrap text-center">Status</th>
              <th className="px-4 py-3.5 whitespace-nowrap text-slate-300">Diperbarui</th>
              {canManage && (
                <th className="px-4 py-3.5 whitespace-nowrap text-center">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedNotes.map((note, idx) => {
              const letter = getCategorySectionLetter(note.category);
              const orderLabel = formatNoteOrderLabel(note, letter, (currentPage - 1) * (perPage === -1 ? 0 : perPage) + idx + 1);
              const creator = formatCreatorLabel(note.creator_name);
              const editUrl = `/finance/financial-notes/${note.id}/edit${periodParam}`;

              return (
                <tr key={note.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="inline-flex h-6 px-2 items-center justify-center rounded-md bg-slate-100 font-mono text-[11px] font-bold text-slate-800">
                      {orderLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-0 max-w-xs">
                    <p className="font-bold text-slate-900 font-poppins line-clamp-1 break-words break-all [overflow-wrap:anywhere]">
                      {note.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 break-words break-all [overflow-wrap:anywhere]">
                      {note.content}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <FinancialNoteCategoryBadge category={note.category} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {note.period_name || (note.period_id ? `Periode #${note.period_id}` : "Semua Periode")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                    {creator}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <FinancialNoteStatusBadge status={note.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                    {note.updated_at ? formatFinanceDate(note.updated_at) : "-"}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={editUrl}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                          title="Edit Catatan"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => onDeleteClick(note)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 shadow-2xs transition"
                          title="Hapus Catatan"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar - Selalu tampil jika ada data catatan */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <div>
              Menampilkan <strong className="text-slate-900">{startRecord}</strong> -{" "}
              <strong className="text-slate-900">{endRecord}</strong> dari{" "}
              <strong className="text-slate-900">{totalItems}</strong> catatan
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500">Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                aria-label="Jumlah baris per halaman"
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 transition focus:border-slate-800 focus:outline-hidden"
              >
                <option value={10}>10 baris</option>
                <option value={25}>25 baris</option>
                <option value={50}>50 baris</option>
                <option value={-1}>Semua baris</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Sebelumnya"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
              <span>Sebelumnya</span>
            </button>

            {totalPages <= 7 ? (
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                      currentPage === p
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-2 text-xs font-medium text-slate-600">
                Halaman <strong className="text-slate-900">{currentPage}</strong> dari{" "}
                <strong className="text-slate-900">{totalPages}</strong>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Selanjutnya"
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
