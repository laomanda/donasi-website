import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faBookOpen, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { GeneralLedgerAccount } from "@/types/finance";
import { downloadBlobFile, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function GeneralLedgerPage() {
  const [accounts, setAccounts] = useState<GeneralLedgerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getGeneralLedger();
      setAccounts(res.accounts || []);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat buku besar."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLedger();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportGeneralLedger();
      downloadBlobFile(blob, `buku-besar-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Buku Besar (General Ledger)"
        description="Ringkasan dan histori mutasi saldo per akun perkiraan (COA) dari seluruh transaksi jurnal yang telah diposting."
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
              onClick={fetchLedger}
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
          title="Tidak dapat memuat buku besar"
          message={error}
          onRetry={fetchLedger}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          {loading ? (
            <table className="w-full">
              <FinanceTableSkeleton rows={6} cols={5} />
            </table>
          ) : accounts.length === 0 ? (
            <FinanceEmptyState
              title="Buku Besar Belum Berisi Data"
              description="Belum ada transaksi jurnal yang terposting untuk periode ini."
              icon={faBookOpen}
            />
          ) : (
            <p className="text-xs font-medium text-slate-600">
              Menampilkan {accounts.length} akun terdaftar dalam buku besar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default GeneralLedgerPage;
