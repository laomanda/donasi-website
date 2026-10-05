import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useFinanceImportWorkflow } from "@/hooks/finance/useFinanceImportWorkflow";
import { useImportHistory } from "@/hooks/finance/useImportHistory";
import { extractFinanceErrorMessage, downloadBlobFile } from "@/utils/financeUtils";
import { invalidateFinanceAfterAccountsImport, invalidateFinanceAfterJournalImport, invalidateFinanceAfterOpeningBalanceImport } from "@/utils/financeImportInvalidation";
import financeService from "@/services/financeService";
import type { ImportModule } from "@/types/finance";
import { MODULE_CONFIGS, ImportModuleSelector, ImportWorkflow, ImportUpload, ImportPreview, ImportConfirmModal, ImportHistory, ImportHistoryDetail } from "@/components/management/finance/import";

export function FinanceImportPage() {
  const [selectedModule, setSelectedModule] = useState<ImportModule>("accounts");
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | "">("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [historyFilterModule, setHistoryFilterModule] = useState("all");
  const { periods, loading: loadingPeriods, error: periodsError } = useFinancePeriods();
  const history = useImportHistory();
  const activeModuleConfig = useMemo(() => MODULE_CONFIGS.find((item) => item.id === selectedModule) ?? MODULE_CONFIGS[0], [selectedModule]);
  const eligiblePeriods = useMemo(() => periods.filter((period) => period.status === "open" && period.is_closed !== true), [periods]);

  const onImportSuccess = useCallback((result: { message?: string }) => {
    if (selectedModule === "accounts") invalidateFinanceAfterAccountsImport();
    if (selectedModule === "journals") invalidateFinanceAfterJournalImport();
    if (selectedModule === "opening_balance") invalidateFinanceAfterOpeningBalanceImport();
    void history.refresh(true);
    setConfirmModalOpen(false);
    toast.success(result.message || "Impor data keuangan berhasil diproses.");
  }, [history, selectedModule]);

  const workflow = useFinanceImportWorkflow({ module: selectedModule, periodId: selectedPeriodId, onImportSuccess });

  const changeModule = (module: ImportModule) => {
    if (module === selectedModule) return;
    setSelectedModule(module);
    workflow.reset();
    setSelectedPeriodId("");
    setConfirmModalOpen(false);
  };

  const changePeriod = (id: number | "") => {
    if (id !== selectedPeriodId && selectedModule === "opening_balance") workflow.reset();
    setSelectedPeriodId(id);
  };

  const downloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const blob = selectedModule === "accounts" ? await financeService.getAccountsTemplate() : selectedModule === "journals" ? await financeService.getJournalsTemplate() : await financeService.getOpeningBalanceTemplate();
      downloadBlobFile(blob, activeModuleConfig.templateFileName);
      toast.success("Template berhasil diunduh.");
    } catch (error) {
      toast.error(extractFinanceErrorMessage(error, "Gagal mengunduh template."));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const preview = async () => {
    try { await workflow.preview(); toast.success("Validasi server berhasil dijalankan."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Gagal memvalidasi file."); }
  };

  const confirm = async () => {
    try { await workflow.confirm(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Gagal mengonfirmasi impor."); }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      <header className="flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Impor Data Keuangan</h1>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">Impor data melalui template resmi, validasi server, dan konfirmasi sebelum disimpan.</p>
        </div>
      </header>
      <ImportModuleSelector selectedModule={selectedModule} onSelectModule={changeModule} disabled={workflow.previewing || workflow.confirming} />
      <ImportWorkflow currentStep={workflow.workflowStep} />
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <ImportUpload activeModuleConfig={activeModuleConfig} selectedModule={selectedModule} selectedFile={workflow.selectedFile} onSelectFile={workflow.selectFile} onResetFile={workflow.reset} onDownloadTemplate={downloadTemplate} downloadingTemplate={downloadingTemplate} onPreview={preview} previewing={workflow.previewing} confirming={workflow.confirming} previewError={workflow.previewError} periods={eligiblePeriods} selectedPeriodId={selectedPeriodId} onSelectPeriodId={changePeriod} loadingPeriods={loadingPeriods} periodsError={periodsError} />
        <ImportPreview activeModuleConfig={activeModuleConfig} previewResult={workflow.previewResult} lastImportResult={workflow.lastImportResult} onClearLastResult={workflow.clearLastImportResult} onCancelPreview={workflow.reset} onRequestConfirm={() => setConfirmModalOpen(true)} />
      </section>
      <div className="border-t border-slate-200 pt-6">
        <ImportHistory history={history.history} loading={history.loading} error={history.error} onRetry={() => void history.refresh(true)} filterModule={historyFilterModule} onFilterModuleChange={setHistoryFilterModule} onOpenDetail={(id) => void history.openDetail(id)} />
      </div>
      <ImportConfirmModal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={confirm} confirming={workflow.confirming} activeModuleConfig={activeModuleConfig} selectedModule={selectedModule} selectedFile={workflow.selectedFile} previewResult={workflow.previewResult} periods={periods} selectedPeriodId={selectedPeriodId} canConfirm={workflow.previewIsValid && Boolean(workflow.previewResult?.data.batch_token) && (selectedModule !== "opening_balance" || Boolean(selectedPeriodId))} />
      <ImportHistoryDetail batchId={history.selectedBatchId} batchDetail={history.batchDetail} loading={history.loadingDetail} error={history.detailError} onRetry={() => history.selectedBatchId && void history.openDetail(history.selectedBatchId)} onClose={history.closeDetail} />
    </div>
  );
}

export default FinanceImportPage;
