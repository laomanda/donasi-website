import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import type { ReconciliationControlItem } from "@/types/finance";
import { formatFinanceDate, formatRupiah } from "@/utils/financeUtils";

interface ReconciliationDiagnosticTableProps {
  check: ReconciliationControlItem;
  currentPage: number;
  onPageChange: (p: number) => void;
  itemsPerPage?: number;
}

export const ReconciliationDiagnosticTable: React.FC<ReconciliationDiagnosticTableProps> = ({
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <p className="text-xs font-bold text-slate-800">
          Daftar Temuan Diagnostik:{" "}
          <span className="text-red-600 font-extrabold">{totalItems} anomali tercatat</span>
        </p>
        <span className="text-[11px] text-slate-500 font-mono">
          Menampilkan {startRecord} - {endRecord} dari {totalItems} temuan
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white font-semibold">
            {check.check_code === "CLOSED_PERIOD_CONTROL" ? (
              <tr>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">No. Jurnal</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Tgl Transaksi</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Waktu Jurnal Dibuat</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Waktu Tutup Buku</th>
                <th scope="col" className="py-2.5 px-3">Keterangan</th>
              </tr>
            ) : check.check_code === "DONATION_RECONCILIATION" ? (
              <tr>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Ref Transaksi</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Nominal</th>
                <th scope="col" className="py-2.5 px-3">Status Integritas</th>
              </tr>
            ) : check.check_code === "ALLOCATION_RECONCILIATION" ? (
              <tr>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Ref Penyaluran</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Nominal</th>
                <th scope="col" className="py-2.5 px-3">Status Integritas</th>
              </tr>
            ) : check.check_code === "JOURNAL_BALANCE" ? (
              <tr>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">No. Jurnal</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Total Debit</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Total Kredit</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Selisih</th>
                <th scope="col" className="py-2.5 px-3">Keterangan</th>
              </tr>
            ) : (
              <tr>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Referensi / ID</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
                <th scope="col" className="py-2.5 px-3 whitespace-nowrap">Nominal / Selisih</th>
                <th scope="col" className="py-2.5 px-3">Alasan / Keterangan</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {currentErrors.map((err, idx) => {
              const journalId = err.journal_id || (typeof err.id === "number" ? err.id : null);
              const journalNumber = err.journal_number || (journalId ? `#${journalId}` : "—");

              if (check.check_code === "CLOSED_PERIOD_CONTROL") {
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {journalId ? (
                        <Link
                          to={`/finance/journals/${journalId}`}
                          className="inline-flex items-center gap-1 text-brandBlueTeal-600 hover:text-brandBlueTeal-700 hover:underline"
                          title="Buka rincian jurnal"
                        >
                          <span>{journalNumber}</span>
                          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                        </Link>
                      ) : (
                        <span>{journalNumber}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{formatFinanceDate(err.transaction_date)}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-red-600 whitespace-nowrap">
                      {err.created_at ? String(err.created_at) : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {err.closed_at ? String(err.closed_at) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-red-700 font-medium">
                      {String(err.reason || err.message || "Jurnal dibuat setelah periode ditutup")}
                    </td>
                  </tr>
                );
              }

              if (check.check_code === "DONATION_RECONCILIATION") {
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      Donasi #{String(err.reference_id || err.donation_id || "—")}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{formatFinanceDate(err.transaction_date)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-brandGreen-700 whitespace-nowrap">
                      {err.amount != null ? formatRupiah(err.amount) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-red-700 font-medium">
                      {String(err.reason || err.message || "Donasi belum memiliki entri jurnal terposting")}
                    </td>
                  </tr>
                );
              }

              if (check.check_code === "ALLOCATION_RECONCILIATION") {
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      Penyaluran #{String(err.reference_id || err.allocation_id || "—")}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{formatFinanceDate(err.transaction_date)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {err.amount != null ? formatRupiah(err.amount) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-red-700 font-medium">
                      {String(err.reason || err.message || "Penyaluran belum memiliki entri jurnal terposting")}
                    </td>
                  </tr>
                );
              }

              if (check.check_code === "JOURNAL_BALANCE") {
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {journalId ? (
                        <Link
                          to={`/finance/journals/${journalId}`}
                          className="inline-flex items-center gap-1 text-brandBlueTeal-600 hover:text-brandBlueTeal-700 hover:underline"
                          title="Buka rincian jurnal"
                        >
                          <span>{journalNumber}</span>
                          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                        </Link>
                      ) : (
                        <span>{journalNumber}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                      {err.total_debit != null ? formatRupiah(err.total_debit) : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                      {err.total_credit != null ? formatRupiah(err.total_credit) : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-red-600 font-bold whitespace-nowrap">
                      {err.difference != null ? formatRupiah(err.difference) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-red-700 font-medium">
                      {String(err.reason || err.message || "Debit tidak seimbang dengan Kredit")}
                    </td>
                  </tr>
                );
              }

              // Generic fallback row
              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {journalId ? (
                      <Link
                        to={`/finance/journals/${journalId}`}
                        className="inline-flex items-center gap-1 text-brandBlueTeal-600 hover:text-brandBlueTeal-700 hover:underline"
                      >
                        <span>{journalNumber}</span>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                      </Link>
                    ) : (
                      err.reference_id ? `#${String(err.reference_id)}` : journalNumber
                    )}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{formatFinanceDate(err.transaction_date)}</td>
                  <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                    {err.amount != null
                      ? formatRupiah(err.amount)
                      : err.difference != null
                      ? formatRupiah(err.difference)
                      : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-red-700 font-medium">
                    {String(err.reason || err.message || "Anomali terdeteksi pada titik kontrol")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
            <span>Sebelumnya</span>
          </button>

          <span className="text-xs font-semibold text-slate-600">
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari{" "}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Selanjutnya</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
          </button>
        </div>
      )}
    </div>
  );
};
