import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import type { ImportModule, AccountingPeriod } from "@/types/finance";
import type { ModuleConfig, CombinedPreviewData } from "./importTypes";

interface ImportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
  activeModuleConfig: ModuleConfig;
  selectedModule: ImportModule;
  selectedFile: File | null;
  previewResult: CombinedPreviewData | null;
  periods: AccountingPeriod[];
  selectedPeriodId: number | "";
  canConfirm: boolean;
}

export function ImportConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  confirming,
  activeModuleConfig,
  selectedModule,
  selectedFile,
  previewResult,
  periods,
  selectedPeriodId,
  canConfirm,
}: ImportConfirmModalProps) {
  if (!isOpen) return null;

  const failed = previewResult ? (previewResult.type === "journals" ? previewResult.data.failed_journals : previewResult.data.failed_rows) : 0;
  const valid = previewResult ? (previewResult.type === "journals" ? previewResult.data.valid_journals : previewResult.data.valid_rows) : 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-import-title">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              <span id="confirm-import-title">Konfirmasi Impor Data</span>
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Pastikan modul, periode, dan file sudah benar.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Modul:</span>
            <span className="font-bold text-slate-900">{activeModuleConfig.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">File:</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">
              {selectedFile?.name}
            </span>
          </div>
          {previewResult && (
            <>
              <div className="flex justify-between"><span className="text-slate-500">Valid:</span><span className="font-bold text-slate-900">{valid}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Bermasalah:</span><span className="font-bold text-slate-900">{failed}</span></div>
            </>
          )}
          {selectedModule === "opening_balance" && (
            <div className="flex justify-between">
              <span className="text-slate-500">Periode:</span>
              <span className="font-bold text-slate-900">
                {periods.find((p) => p.id === Number(selectedPeriodId))?.period_name ||
                  `Periode #${selectedPeriodId}`}
              </span>
            </div>
          )}
        </div>

        <p className="text-[11px] font-medium text-slate-500">
          Pastikan data hasil validasi telah diperiksa sebelum melanjutkan.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming || !canConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirming ? "Memproses..." : "Konfirmasi Impor"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportConfirmModal;
