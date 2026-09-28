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
}: ImportConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Konfirmasi Import {activeModuleConfig.shortName}
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Pastikan data telah divalidasi sebelum commit ke database.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">
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
            <div className="flex justify-between">
              <span className="text-slate-500">Total Baris:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {previewResult.data.total_rows} baris
              </span>
            </div>
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
          Data yang telah dimasukkan akan secara otomatis memperbarui buku besar dan laporan keuangan terkait.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Batalkan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {confirming ? "Mengimport..." : "Import Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportConfirmModal;
