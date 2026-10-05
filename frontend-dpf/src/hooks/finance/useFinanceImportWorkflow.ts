import { useCallback, useMemo, useRef, useState } from "react";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import type { ImportConfirmResponse, ImportModule, ImportPreviewResponse } from "@/types/finance";
import type { CombinedPreviewData, LastImportSummary } from "@/components/management/finance/import/importTypes";

type PreviewResponse =
  | ImportPreviewResponse<CombinedPreviewData["data"]>
  | ImportPreviewResponse<never>;

interface UseFinanceImportWorkflowOptions {
  module: ImportModule;
  periodId: number | "";
  onImportSuccess?: (result: ImportConfirmResponse) => void;
}

export function useFinanceImportWorkflow({ module, periodId, onImportSuccess }: UseFinanceImportWorkflowOptions) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewResult, setPreviewResult] = useState<CombinedPreviewData | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<LastImportSummary | null>(null);
  const [previewStatus, setPreviewStatus] = useState<"success" | "failed" | null>(null);
  const confirmingRef = useRef(false);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setPreviewResult(null);
    setPreviewError(null);
    setLastImportResult(null);
    setPreviewStatus(null);
  }, []);

  const selectFile = useCallback((file: File | null) => {
    setSelectedFile(file);
    setPreviewResult(null);
    setPreviewError(null);
    setLastImportResult(null);
    setPreviewStatus(null);
  }, []);

  const preview = useCallback(async () => {
    if (!selectedFile) throw new Error("Silakan pilih file Excel terlebih dahulu.");
    if (module === "opening_balance" && !periodId) {
      throw new Error("Pilih periode akuntansi untuk import saldo awal.");
    }

    setPreviewing(true);
    setPreviewError(null);
    setPreviewResult(null);
    setPreviewStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      let response: PreviewResponse;
      if (module === "accounts") {
        response = await financeService.previewAccountsImport(formData);
      } else if (module === "journals") {
        response = await financeService.previewJournalsImport(formData);
      } else {
        formData.append("accounting_period_id", String(periodId));
        formData.append("period_id", String(periodId));
        response = await financeService.previewOpeningBalanceImport(formData);
      }
      const result = { type: module, data: response.data } as CombinedPreviewData;
      setPreviewResult(result);
      setPreviewStatus(response.status);
      return result;
    } catch (error) {
      const message = extractFinanceErrorMessage(error, "Gagal memproses validasi file.");
      setPreviewError(message);
      throw new Error(message);
    } finally {
      setPreviewing(false);
    }
  }, [module, periodId, selectedFile]);

  const confirm = useCallback(async () => {
    if (!previewResult?.data.batch_token) {
      throw new Error("Token validasi tidak ditemukan. Silakan lakukan validasi ulang.");
    }
    if (module === "opening_balance" && !periodId) {
      throw new Error("Periode akuntansi wajib dipilih.");
    }
    if (confirmingRef.current) return null;
    const failed = previewResult.type === "journals" ? previewResult.data.failed_journals : previewResult.data.failed_rows;
    if (previewStatus !== "success" || failed > 0 || previewResult.data.errors.length > 0) {
      throw new Error("File belum dapat diimpor. Perbaiki hasil validasi terlebih dahulu.");
    }

    confirmingRef.current = true;
    setConfirming(true);
    try {
      const token = previewResult.data.batch_token;
      const result = module === "accounts"
        ? await financeService.confirmAccountsImport({ batch_token: token })
        : module === "journals"
        ? await financeService.confirmJournalsImport({ batch_token: token })
        : await financeService.confirmOpeningBalanceImport({
            batch_token: token,
            accounting_period_id: Number(periodId),
            period_id: Number(periodId),
          });
      setLastImportResult(result);
      setPreviewResult(null);
      setSelectedFile(null);
      onImportSuccess?.(result);
      return result;
    } catch (error) {
      throw new Error(extractFinanceErrorMessage(error, "Gagal mengonfirmasi impor data."));
    } finally {
      confirmingRef.current = false;
      setConfirming(false);
    }
  }, [confirming, module, onImportSuccess, periodId, previewResult]);

  const previewIsValid = useMemo(() => {
    if (!previewResult || previewStatus !== "success") return false;
    const data = previewResult.data;
    const failed = previewResult.type === "journals" ? previewResult.data.failed_journals : previewResult.data.failed_rows;
    return data.batch_token !== null && failed === 0 && data.errors.length === 0;
  }, [previewResult, previewStatus]);

  const workflowStep = lastImportResult ? 5 : previewResult ? (previewIsValid ? 4 : 3) : selectedFile ? 2 : 1;

  return { selectedFile, previewResult, previewError, previewing, confirming, lastImportResult, previewIsValid, workflowStep, selectFile, reset, preview, confirm, clearLastImportResult: () => setLastImportResult(null) };
}
