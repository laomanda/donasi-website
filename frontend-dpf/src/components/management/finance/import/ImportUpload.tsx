import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faCloudArrowUp, faFileExcel, faTrashCan, faTriangleExclamation, faCircleInfo, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "@/components/ui/ToastProvider";
import { SearchableSelect } from "@/components/management/finance/shared";
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
  periodsError?: string | null;
}

export function ImportUpload({
  activeModuleConfig, selectedModule, selectedFile, onSelectFile, onResetFile, onDownloadTemplate,
  downloadingTemplate, onPreview, previewing, confirming, previewError, periods, selectedPeriodId,
  onSelectPeriodId, loadingPeriods, periodsError,
}: ImportUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (file: File) => {
    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
      toast.error("File harus berformat Excel (.xlsx atau .xls).");
      return;
    }
    if (selectedModule === "journals" && file.size > 15 * 1024 * 1024) {
      toast.error("Ukuran file melebihi batas maksimum 15 MB.");
      return;
    }
    onSelectFile(file);
  };

  const drop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-slate-900">Impor {activeModuleConfig.shortName}</h2>
          <p className="mt-1 text-xs text-slate-500">Gunakan template resmi sebelum melakukan impor.</p>
        </div>
        <button type="button" onClick={onDownloadTemplate} disabled={downloadingTemplate} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50">
          <FontAwesomeIcon icon={faDownload} />
          {downloadingTemplate ? "Mengunduh..." : "Unduh Template"}
        </button>
      </div>

      {selectedModule === "opening_balance" && (
        <div className="max-w-xl space-y-2">
          <label htmlFor="period_selector" className="text-xs font-bold text-slate-700">Periode Akuntansi <span className="text-red-600">*</span></label>
          <SearchableSelect<number | "">
            id="period_selector"
            value={selectedPeriodId}
            onChange={(value) => onSelectPeriodId(value === "" ? "" : Number(value))}
            options={periods.map((period) => ({ value: period.id, label: period.period_name || period.name || `Periode #${period.id}`, badge: "Terbuka", badgeColor: "bg-brandGreen-500 text-white" }))}
            placeholder="Pilih periode akuntansi"
            searchPlaceholder="Cari periode..."
            icon={faCalendarAlt}
            disabled={loadingPeriods || previewing || confirming || Boolean(periodsError)}
            clearable
            onClear={() => onSelectPeriodId("")}
          />
          {periodsError && <p className="text-xs text-red-600">{periodsError}</p>}
          {!loadingPeriods && !periodsError && periods.length === 0 && <p className="text-xs text-orange-700">Tidak ada periode terbuka yang tersedia.</p>}
        </div>
      )}

      <div
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={drop}
        className={`rounded-xl border border-dashed p-5 transition ${isDragging ? "border-primary-500 bg-primary-500/5" : "border-slate-300 bg-slate-50/60"}`}
      >
        {selectedFile ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white"><FontAwesomeIcon icon={faFileExcel} /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">Ukuran {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Excel</p>
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <button type="button" onClick={onResetFile} disabled={previewing || confirming} className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:flex-none"><FontAwesomeIcon icon={faTrashCan} /> Ganti File</button>
              <button type="button" onClick={onPreview} disabled={previewing || confirming || (selectedModule === "opening_balance" && !selectedPeriodId)} className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-4 text-xs font-bold text-white shadow-xs hover:bg-primary-600 disabled:opacity-50 sm:flex-none"><FontAwesomeIcon icon={faCloudArrowUp} /> {previewing ? "Memvalidasi..." : "Validasi File"}</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-xl text-slate-500" />
            <p className="text-sm font-semibold text-slate-800">Tarik file Excel ke sini atau pilih dari perangkat.</p>
            <p className="text-xs text-slate-500">Format yang diterima: .xlsx atau .xls</p>
            <label className="inline-flex min-h-9 cursor-pointer items-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800">
              Pilih File
              <input type="file" accept=".xlsx,.xls" onChange={(event) => event.target.files?.[0] && validateAndSetFile(event.target.files[0])} className="sr-only" />
            </label>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-600"><FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 text-slate-400" /><span>File akan divalidasi terlebih dahulu dan belum disimpan ke database.</span></div>
      {previewError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-red-600" />
          <div className="space-y-0.5">
            <p className="font-bold">Validasi File Gagal</p>
            <p className="font-normal text-red-700">{previewError}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportUpload;
