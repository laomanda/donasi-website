import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faFilterCircleXmark,
  faChevronLeft,
  faChevronRight,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import type { AccountingPeriod } from "@/types/finance";
import { AccountingPeriodStatusBadge } from "./AccountingPeriodStatusBadge";
import {
  formatAccountingPeriodName,
  formatAccountingPeriodDateRange,
  formatAccountingPeriodClosedAt,
} from "./periodHelpers";

interface AccountingPeriodsMobileListProps {
  periods: AccountingPeriod[];
  totalPeriodsCount: number;
  loading: boolean;
  defaultPerPage?: number;
  onResetFilters: () => void;
}

export const AccountingPeriodsMobileList: React.FC<AccountingPeriodsMobileListProps> = ({
  periods,
  totalPeriodsCount,
  loading,
  defaultPerPage = 5,
  onResetFilters,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(defaultPerPage);
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setCurrentPage(1);
  }, [periods]);

  const toggleNote = (id: number) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePerPageChange = (val: number) => {
    setPerPage(val);
    setCurrentPage(1);
  };

  const totalItems = periods.length;
  const totalPages = perPage === -1 ? 1 : Math.max(1, Math.ceil(totalItems / perPage));
  const startRecord = perPage === -1 ? 1 : Math.min((currentPage - 1) * perPage + 1, totalItems);
  const endRecord = perPage === -1 ? totalItems : Math.min(currentPage * perPage, totalItems);

  const paginatedPeriods =
    perPage === -1 ? periods : periods.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Initial Loading Skeleton
  if (loading && periods.length === 0) {
    return (
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-5 w-16 rounded-full bg-slate-200" />
            </div>
            <div className="h-3 w-40 rounded bg-slate-100" />
            <div className="h-3 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  // Empty State: Total periods is zero (no data in system)
  if (totalPeriodsCount === 0) {
    return (
      <div className="md:hidden flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brandBlueTeal-500 text-white mb-3 shadow-xs">
          <FontAwesomeIcon icon={faCalendarDays} className="text-lg" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 font-poppins">
          Belum Ada Periode Akuntansi
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Belum ada periode akuntansi yang tersedia di sistem.
        </p>
      </div>
    );
  }

  // Filter Empty State: Total periods > 0, but filtered subset is 0
  if (periods.length === 0) {
    return (
      <div className="md:hidden flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white mb-3 shadow-xs">
          <FontAwesomeIcon icon={faFilterCircleXmark} className="text-lg" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 font-poppins">
          Tidak Ada Periode Sesuai Filter
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mb-4">
          Ubah kata kunci atau filter status untuk melihat periode lainnya.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-600 transition active:scale-95"
        >
          Reset Filter
        </button>
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {/* Cards List */}
      {paginatedPeriods.map((period) => {
        const isOpen =
          (period.status || "").toLowerCase().trim() === "open" ||
          (period.status || "").toLowerCase().trim() === "aktif";
        const isNoteExpanded = !!expandedNotes[period.id];
        const notes = period.closing_notes?.trim();
        const hasLongNotes = Boolean(notes && notes.length > 60);

        return (
          <div
            key={period.id}
            className={`rounded-2xl border bg-white p-4 shadow-xs transition ${
              isOpen
                ? "border-l-4 border-l-brandGreen-500 border-t-slate-200 border-r-slate-200 border-b-slate-200"
                : "border-l-4 border-l-slate-400 border-t-slate-200 border-r-slate-200 border-b-slate-200"
            }`}
          >
            {/* Header: Period Name & Status */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {isOpen ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-brandGreen-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Aktif
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                )}
                <span
                  className={`font-poppins text-slate-900 truncate ${
                    isOpen ? "font-bold text-sm" : "font-semibold text-sm"
                  }`}
                >
                  {formatAccountingPeriodName(period)}
                </span>
              </div>
              <AccountingPeriodStatusBadge status={period.status} className="shrink-0" />
            </div>

            {/* Date Range */}
            <div className="mt-2 text-xs text-slate-700 font-mono">
              <span className="inline-block rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-800">
                {formatAccountingPeriodDateRange(period.start_date, period.end_date)}
              </span>
            </div>

            {/* Closed Info & Notes */}
            {period.closed_at && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[10px]" />
                <span className="text-[11px] font-bold text-slate-500">Ditutup: </span>
                <span>{formatAccountingPeriodClosedAt(period.closed_at)}</span>
              </div>
            )}

            {notes && (
              <div className="mt-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
                  Catatan Penutupan:
                </span>
                <p
                  className={
                    isNoteExpanded
                      ? "text-xs leading-relaxed"
                      : "line-clamp-2 text-xs leading-relaxed"
                  }
                >
                  {notes}
                </p>
                {hasLongNotes && (
                  <button
                    type="button"
                    onClick={() => toggleNote(period.id)}
                    className="mt-1 text-[11px] font-bold text-brandBlueTeal-500 hover:underline"
                  >
                    {isNoteExpanded ? "Sembunyikan" : "Tampilkan selengkapnya"}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Mobile Pagination Bar */}
      {totalItems > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              <strong>{startRecord}</strong>-<strong>{endRecord}</strong> dari{" "}
              <strong>{totalItems}</strong> periode
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Baris:</span>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                aria-label="Baris per halaman"
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={-1}>Semua</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="inline-flex min-h-[32px] flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 disabled:opacity-40"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-2 text-xs font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="inline-flex min-h-[32px] flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 disabled:opacity-40"
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
