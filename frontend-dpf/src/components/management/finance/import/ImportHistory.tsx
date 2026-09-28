import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport, faEye } from "@fortawesome/free-solid-svg-icons";
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

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-heading text-base font-bold text-slate-900">
            Riwayat Batch Import
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Daftar seluruh proses import data keuangan yang tercatat di audit log.
          </p>
        </div>

        {/* Module Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onFilterModuleChange("all")}
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
            onClick={() => onFilterModuleChange("accounts")}
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
            onClick={() => onFilterModuleChange("journals")}
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
            onClick={() => onFilterModuleChange("opening_balance")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterModule === "opening_balance"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Saldo Awal
          </button>
        </div>
      </div>

      {/* History Table Content */}
      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat histori import"
          message={error}
          onRetry={onRetry}
        />
      ) : loading ? (
        <div className="py-4">
          <FinanceTableSkeleton rows={4} cols={6} />
        </div>
      ) : filteredHistory.length === 0 ? (
        <FinanceEmptyState
          title="Belum Ada Riwayat Import"
          description="Belum ada proses import file Excel yang tercatat pada filter ini. Mulai dengan memilih modul dan mengunggah template."
          icon={faFileImport}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
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
              {filteredHistory.map((item) => {
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
                    <td className="px-3.5 py-3 text-slate-700">{item.user || "Admin Finance"}</td>
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
      )}
    </div>
  );
}

export default ImportHistory;
