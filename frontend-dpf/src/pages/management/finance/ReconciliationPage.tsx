import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  FinanceStatusBadge,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { ReconciliationSummary } from "@/types/finance";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";

export function ReconciliationPage() {
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReconciliation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getReconciliationSummary();
      setSummary(res);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat ringkasan rekonsiliasi."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReconciliation();
  }, []);

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Rekonsiliasi & Kontrol Integritas Keuangan"
        description="Pengecekan otomatis terhadap 14 titik kontrol: konsistensi donasi ke jurnal, penyaluran kas, aset wakaf, kas & bank, hingga keseimbangan buku besar."
        badge={
          summary ? (
            <FinanceStatusBadge
              status={summary.overall_status === "healthy" ? "balanced" : "warning"}
              label={`Status: ${summary.overall_status.toUpperCase()}`}
            />
          ) : undefined
        }
        actions={
          <button
            type="button"
            onClick={fetchReconciliation}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            Jalankan Rekonsiliasi
          </button>
        }
      />

      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat rekonsiliasi"
          message={error}
          onRetry={fetchReconciliation}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          {loading ? (
            <table className="w-full">
              <FinanceTableSkeleton rows={6} cols={4} />
            </table>
          ) : !summary ? (
            <FinanceEmptyState
              title="Data Rekonsiliasi Kosong"
              description="Pengecekan integritas keuangan belum dijalankan."
              icon={faShieldHalved}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Waktu Pengecekan: {summary.checked_at || "-"}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <p className="text-xs font-bold text-emerald-800 uppercase">Kontrol Seimbang</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{summary.balanced_controls}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                  <p className="text-xs font-bold text-amber-800 uppercase">Perhatian (Warning)</p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">{summary.warning_controls}</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                  <p className="text-xs font-bold text-rose-800 uppercase">Anomali Terdeteksi</p>
                  <p className="text-2xl font-bold text-rose-700 mt-1">{summary.anomaly_controls}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReconciliationPage;
