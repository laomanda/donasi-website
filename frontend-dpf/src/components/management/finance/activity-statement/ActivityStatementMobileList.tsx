import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { formatRupiah } from "@/utils/financeUtils";
import type { ActivityStatementAccount } from "@/types/finance";

interface ActivityStatementMobileListProps {
  items: ActivityStatementAccount[];
  emptyMessage: string;
  subtotalLabel: string;
  subtotalAmount: number;
  periodId: number | "";
  startDate?: string;
  endDate?: string;
  defaultPerPage?: number;
}

export const ActivityStatementMobileList: React.FC<ActivityStatementMobileListProps> = ({
  items,
  emptyMessage,
  subtotalLabel,
  subtotalAmount,
  periodId,
  startDate,
  endDate,
  defaultPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(defaultPerPage);

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
      <div className="py-6 px-4 text-center text-xs font-medium text-slate-400">
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
    <div className="p-3 space-y-3">
      {/* Account Cards */}
      <div className="space-y-2.5">
        {items.map((acc, idx) => {
          const hasAccountId = acc.account_id !== null && acc.account_id !== undefined;
          const isVisibleOnScreen =
            perPage === -1 ||
            (idx >= (currentPage - 1) * perPage && idx < currentPage * perPage);

          return (
            <div
              key={hasAccountId ? acc.account_id : `${acc.code}-${idx}`}
              className={`rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-slate-300 ${
                isVisibleOnScreen ? "" : "hidden print:block"
              }`}
            >
              {/* Header: Code & Category */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {acc.code}
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[160px]">
                  {acc.report_category || "-"}
                </span>
              </div>

              {/* Account Name */}
              <h4 className="text-xs font-bold text-slate-900 mb-2 leading-snug">
                {acc.name}
              </h4>

              {/* Balance & Action */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Jumlah Mutasi
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                    {formatRupiah(acc.amount)}
                  </span>
                </div>

                {hasAccountId && (
                  <Link
                    to={getLedgerUrl(acc.account_id)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95 touch-manipulation"
                    title={`Buka Buku Besar akun ${acc.code}`}
                  >
                    <span>Buku Besar</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Pagination Toolbar - Hanya tampil jika data melebihi 10 akun */}
      {totalItems > 10 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-2.5 print:hidden">
          <div className="flex items-center justify-between gap-2 text-slate-600">
            <div>
              <span>{startRecord}</span> - <span>{endRecord}</span> dari{" "}
              <strong className="text-slate-900">{totalItems}</strong> akun
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                aria-label="Jumlah baris per halaman"
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={-1}>Semua</option>
              </select>
            </div>
          </div>

          {perPage !== -1 && totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs active:scale-95 disabled:opacity-40"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                <span>Sebelumnya</span>
              </button>

              <span className="px-2 text-center text-xs font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs active:scale-95 disabled:opacity-40"
              >
                <span>Selanjutnya</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subtotal Banner for Mobile */}
      <div className="rounded-xl bg-slate-900 text-white p-3.5 flex items-center justify-between gap-2 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {subtotalLabel}
        </span>
        <span className="font-mono text-sm font-bold tabular-nums text-white">
          {formatRupiah(subtotalAmount)}
        </span>
      </div>
    </div>
  );
};

export default ActivityStatementMobileList;
