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

interface AccountingPeriodsDesktopTableProps {
  periods: AccountingPeriod[];
  totalPeriodsCount: number;
  loading: boolean;
  defaultPerPage?: number;
  onResetFilters: () => void;
}

export const AccountingPeriodsDesktopTable: React.FC<AccountingPeriodsDesktopTableProps> = ({
  periods,
  totalPeriodsCount,
  loading,
  defaultPerPage = 10,
  onResetFilters,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(defaultPerPage);
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});

  // Reset to page 1 whenever filtered periods list changes
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

  // Pagination math
  const totalItems = periods.length;
  const totalPages = perPage === -1 ? 1 : Math.max(1, Math.ceil(totalItems / perPage));
  const startRecord = perPage === -1 ? 1 : Math.min((currentPage - 1) * perPage + 1, totalItems);
  const endRecord = perPage === -1 ? totalItems : Math.min(currentPage * perPage, totalItems);

  const paginatedPeriods =
    perPage === -1 ? periods : periods.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Initial Loading Skeleton
  if (loading && periods.length === 0) {
    return (
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th scope="col" className="px-6 py-4">Periode</th>
              <th scope="col" className="px-6 py-4">Rentang Tanggal</th>
              <th scope="col" className="px-6 py-4 text-center">Status</th>
              <th scope="col" className="px-6 py-4">Waktu Penutupan</th>
              <th scope="col" className="px-6 py-4">Catatan Penutupan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 w-28 rounded bg-slate-200" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-40 rounded bg-slate-200" />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="mx-auto h-5 w-16 rounded-full bg-slate-200" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-48 rounded bg-slate-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty State: Total periods is zero (no data in system)
  if (totalPeriodsCount === 0) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brandBlueTeal-500 text-white mb-3 shadow-xs">
          <FontAwesomeIcon icon={faCalendarDays} className="text-lg" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 font-poppins">
          Belum Ada Periode Akuntansi
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Belum ada periode akuntansi yang tersedia di sistem.
        </p>
      </div>
    );
  }

  // Filter Empty State: Total periods > 0, but filtered subset is 0
  if (periods.length === 0) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white mb-3 shadow-xs">
          <FontAwesomeIcon icon={faFilterCircleXmark} className="text-lg" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 font-poppins">
          Tidak Ada Periode Sesuai Filter
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
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
    <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th scope="col" className="px-6 py-4 whitespace-nowrap min-w-[170px]">
                Periode
              </th>
              <th scope="col" className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                Rentang Tanggal
              </th>
              <th scope="col" className="px-6 py-4 whitespace-nowrap text-center min-w-[100px]">
                Status
              </th>
              <th scope="col" className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                Waktu Penutupan
              </th>
              <th scope="col" className="px-6 py-4 whitespace-nowrap min-w-[240px]">
                Catatan Penutupan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedPeriods.map((period) => {
              const isOpen =
                (period.status || "").toLowerCase().trim() === "open" ||
                (period.status || "").toLowerCase().trim() === "aktif";
              const isNoteExpanded = !!expandedNotes[period.id];
              const notes = period.closing_notes?.trim();
              const hasLongNotes = Boolean(notes && notes.length > 70);

              return (
                <tr
                  key={period.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    isOpen
                      ? "border-l-4 border-l-brandGreen-500 bg-slate-50/40"
                      : "border-l-4 border-l-slate-300"
                  }`}
                >
                  {/* 1. Periode */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      {isOpen ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-brandGreen-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          Aktif
                        </span>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                      )}
                      <span
                        className={`font-poppins text-slate-900 ${
                          isOpen ? "font-bold text-sm" : "font-semibold"
                        }`}
                      >
                        {formatAccountingPeriodName(period)}
                      </span>
                    </div>
                  </td>

                  {/* 2. Rentang Tanggal */}
                  <td className="px-6 py-4 text-slate-700 font-mono text-[11px]">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-800">
                      {formatAccountingPeriodDateRange(period.start_date, period.end_date)}
                    </span>
                  </td>

                  {/* 3. Status */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <AccountingPeriodStatusBadge status={period.status} />
                  </td>

                  {/* 4. Waktu Penutupan */}
                  <td className="px-6 py-4 text-slate-700">
                    {period.closed_at ? (
                      <div className="flex items-center gap-1.5 font-medium">
                        <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[10px]" />
                        <span>{formatAccountingPeriodClosedAt(period.closed_at)}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* 5. Catatan Penutupan */}
                  <td className="px-6 py-4 text-slate-600 max-w-sm">
                    {notes ? (
                      <div>
                        <p
                          className={
                            isNoteExpanded
                              ? "text-xs leading-relaxed"
                              : "line-clamp-2 text-xs leading-relaxed"
                          }
                          title={notes}
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
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-3.5 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              Menampilkan <strong className="text-slate-900">{startRecord}</strong> -{" "}
              <strong className="text-slate-900">{endRecord}</strong> dari{" "}
              <strong className="text-slate-900">{totalItems}</strong> periode
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500">Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                aria-label="Jumlah baris per halaman"
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition focus:border-slate-800 focus:outline-hidden"
              >
                <option value={5}>5 baris</option>
                <option value={10}>10 baris</option>
                <option value={25}>25 baris</option>
                <option value={-1}>Semua baris</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
                        ? "bg-primary-500 text-white shadow-xs"
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
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
