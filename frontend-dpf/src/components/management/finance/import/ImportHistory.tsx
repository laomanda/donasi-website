import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport, faEye, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import {
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  FinanceStatusBadge,
} from "@/components/management/finance/shared";
import type { ImportHistoryItem } from "@/types/finance";
import { formatFinanceDate } from "@/utils/financeUtils";

interface ImportHistoryProps {
  history: ImportHistoryItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  filterModule: string;
  onFilterModuleChange: (mod: string) => void;
  onOpenDetail: (batchId: number) => void;
}

export function ImportHistory({
  history,
  loading,
  error,
  onRetry,
  filterModule,
  onFilterModuleChange,
  onOpenDetail,
}: ImportHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const filteredHistory = useMemo(() => {
    if (filterModule === "all") return history;
    return history.filter((item) => {
      const mod = (item.module || "").toLowerCase();
      if (filterModule === "accounts") return mod.includes("account") || mod === "accounts";
      if (filterModule === "journals") return mod.includes("journal") || mod === "journal_entries";
      if (filterModule === "opening_balance") return mod.includes("opening") || mod === "opening_balance";
      return true;
    });
  }, [history, filterModule]);
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * perPage;
  const paginatedHistory = filteredHistory.slice(pageStart, pageStart + perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterModule, history]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const selectFilter = (module: string) => {
    setCurrentPage(1);
    onFilterModuleChange(module);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-heading text-base font-bold text-slate-900">
            Riwayat Impor
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Catatan batch impor yang telah diproses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => selectFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterModule === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Modul
          </button>
          <button
            type="button"
            onClick={() => selectFilter("accounts")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterModule === "accounts"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Daftar Akun
          </button>
          <button
            type="button"
            onClick={() => selectFilter("journals")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterModule === "journals"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Jurnal Umum
          </button>
          <button
            type="button"
            onClick={() => selectFilter("opening_balance")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterModule === "opening_balance"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Saldo Awal
          </button>
          <button type="button" onClick={onRetry} disabled={loading} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50" title="Segarkan riwayat">
            <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} /> Segarkan
          </button>
        </div>
      </div>

      {/* History Table Content */}
      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat riwayat impor"
          message={error}
          onRetry={onRetry}
        />
      ) : loading ? (
        <div className="py-4">
          <FinanceTableSkeleton rows={4} cols={6} />
        </div>
      ) : filteredHistory.length === 0 ? (
        <FinanceEmptyState
          title="Belum Ada Riwayat Impor"
          description="Belum ada proses impor file Excel yang tercatat pada filter ini."
          icon={faFileImport}
        />
      ) : (
        <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900 font-bold text-white">
              <tr>
                <th className="px-3.5 py-3">ID Batch</th>
                <th className="px-3.5 py-3">Nama Berkas</th>
                <th className="px-3.5 py-3">Modul</th>
                <th className="px-3.5 py-3">Status</th>
                <th className="px-3.5 py-3 text-right">Total Baris</th>
                <th className="px-3.5 py-3 text-right">Berhasil</th>
                <th className="px-3.5 py-3 text-right">Gagal</th>
                <th className="px-3.5 py-3">User</th>
                <th className="px-3.5 py-3">Waktu</th>
                <th className="px-3.5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {paginatedHistory.map((item) => {
                const modLabel =
                  item.module === "accounts"
                    ? "Daftar Akun"
                    : item.module === "journal_entries" || item.module === "journals"
                    ? "Jurnal Umum"
                    : item.module === "opening_balance"
                    ? "Saldo Awal"
                    : item.module;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                      #{item.id}
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-slate-800">
                      {item.filename || item.file_name || "-"}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        {modLabel}
                      </span>
                    </td>
                    <td className="px-3.5 py-3">
                      <FinanceStatusBadge status={item.status} />
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono tabular-nums">
                      {item.total_rows ?? 0}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono tabular-nums text-emerald-700 font-bold">
                      {item.success_rows ?? 0}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono tabular-nums text-rose-700 font-bold">
                      {item.failed_rows ?? item.errors_count ?? 0}
                    </td>
                    <td className="px-3.5 py-3 text-slate-700">{item.user || "-"}</td>
                    <td className="px-3.5 py-3 text-slate-500 whitespace-nowrap">
                      {item.created_at ? formatFinanceDate(item.created_at) : "-"}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {paginatedHistory.map((item) => (
            <button key={item.id} type="button" onClick={() => onOpenDetail(item.id)} className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3"><span className="font-mono text-xs font-bold text-slate-900">#{item.id}</span><FinanceStatusBadge status={item.status} /></div>
              <p className="mt-2 truncate text-sm font-bold text-slate-900">{item.filename || item.file_name || "-"}</p>
              <p className="mt-1 text-xs text-slate-500">{item.module} · {formatFinanceDate(item.created_at)}</p>
              <p className="mt-2 text-xs font-semibold text-slate-600">{item.success_rows} berhasil · {item.failed_rows} gagal</p>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {filteredHistory.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + perPage, filteredHistory.length)} dari {filteredHistory.length} batch
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <label htmlFor="import-history-per-page" className="font-semibold">Tampilkan</label>
            <select id="import-history-per-page" value={perPage} onChange={(event) => { setPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-700">
              {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage <= 1} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Sebelumnya</button>
            <span className="whitespace-nowrap font-semibold">Halaman {safePage} dari {totalPages}</span>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safePage >= totalPages} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Selanjutnya</button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default ImportHistory;
