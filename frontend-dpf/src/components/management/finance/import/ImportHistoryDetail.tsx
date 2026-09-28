import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileImport,
  faXmark,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  FinanceTableSkeleton,
  FinanceErrorState,
  FinanceStatusBadge,
} from "@/components/management/finance/shared";
import type { ImportHistoryDetail as ImportHistoryDetailType } from "@/types/finance";

interface ImportHistoryDetailProps {
  batchId: number | null;
  batchDetail: ImportHistoryDetailType | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export function ImportHistoryDetail({
  batchId,
  batchDetail,
  loading,
  error,
  onRetry,
  onClose,
}: ImportHistoryDetailProps) {
  if (!batchId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FontAwesomeIcon icon={faFileImport} />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900">
                Detail Batch Import #{batchId}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Informasi audit dan log validasi baris batch import.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {loading ? (
            <div className="py-8">
              <FinanceTableSkeleton rows={3} cols={3} />
            </div>
          ) : error ? (
            <FinanceErrorState
              title="Gagal Memuat Detail"
              message={error}
              onRetry={onRetry}
            />
          ) : batchDetail ? (
            <>
              {/* Batch Summary Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-bold text-slate-500">Berkas</p>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {batchDetail.batch?.filename || batchDetail.batch?.file_name || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-bold text-slate-500">Status</p>
                  <div className="mt-0.5">
                    <FinanceStatusBadge status={batchDetail.batch?.status || "completed"} />
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-[11px] font-bold text-emerald-700">Berhasil</p>
                  <p className="text-sm font-extrabold text-emerald-800 tabular-nums mt-0.5">
                    {batchDetail.batch?.success_rows ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                  <p className="text-[11px] font-bold text-rose-700">Gagal</p>
                  <p className="text-sm font-extrabold text-rose-800 tabular-nums mt-0.5">
                    {batchDetail.batch?.failed_rows ?? 0}
                  </p>
                </div>
              </div>

              {/* Errors List */}
              {batchDetail.errors && batchDetail.errors.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-900">
                    Catatan Error Baris ({batchDetail.errors.length})
                  </p>
                  <div className="overflow-hidden rounded-xl border border-rose-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-rose-50 font-bold text-rose-900 border-b border-rose-100">
                        <tr>
                          <th className="w-20 px-3 py-2">Baris</th>
                          <th className="px-3 py-2">Pesan Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {batchDetail.errors.map((err, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-mono font-bold text-slate-800">
                              {err.row > 0 ? `Baris ${err.row}` : "-"}
                            </td>
                            <td className="px-3 py-2 font-medium text-rose-700">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 text-lg mb-1" />
                  <p className="text-xs font-bold text-emerald-900">
                    Seluruh Baris Berhasil Diproses
                  </p>
                  <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                    Tidak ada error validasi pada batch import ini.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportHistoryDetail;
