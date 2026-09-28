import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faChartLine, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { ActivityStatementResponse } from "@/types/finance";
import { downloadBlobFile, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function ActivityStatementPage() {
  const [data, setData] = useState<ActivityStatementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchActivityStatement = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getActivityStatement();
      setData(res);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat laporan aktivitas."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchActivityStatement();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportActivityStatement();
      downloadBlobFile(blob, `laporan-aktivitas-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Laporan Aktivitas (Laba Rugi Entitas Nirlaba)"
        description="Pencatatan pendapatan dari donasi/wakaf, beban program, beban operasional amil, serta surplus atau defisit neto selama periode berjalan."
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
              onClick={fetchActivityStatement}
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
          title="Tidak dapat memuat laporan aktivitas"
          message={error}
          onRetry={fetchActivityStatement}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          {loading ? (
            <table className="w-full">
              <FinanceTableSkeleton rows={6} cols={3} />
            </table>
          ) : !data ? (
            <FinanceEmptyState
              title="Laporan Aktivitas Kosong"
              description="Belum ada transaksi pendapatan atau beban yang tercatat pada periode ini."
              icon={faChartLine}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Periode: {data.period_from || "-"} s/d {data.period_to || "-"}
              </p>
              <p className="text-sm font-medium text-slate-600">
                Laporan aktivitas entitas wakaf telah dimuat dari general ledger.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityStatementPage;
