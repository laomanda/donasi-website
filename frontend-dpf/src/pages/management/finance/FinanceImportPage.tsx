import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";

import { FinancePageHeader } from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type {
  ImportModule,
  ImportHistoryItem,
  ImportHistoryDetail as ImportHistoryDetailType,
  AccountingPeriod,
} from "@/types/finance";
import {
  extractFinanceErrorMessage,
  downloadBlobFile,
} from "@/utils/financeUtils";

import {
  MODULE_CONFIGS,
  type CombinedPreviewData,
  type LastImportSummary,
  ImportModuleSelector,
  ImportWorkflow,
  ImportUpload,
  ImportPreview,
  ImportConfirmModal,
  ImportHistory,
  ImportHistoryDetail,
} from "@/components/management/finance/import";

export function FinanceImportPage() {
  // Module selection
  const [selectedModule, setSelectedModule] = useState<ImportModule>("accounts");

  // Periods for Opening Balance
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | "">("");
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  // File Upload & Preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<CombinedPreviewData | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Download template state
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Confirm state & modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<LastImportSummary | null>(null);

  // History state
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyFilterModule, setHistoryFilterModule] = useState<string>("all");

  // History Detail Modal
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [batchDetail, setBatchDetail] = useState<ImportHistoryDetailType | null>(null);
  const [loadingBatchDetail, setLoadingBatchDetail] = useState(false);
  const [batchDetailError, setBatchDetailError] = useState<string | null>(null);

  // Current active module config
  const activeModuleConfig = useMemo(
    () => MODULE_CONFIGS.find((m) => m.id === selectedModule) || MODULE_CONFIGS[0],
    [selectedModule]
  );

  // Fetch accounting periods for Opening Balance
  const fetchPeriods = useCallback(async () => {
    setLoadingPeriods(true);
    try {
      const data = await financeService.getAccountingPeriods();
      const openPeriods = data.filter((p) => p.status === "open" || !p.is_closed);
      setPeriods(data);
      if (openPeriods.length > 0) {
        setSelectedPeriodId(openPeriods[0].id);
      } else if (data.length > 0) {
        setSelectedPeriodId(data[0].id);
      }
    } catch {
      // Non-critical if offline or unauthenticated
    } finally {
      setLoadingPeriods(false);
    }
  }, []);

  // Fetch import history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await financeService.getImportHistory();
      const list = Array.isArray(res) ? res : res?.data || [];
      setHistory(list);
    } catch (err) {
      setHistoryError(extractFinanceErrorMessage(err, "Gagal memuat histori import data."));
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void fetchPeriods();
    void fetchHistory();
  }, [fetchPeriods, fetchHistory]);

  // Handle module switch
  const handleModuleChange = (moduleId: ImportModule) => {
    if (moduleId === selectedModule) return;
    setSelectedModule(moduleId);
    setSelectedFile(null);
    setPreviewResult(null);
    setPreviewError(null);
    setLastImportResult(null);
  };

  // Handle Download Template
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      let blob: BlobPart;
      if (selectedModule === "accounts") {
        blob = await financeService.getAccountsTemplate();
      } else if (selectedModule === "journals") {
        blob = await financeService.getJournalsTemplate();
      } else {
        blob = await financeService.getOpeningBalanceTemplate();
      }
      downloadBlobFile(blob, activeModuleConfig.templateFileName);
      toast.success(`Template ${activeModuleConfig.shortName} berhasil diunduh.`);
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh file template Excel."));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // Reset file upload & preview
  const handleResetUpload = () => {
    setSelectedFile(null);
    setPreviewResult(null);
    setPreviewError(null);
    setLastImportResult(null);
  };

  // Handle Preview Action
  const handlePreview = async () => {
    if (!selectedFile) {
      toast.error("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    if (selectedModule === "opening_balance" && !selectedPeriodId) {
      toast.error("Pilih periode akuntansi untuk import saldo awal.");
      return;
    }

    setPreviewing(true);
    setPreviewError(null);
    setPreviewResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      if (selectedModule === "accounts") {
        const res = await financeService.previewAccountsImport(formData);
        setPreviewResult({ type: "accounts", data: res.data });
        if (res.status === "success" && (res.data?.failed_rows || 0) === 0) {
          toast.success("Validasi Daftar Akun berhasil. Data siap diimport.");
        } else {
          toast.error("Ditemukan error validasi pada file Excel.");
        }
      } else if (selectedModule === "journals") {
        const res = await financeService.previewJournalsImport(formData);
        setPreviewResult({ type: "journals", data: res.data });
        if (res.status === "success" && (res.data?.failed_journals || 0) === 0) {
          toast.success("Validasi Jurnal Umum berhasil. Data siap diimport.");
        } else {
          toast.error("Ditemukan error validasi pada entri jurnal.");
        }
      } else {
        formData.append("accounting_period_id", String(selectedPeriodId));
        formData.append("period_id", String(selectedPeriodId));
        const res = await financeService.previewOpeningBalanceImport(formData);
        setPreviewResult({ type: "opening_balance", data: res.data });
        if (res.status === "success" && (res.data?.failed_rows || 0) === 0) {
          toast.success("Validasi Saldo Awal berhasil. Data siap diimport.");
        } else {
          toast.error("Ditemukan error validasi pada saldo awal.");
        }
      }
    } catch (err: unknown) {
      const msg = extractFinanceErrorMessage(err, "Gagal memproses validasi preview file.");
      setPreviewError(msg);
      toast.error(msg);
    } finally {
      setPreviewing(false);
    }
  };

  // Execute Confirmation of Import
  const handleConfirmImport = async () => {
    if (!previewResult) return;
    const token = previewResult.data.batch_token;
    if (!token) {
      toast.error("Token validasi tidak ditemukan. Silakan lakukan preview ulang.");
      return;
    }

    setConfirming(true);
    try {
      let res;
      if (previewResult.type === "accounts") {
        res = await financeService.confirmAccountsImport({ batch_token: token });
      } else if (previewResult.type === "journals") {
        res = await financeService.confirmJournalsImport({ batch_token: token });
      } else {
        res = await financeService.confirmOpeningBalanceImport({
          batch_token: token,
          accounting_period_id: Number(selectedPeriodId),
          period_id: Number(selectedPeriodId),
        });
      }

      setLastImportResult(res);
      setConfirmModalOpen(false);
      setPreviewResult(null);
      setSelectedFile(null);
      toast.success(res.message || "Import data keuangan berhasil dieksekusi.");
      void fetchHistory();
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengonfirmasi import data ke database."));
    } finally {
      setConfirming(false);
    }
  };

  // Open Batch History Detail
  const handleOpenBatchDetail = async (batchId: number) => {
    setSelectedBatchId(batchId);
    setLoadingBatchDetail(true);
    setBatchDetail(null);
    setBatchDetailError(null);
    try {
      const res = await financeService.getImportHistoryDetail(batchId);
      setBatchDetail(res);
    } catch (err) {
      setBatchDetailError(extractFinanceErrorMessage(err, "Gagal memuat detail batch import."));
    } finally {
      setLoadingBatchDetail(false);
    }
  };

  const handleCloseBatchDetail = () => {
    setSelectedBatchId(null);
    setBatchDetail(null);
  };

  // Derive workflow step
  const currentStep = useMemo(() => {
    if (lastImportResult) return 5;
    if (!selectedFile) return 1;
    if (!previewResult) return 2;
    const isFailed =
      (previewResult.type === "journals"
        ? previewResult.data.failed_journals
        : previewResult.data.failed_rows) > 0 || (previewResult.data.errors?.length || 0) > 0;
    return isFailed ? 3 : 4;
  }, [selectedFile, previewResult, lastImportResult]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <FinancePageHeader
        title="Import Data Finance"
        description="Kelola import data keuangan melalui template resmi, validasi preview server-side, dan konfirmasi posting terstruktur."
        actions={
          <button
            type="button"
            onClick={fetchHistory}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            Segarkan Histori
          </button>
        }
      />

      {/* 2. Module Selector */}
      <ImportModuleSelector
        selectedModule={selectedModule}
        onSelectModule={handleModuleChange}
        disabled={previewing || confirming}
      />

      {/* 3. Workflow Steps Indicator */}
      <ImportWorkflow currentStep={currentStep} />

      {/* 4. Main Upload & Preview Panel */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <ImportUpload
          activeModuleConfig={activeModuleConfig}
          selectedModule={selectedModule}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
          onResetFile={handleResetUpload}
          onDownloadTemplate={handleDownloadTemplate}
          downloadingTemplate={downloadingTemplate}
          onPreview={handlePreview}
          previewing={previewing}
          confirming={confirming}
          previewError={previewError}
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          onSelectPeriodId={setSelectedPeriodId}
          loadingPeriods={loadingPeriods}
        />

        <ImportPreview
          activeModuleConfig={activeModuleConfig}
          previewResult={previewResult}
          lastImportResult={lastImportResult}
          onClearLastResult={() => setLastImportResult(null)}
          onCancelPreview={handleResetUpload}
          onRequestConfirm={() => setConfirmModalOpen(true)}
        />
      </div>

      {/* 5. Import History Section */}
      <ImportHistory
        history={history}
        loading={loadingHistory}
        error={historyError}
        onRetry={fetchHistory}
        filterModule={historyFilterModule}
        onFilterModuleChange={setHistoryFilterModule}
        onOpenDetail={handleOpenBatchDetail}
      />

      {/* 6. Confirmation Modal Dialog */}
      <ImportConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmImport}
        confirming={confirming}
        activeModuleConfig={activeModuleConfig}
        selectedModule={selectedModule}
        selectedFile={selectedFile}
        previewResult={previewResult}
        periods={periods}
        selectedPeriodId={selectedPeriodId}
      />

      {/* 7. History Detail Modal Dialog */}
      <ImportHistoryDetail
        batchId={selectedBatchId}
        batchDetail={batchDetail}
        loading={loadingBatchDetail}
        error={batchDetailError}
        onRetry={() => selectedBatchId && handleOpenBatchDetail(selectedBatchId)}
        onClose={handleCloseBatchDetail}
      />
    </div>
  );
}

export default FinanceImportPage;
