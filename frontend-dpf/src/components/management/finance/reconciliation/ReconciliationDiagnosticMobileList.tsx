import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import type { ReconciliationControlItem } from "@/types/finance";
import { formatFinanceDate, formatRupiah } from "@/utils/financeUtils";

interface ReconciliationDiagnosticMobileListProps {
  check: ReconciliationControlItem;
  currentPage: number;
  onPageChange: (p: number) => void;
  itemsPerPage?: number;
}

export const ReconciliationDiagnosticMobileList: React.FC<ReconciliationDiagnosticMobileListProps> = ({
  check,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}) => {
  const errors = check.errors || [];
  const totalItems = errors.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentErrors = errors.slice(startIndex, startIndex + itemsPerPage);

  const startRecord = Math.min(startIndex + 1, totalItems);
  const endRecord = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="space-y-3 pt-2">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
        <p className="font-bold text-slate-800">
          Temuan: <span className="text-red-600 font-extrabold">{totalItems} anomali</span>
        </p>
        <span className="text-[11px] text-slate-500 font-mono">
          {startRecord}-{endRecord} dari {totalItems}
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
        {currentErrors.map((err, idx) => {
          const journalId = err.journal_id || (typeof err.id === "number" ? err.id : null);
          const journalNumber = err.journal_number || (journalId ? `#${journalId}` : "—");

          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2 text-xs"
            >
              {/* Reference */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                <span className="text-[11px] font-bold text-slate-500">Referensi:</span>
                {journalId ? (
                  <Link
                    to={`/finance/journals/${journalId}`}
                    className="inline-flex items-center gap-1 font-mono font-bold text-brandBlueTeal-600 hover:underline"
                  >
                    <span>{journalNumber}</span>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                  </Link>
                ) : (
                  <span className="font-mono font-bold text-slate-900">
                    {err.reference_id ? `#${String(err.reference_id)}` : journalNumber}
                  </span>
                )}
              </div>

              {/* Tanggal */}
              {err.transaction_date && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">Tanggal Transaksi:</span>
                  <span className="font-medium text-slate-800">
                    {formatFinanceDate(err.transaction_date)}
                  </span>
                </div>
              )}

              {/* Nominal / Debit / Kredit / Selisih */}
              {check.check_code === "JOURNAL_BALANCE" ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Total Debit:</span>
                    <span className="font-mono text-slate-800">
                      {err.total_debit != null ? formatRupiah(err.total_debit) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Total Kredit:</span>
                    <span className="font-mono text-slate-800">
                      {err.total_credit != null ? formatRupiah(err.total_credit) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-red-600">Selisih:</span>
                    <span className="font-mono font-bold text-red-600">
                      {err.difference != null ? formatRupiah(err.difference) : "—"}
                    </span>
                  </div>
                </>
              ) : err.amount != null ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">Nominal:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatRupiah(err.amount)}
                  </span>
                </div>
              ) : null}

              {/* Closed period timestamps */}
              {err.created_at && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">Dibuat:</span>
                  <span className="font-mono text-[11px] text-red-600">{String(err.created_at)}</span>
                </div>
              )}
              {err.closed_at && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">Tutup Buku:</span>
                  <span className="font-mono text-[11px] text-slate-500">{String(err.closed_at)}</span>
                </div>
              )}

              {/* Keterangan */}
              <div className="pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Keterangan:</span>
                <p className="text-red-700 font-medium leading-relaxed">
                  {String(err.reason || err.message || "Anomali terdeteksi pada titik kontrol")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 active:scale-95 disabled:opacity-40"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
            <span>Sebelumnya</span>
          </button>

          <span className="text-xs font-bold text-slate-700">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 active:scale-95 disabled:opacity-40"
          >
            <span>Selanjutnya</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
          </button>
        </div>
      )}
    </div>
  );
};
