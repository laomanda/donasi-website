import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { ImportErrorItem } from "@/types/finance";
import { formatRupiah } from "@/utils/financeUtils";
import type { ModuleConfig, CombinedPreviewData, LastImportSummary } from "./importTypes";

interface ImportPreviewProps {
  activeModuleConfig: ModuleConfig;
  previewResult: CombinedPreviewData | null;
  lastImportResult: LastImportSummary | null;
  onClearLastResult: () => void;
  onCancelPreview: () => void;
  onRequestConfirm: () => void;
}

export function ImportPreview({
  activeModuleConfig,
  previewResult,
  lastImportResult,
  onClearLastResult,
  onCancelPreview,
  onRequestConfirm,
}: ImportPreviewProps) {
  if (!previewResult && !lastImportResult) {
    return null;
  }

  const isFailed = previewResult
    ? (previewResult.type === "journals"
        ? previewResult.data.failed_journals
        : previewResult.data.failed_rows) > 0 || (previewResult.data.errors?.length || 0) > 0
    : false;

  return (
    <div className="space-y-4">
      {/* Active Preview Panel */}
      {previewResult && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${
                  !isFailed ? "bg-emerald-600" : "bg-rose-600"
                }`}
              >
                <FontAwesomeIcon
                  icon={!isFailed ? faCheckCircle : faTriangleExclamation}
                  className="text-sm"
                />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Hasil Validasi Preview ({activeModuleConfig.shortName})
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {!isFailed
                    ? "Seluruh data valid dan siap diimport ke sistem."
                    : "Terdapat baris data yang belum memenuhi kriteria validasi akuntansi."}
                </p>
              </div>
            </div>

            {/* Action Buttons in Preview */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancelPreview}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
              >
                Batal
              </button>

              {!isFailed && (
                <button
                  type="button"
                  onClick={onRequestConfirm}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-95"
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Konfirmasi Import
                </button>
              )}
            </div>
          </div>

          {/* Metrics Chips / Stats per Module */}
          {previewResult.type === "accounts" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-bold text-slate-500">Total Baris</p>
                <p className="text-base font-extrabold text-slate-900 tabular-nums">
                  {previewResult.data.total_rows}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="text-[11px] font-bold text-emerald-700">Data Valid</p>
                <p className="text-base font-extrabold text-emerald-800 tabular-nums">
                  {previewResult.data.valid_rows}
                </p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                <p className="text-[11px] font-bold text-rose-700">Data Gagal</p>
                <p className="text-base font-extrabold text-rose-800 tabular-nums">
                  {previewResult.data.failed_rows}
                </p>
              </div>
            </div>
          )}

          {previewResult.type === "journals" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-bold text-slate-500">Total Baris Transaksi</p>
                <p className="text-base font-extrabold text-slate-900 tabular-nums">
                  {previewResult.data.total_rows}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-bold text-slate-500">Total Jurnal (Voucher)</p>
                <p className="text-base font-extrabold text-slate-900 tabular-nums">
                  {previewResult.data.total_journals}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="text-[11px] font-bold text-emerald-700">Jurnal Valid</p>
                <p className="text-base font-extrabold text-emerald-800 tabular-nums">
                  {previewResult.data.valid_journals}
                </p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                <p className="text-[11px] font-bold text-rose-700">Jurnal Gagal</p>
                <p className="text-base font-extrabold text-rose-800 tabular-nums">
                  {previewResult.data.failed_journals}
                </p>
              </div>
            </div>
          )}

          {previewResult.type === "opening_balance" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-bold text-slate-500">Total Akun</p>
                <p className="text-base font-extrabold text-slate-900 tabular-nums">
                  {previewResult.data.total_rows}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="text-[11px] font-bold text-emerald-700">Akun Valid</p>
                <p className="text-base font-extrabold text-emerald-800 tabular-nums">
                  {previewResult.data.valid_rows}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-bold text-slate-500">Total Mutasi Debit</p>
                <p className="text-xs font-extrabold text-slate-900 tabular-nums truncate">
                  {formatRupiah(previewResult.data.total_debit || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-bold text-slate-500">Total Mutasi Kredit</p>
                <p className="text-xs font-extrabold text-slate-900 tabular-nums truncate">
                  {formatRupiah(previewResult.data.total_credit || 0)}
                </p>
              </div>
            </div>
          )}

          {/* Error Table if errors exist */}
          {previewResult.data.errors && previewResult.data.errors.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-rose-900">
                  Daftar Baris yang Memerlukan Perbaikan ({previewResult.data.errors.length} error)
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  Perbaiki file Excel Anda dan lakukan upload ulang.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-rose-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-rose-100 bg-rose-50/60 font-bold text-rose-900">
                    <tr>
                      <th className="w-20 px-3.5 py-2">Baris</th>
                      <th className="px-3.5 py-2">Keterangan Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewResult.data.errors.map((errItem: ImportErrorItem, idx: number) => (
                      <tr key={idx} className="hover:bg-rose-50/20">
                        <td className="px-3.5 py-2 font-mono font-bold text-slate-800">
                          {errItem.row > 0 ? `Baris ${errItem.row}` : "Sistem"}
                        </td>
                        <td className="px-3.5 py-2 font-medium text-rose-700">
                          {errItem.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post-Confirm Success Notification */}
      {lastImportResult && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <FontAwesomeIcon icon={faCheckCircle} className="text-base" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-emerald-900">
                  Import Data Berhasil Dieksekusi
                </h4>
                <p className="text-xs font-medium text-emerald-700 mt-0.5">
                  {lastImportResult.message || "Seluruh data telah masuk dan diposting ke database keuangan."}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-900 mt-2">
                  {lastImportResult.batch_id && (
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5">
                      Batch #{lastImportResult.batch_id}
                    </span>
                  )}
                  <span>{lastImportResult.total_rows ?? 0} baris diproses</span>
                  <span>•</span>
                  <span className="text-emerald-700">{lastImportResult.success_rows ?? 0} berhasil</span>
                  <span>•</span>
                  <span className="text-slate-500">{lastImportResult.failed_rows ?? 0} gagal</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClearLastResult}
              className="text-slate-400 hover:text-slate-600"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportPreview;
