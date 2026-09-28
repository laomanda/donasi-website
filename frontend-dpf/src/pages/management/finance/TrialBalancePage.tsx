import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faScaleUnbalanced, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  FinanceStatusBadge,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { TrialBalanceItem } from "@/types/finance";
import { downloadBlobFile, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function TrialBalancePage() {
  const [items, setItems] = useState<TrialBalanceItem[]>([]);
  const [isBalanced, setIsBalanced] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchTrialBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getTrialBalance();
      setItems(res.data || []);
      setIsBalanced(res.totals?.is_balanced ?? null);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat neraca saldo."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTrialBalance();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportTrialBalance();
      downloadBlobFile(blob, `neraca-saldo-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Neraca Saldo (Trial Balance)"
        description="Pengecekan keseimbangan matematis seluruh akun. Total saldo debit harus tepat sama dengan total saldo kredit sebelum penyusunan laporan keuangan."
        badge={
          isBalanced !== null ? (
            <FinanceStatusBadge
              status={isBalanced ? "balanced" : "warning"}
              label={isBalanced ? "Neraca Seimbang" : "Tidak Seimbang"}
            />
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-emerald-600" />
              {exporting ? "Mengunduh..." : "Export Excel"}
            </button>
            <button
              type="button"
              onClick={fetchTrialBalance}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Segarkan
            </button>
          </div>
        }
      />

      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat neraca saldo"
          message={error}
          onRetry={fetchTrialBalance}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          {loading ? (
            <table className="w-full">
              <FinanceTableSkeleton rows={6} cols={5} />
            </table>
          ) : items.length === 0 ? (
            <FinanceEmptyState
              title="Neraca Saldo Kosong"
              description="Belum ada transaksi yang dapat direkap ke dalam neraca saldo."
              icon={faScaleUnbalanced}
            />
          ) : (
            <p className="text-xs font-medium text-slate-600">
              Menampilkan {items.length} akun dalam neraca saldo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default TrialBalancePage;
