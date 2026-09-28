import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faFileImport, faDownload } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { ImportBatch } from "@/types/finance";
import { downloadBlobFile, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function FinanceImportExportPage() {
  const [history, setHistory] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getImportHistory({ per_page: 15 });
      setHistory(res.data || []);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat histori import data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistory();
  }, []);

  const handleDownloadTemplate = async (type: "accounts" | "journals" | "opening_balance") => {
    setDownloading(type);
    try {
      let blob: BlobPart;
      if (type === "accounts") blob = await financeService.getAccountsTemplate();
      else if (type === "journals") blob = await financeService.getJournalsTemplate();
      else blob = await financeService.getOpeningBalanceTemplate();

      downloadBlobFile(blob, `template-import-${type}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Import & Export Data Keuangan"
        description="Migrasi massal data akun (Chart of Accounts), jurnal umum (JU), saldo awal, serta export laporan keuangan dalam format Excel resmi."
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

      {/* Template Download Section */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="font-heading text-base font-bold text-slate-900 mb-1">
          Unduh Template Excel Resmi
        </h3>
        <p className="text-xs font-medium text-slate-500 mb-6">
          Format standar Excel (.xlsx) untuk upload data ke sistem akuntansi.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">Template Akun (COA)</p>
            <p className="text-xs text-slate-500 mt-0.5">Daftar kode akun, nama, tipe & saldo normal.</p>
            <button
              type="button"
              onClick={() => handleDownloadTemplate("accounts")}
              disabled={Boolean(downloading)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <FontAwesomeIcon icon={faDownload} />
              {downloading === "accounts" ? "Mengunduh..." : "Unduh Template"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">Template Jurnal Umum (JU)</p>
            <p className="text-xs text-slate-500 mt-0.5">Entri transaksi debit/kredit per tanggal.</p>
            <button
              type="button"
              onClick={() => handleDownloadTemplate("journals")}
              disabled={Boolean(downloading)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <FontAwesomeIcon icon={faDownload} />
              {downloading === "journals" ? "Mengunduh..." : "Unduh Template"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">Template Saldo Awal</p>
            <p className="text-xs text-slate-500 mt-0.5">Inisialisasi saldo pembukuan awal tahun.</p>
            <button
              type="button"
              onClick={() => handleDownloadTemplate("opening_balance")}
              disabled={Boolean(downloading)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <FontAwesomeIcon icon={faDownload} />
              {downloading === "opening_balance" ? "Mengunduh..." : "Unduh Template"}
            </button>
          </div>
        </div>
      </div>

      {/* Histori Batch Import */}
      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat histori"
          message={error}
          onRetry={fetchHistory}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h3 className="font-heading text-base font-bold text-slate-900 mb-4">
            Histori Batch Import
          </h3>

          {loading ? (
            <table className="w-full">
              <FinanceTableSkeleton rows={4} cols={5} />
            </table>
          ) : history.length === 0 ? (
            <FinanceEmptyState
              title="Belum Ada Histori Import"
              description="Belum ada proses import file Excel yang tercatat dalam audit log sistem."
              icon={faFileImport}
            />
          ) : (
            <p className="text-xs font-medium text-slate-600">
              Menampilkan {history.length} batch import terakhir.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default FinanceImportExportPage;
