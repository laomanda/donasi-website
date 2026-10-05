import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { formatRupiah } from "@/utils/financeUtils";
import type { ActivityStatementAccount } from "@/types/finance";

interface ActivityStatementTableProps {
  items: ActivityStatementAccount[];
  emptyMessage: string;
  subtotalLabel: string;
  subtotalAmount: number;
  periodId: number | "";
  startDate?: string;
  endDate?: string;
  defaultPerPage?: number;
}

export const ActivityStatementTable: React.FC<ActivityStatementTableProps> = ({
  items,
  emptyMessage,
  subtotalLabel,
  subtotalAmount,
  periodId,
  startDate,
  endDate,
  defaultPerPage = 10,
}) => {
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(defaultPerPage);

  // Reset page when items or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [items, periodId, startDate, endDate]);

  const getLedgerUrl = (accountId: number) => {
    const params = new URLSearchParams();
    params.set("account_id", String(accountId));
    if (periodId !== "") params.set("period_id", String(periodId));
    if (startDate?.trim()) params.set("start_date", startDate.trim());
    if (endDate?.trim()) params.set("end_date", endDate.trim());
    return `/finance/general-ledger?${params.toString()}`;
  };

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs font-medium text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  const totalItems = items.length;
  const totalPages =
    perPage === -1 ? 1 : Math.max(1, Math.ceil(totalItems / perPage));
  const startRecord =
    perPage === -1
      ? 1
      : Math.min((currentPage - 1) * perPage + 1, totalItems);
  const endRecord =
    perPage === -1 ? totalItems : Math.min(currentPage * perPage, totalItems);

  const handlePerPageChange = (val: number) => {
    setPerPage(val);
    setCurrentPage(1);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider print:border-b-2 print:border-black print:bg-white print:text-black">
            <th scope="col" className="py-3 px-5 w-36">
              Kode Akun
            </th>
            <th scope="col" className="py-3 px-4 min-w-[200px]">
              Nama Akun
            </th>
            <th scope="col" className="py-3 px-4 w-52">
              Kategori Pelaporan
            </th>
            <th scope="col" className="py-3 px-5 text-right w-48">
              Jumlah Mutasi (Rp)
            </th>
            <th scope="col" className="py-3 px-4 text-center w-28 print:hidden">
              Aksi
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((acc, idx) => {
            const hasAccountId = acc.account_id !== null && acc.account_id !== undefined;
            const isVisibleOnScreen =
              perPage === -1 ||
              (idx >= (currentPage - 1) * perPage && idx < currentPage * perPage);

            return (
              <tr
                key={hasAccountId ? acc.account_id : `${acc.code}-${idx}`}
                className={`hover:bg-slate-50/90 transition-colors ${
                  isVisibleOnScreen ? "" : "hidden print:table-row"
                }`}
              >
                {/* Kode Akun */}
                <td className="py-3 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                  {hasAccountId ? (
                    <Link
                      to={getLedgerUrl(acc.account_id)}
                      className="hover:text-primary-600 transition"
                      title={`Lihat Buku Besar ${acc.code}`}
                    >
                      {acc.code}
                    </Link>
                  ) : (
                    <span>{acc.code}</span>
                  )}
                </td>

                {/* Nama Akun */}
                <td className="py-3 px-4 font-semibold text-slate-800">
                  {acc.name}
                </td>

                {/* Kategori Pelaporan */}
                <td className="py-3 px-4">
                  <span className="inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    {acc.report_category || "-"}
                  </span>
                </td>

                {/* Jumlah Mutasi */}
                <td className="py-3 px-5 text-right font-mono font-bold text-slate-900 tabular-nums">
                  {formatRupiah(acc.amount)}
                </td>

                {/* Aksi: Buku Besar */}
                <td className="py-3 px-4 text-center whitespace-nowrap print:hidden">
                  {hasAccountId ? (
                    <Link
                      to={getLedgerUrl(acc.account_id)}
                      className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
                      title={`Buka Buku Besar akun ${acc.code}`}
                    >
                      <span>Buku Besar</span>
                    </Link>
                  ) : (
                    <span className="text-[11px] text-slate-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Subtotal Footer */}
        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-900 text-white font-bold print:border-t-2 print:border-black print:bg-white print:text-black">
            <td colSpan={3} className="py-3.5 px-5 text-xs uppercase tracking-wider text-slate-200 print:text-black">
              {subtotalLabel}
            </td>
            <td className="py-3.5 px-5 text-right font-mono text-sm tabular-nums text-white print:text-black">
              {formatRupiah(subtotalAmount)}
            </td>
            <td className="print:hidden"></td>
          </tr>
        </tfoot>
      </table>

      {/* Pagination Bar - Hanya tampil jika data akun melebihi 10 baris */}
      {totalItems > 10 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/75 px-5 py-3 text-xs print:hidden">
          {/* Left: Records info & Per-page select */}
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <div>
              Menampilkan <strong className="text-slate-900">{startRecord}</strong> -{" "}
              <strong className="text-slate-900">{endRecord}</strong> dari{" "}
              <strong className="text-slate-900">{totalItems}</strong> akun
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

          {/* Right: Page navigation buttons */}
          {perPage !== -1 && totalPages > 1 && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityStatementTable;
