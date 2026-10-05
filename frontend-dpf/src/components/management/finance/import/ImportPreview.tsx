import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
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

export function ImportPreview({ activeModuleConfig, previewResult, lastImportResult, onClearLastResult, onCancelPreview, onRequestConfirm }: ImportPreviewProps) {
  if (!previewResult && !lastImportResult) return null;
  const failed = previewResult ? (previewResult.type === "journals" ? previewResult.data.failed_journals : previewResult.data.failed_rows) : 0;
  const errors = previewResult?.data.errors ?? [];
  const valid = Boolean(previewResult && previewResult.data.batch_token && failed === 0 && errors.length === 0);

  return (
    <div className="space-y-4 border-t border-slate-100 pt-5">
      {previewResult && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hasil Validasi</h3>
              <p className="mt-0.5 text-xs text-slate-500">{activeModuleConfig.shortName} · hasil pemeriksaan server</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white ${valid ? "bg-brandGreen-500" : "bg-red-600"}`}>
                <FontAwesomeIcon icon={valid ? faCheck : faTriangleExclamation} />
                {valid ? "Validasi Berhasil" : "Perlu Diperbaiki"}
              </span>
              <button type="button" onClick={onCancelPreview} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50">Ganti File</button>
              {valid && <button type="button" onClick={onRequestConfirm} className="rounded-lg bg-primary-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-primary-600">Konfirmasi Impor</button>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-slate-200 py-3 text-xs">
            <span className="font-bold text-slate-500">Total <strong className="ml-1 text-slate-900">{previewResult.data.total_rows}</strong></span>
            <span className="font-bold text-slate-500">Valid <strong className="ml-1 text-brandGreen-600">{previewResult.type === "journals" ? previewResult.data.valid_journals : previewResult.data.valid_rows}</strong></span>
            <span className="font-bold text-slate-500">Bermasalah <strong className={`ml-1 ${failed > 0 ? "text-red-600" : "text-slate-900"}`}>{failed}</strong></span>
            {previewResult.type === "journals" && <span className="font-bold text-slate-500">Jurnal <strong className="ml-1 text-slate-900">{previewResult.data.total_journals}</strong></span>}
            {previewResult.type === "opening_balance" && <span className="font-bold text-slate-500">Debit <strong className="ml-1 text-slate-900">{formatRupiah(previewResult.data.total_debit)}</strong></span>}
          </div>

          {errors.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-900 px-3 py-2 text-xs font-bold text-white">Diagnostik Validasi ({errors.length})</div>
              <div className="hidden md:block">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white"><tr><th className="w-24 px-3 py-2">Baris</th><th className="px-3 py-2">Pesan</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white">{errors.map((item: ImportErrorItem, index) => <tr key={index} className="hover:bg-slate-50"><td className="px-3 py-2 font-mono font-bold text-slate-700">{item.row > 0 ? item.row : "-"}</td><td className="px-3 py-2 text-slate-700">{item.message || "Tidak tersedia"}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="divide-y divide-slate-100 bg-white md:hidden">{errors.map((item: ImportErrorItem, index) => <div key={index} className="p-3 text-xs"><p className="font-mono font-bold text-slate-500">Baris {item.row > 0 ? item.row : "-"}</p><p className="mt-1 text-slate-700">{item.message || "Tidak tersedia"}</p></div>)}</div>
            </div>
          )}
        </div>
      )}

      {lastImportResult && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-brandGreen-500 bg-white p-4">
          <div><p className="text-sm font-bold text-slate-900">Impor Berhasil</p><p className="mt-1 text-xs text-slate-600">{lastImportResult.message || "Data berhasil diproses."}</p><p className="mt-2 text-xs font-semibold text-slate-700">Batch #{lastImportResult.batch_id ?? "-"} · {lastImportResult.success_rows ?? 0} berhasil · {lastImportResult.failed_rows ?? 0} gagal</p></div>
          <button type="button" onClick={onClearLastResult} className="text-slate-400 hover:text-slate-700" aria-label="Tutup hasil"><FontAwesomeIcon icon={faXmark} /></button>
        </div>
      )}
    </div>
  );
}

export default ImportPreview;
