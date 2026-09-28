import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faCloudArrowUp,
  faFileExcel,
  faTrashCan,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import type { ImportModule, AccountingPeriod } from "@/types/finance";
import type { ModuleConfig } from "./importTypes";

interface ImportUploadProps {
  activeModuleConfig: ModuleConfig;
  selectedModule: ImportModule;
  selectedFile: File | null;
  onSelectFile: (file: File | null) => void;
  onResetFile: () => void;
  onDownloadTemplate: () => void;
  downloadingTemplate: boolean;
  onPreview: () => void;
  previewing: boolean;
  confirming: boolean;
  previewError: string | null;
  periods: AccountingPeriod[];
  selectedPeriodId: number | "";
  onSelectPeriodId: (periodId: number | "") => void;
  loadingPeriods: boolean;
}

export function ImportUpload({
  activeModuleConfig,
  selectedModule,
  selectedFile,
  onSelectFile,
  onResetFile,
  onDownloadTemplate,
  downloadingTemplate,
  onPreview,
  previewing,
  confirming,
  previewError,
  periods,
  selectedPeriodId,
  onSelectPeriodId,
  loadingPeriods,
}: ImportUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      toast.error("Format file harus berupa Excel (.xlsx atau .xls)");
      return;
    }
    onSelectFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-bold text-slate-900">
              Import {activeModuleConfig.title}
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Gunakan template resmi untuk memastikan struktur kolom dan validitas data akuntansi.
          </p>
        </div>

        {/* Download Template Action Button */}
        <button
          type="button"
          onClick={onDownloadTemplate}
          disabled={downloadingTemplate}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-2xs transition hover:bg-emerald-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faDownload} />
          {downloadingTemplate ? "Mengunduh..." : `Unduh Template ${activeModuleConfig.shortName}`}
        </button>
      </div>

      {/* Special Period Selector for Saldo Awal */}
      {selectedModule === "opening_balance" && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label htmlFor="period_selector" className="text-xs font-bold text-indigo-900">
                Target Periode Akuntansi Saldo Awal <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] font-medium text-indigo-700 mt-0.5">
                Saldo awal hanya dapat diimport ke periode akuntansi dengan status Terbuka (Open).
              </p>
            </div>

            <select
              id="period_selector"
              value={selectedPeriodId}
              onChange={(e) => onSelectPeriodId(e.target.value ? Number(e.target.value) : "")}
              disabled={loadingPeriods || previewing || confirming}
              className="w-full sm:w-64 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">-- Pilih Periode Akuntansi --</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.period_name || p.name} ({p.status === "open" || !p.is_closed ? "Terbuka" : "Tutup"})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Upload Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/60"
            : selectedFile
            ? "border-slate-300 bg-slate-50/50"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/40"
        }`}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-2xs">
              <FontAwesomeIcon icon={faFileExcel} className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Format Excel Terpilih
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onResetFile}
                disabled={previewing || confirming}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-[11px] text-slate-400" />
                Ganti File
              </button>

              <button
                type="button"
                onClick={onPreview}
                disabled={previewing || confirming}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faCloudArrowUp} />
                {previewing ? "Memvalidasi Data..." : "Preview & Validasi Data"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FontAwesomeIcon icon={faCloudArrowUp} className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Tarik & letakkan file Excel di sini, atau klik tombol di bawah
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Mendukung file berekstensi .xlsx atau .xls (Maksimum 10 MB)
              </p>
            </div>

            <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 active:scale-95">
              <span>Pilih File Excel</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Preview Error Banner */}
      {previewError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-900">Gagal Memvalidasi File</p>
              <p className="text-xs font-medium text-rose-700 mt-0.5">{previewError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportUpload;
