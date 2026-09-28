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
import type { BalanceSheetResponse } from "@/types/finance";
import { downloadBlobFile, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchBalanceSheet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getBalanceSheet();
      setData(res);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat laporan posisi keuangan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBalanceSheet();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportBalanceSheet();
      downloadBlobFile(blob, `posisi-keuangan-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Laporan Posisi Keuangan (Neraca)"
        description="Penyajian posisi aset (lancar & tidak lancar), liabilitas jangka pendek/panjang, dan ekuitas dana wakaf yayasan pada tanggal pelaporan tertentu."
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
              onClick={fetchBalanceSheet}
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
          title="Tidak dapat memuat neraca"
          message={error}
          onRetry={fetchBalanceSheet}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          {loading ? (
            <table className="w-full">
              <FinanceTableSkeleton rows={6} cols={3} />
            </table>
          ) : !data ? (
            <FinanceEmptyState
              title="Laporan Posisi Keuangan Kosong"
              description="Belum ada data keuangan untuk tanggal pelaporan ini."
              icon={faVault}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tanggal Pelaporan: {data.as_of_date || "-"}
              </p>
              <p className="text-sm font-medium text-slate-600">
                Struktur laporan neraca telah terverifikasi dengan status:{" "}
                <span className={data.is_balanced ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                  {data.is_balanced ? "Keseimbangan Terpenuhi" : "Selisih Terdeteksi"}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BalanceSheetPage;
