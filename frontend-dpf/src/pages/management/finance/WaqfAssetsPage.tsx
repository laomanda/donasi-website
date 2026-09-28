import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faVault, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { WaqfAssetReportResponse } from "@/types/finance";
import { downloadBlobFile, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function WaqfAssetsPage() {
  const [data, setData] = useState<WaqfAssetReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchWaqfAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getWaqfAssetReport();
      setData(res);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat laporan aset wakaf."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWaqfAssets();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportWaqfAssets();
      downloadBlobFile(blob, `aset-wakaf-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Laporan & Register Aset Wakaf"
        description="Pengelolaan aset wakaf entitas, nilai perolehan, akumulasi penyusutan, dan nilai buku berdasarkan regulasi PSAK 409."
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
              onClick={fetchWaqfAssets}
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
          title="Tidak dapat memuat aset wakaf"
          message={error}
          onRetry={fetchWaqfAssets}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          {loading ? (
            <table className="w-full">
              <FinanceTableSkeleton rows={5} cols={4} />
            </table>
          ) : !data ? (
            <FinanceEmptyState
              title="Aset Wakaf Belum Terdaftar"
              description="Belum ada aset wakaf yang terdaftar dalam inventaris pembukuan."
              icon={faVault}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tanggal Laporan: {data.as_of_date || "-"}
              </p>
              <p className="text-sm font-medium text-slate-600">
                Total Aset Terdaftar: {data.summary?.total_assets_count ?? 0} unit
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WaqfAssetsPage;
