import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faFileLines, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { FinancialNote } from "@/types/finance";
import { downloadBlobFile, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function FinancialNotesPage() {
  const [notes, setNotes] = useState<FinancialNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getFinancialNotes();
      setNotes(res || []);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat catatan atas laporan keuangan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotes();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await financeService.exportFinancialNotes();
      downloadBlobFile(blob, `calk-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Catatan Atas Laporan Keuangan (CALK)"
        description="Dokumentasi naratif, pengungkapan kebijakan akuntansi, dan rincian pos-pos penting laporan keuangan yayasan."
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
              onClick={fetchNotes}
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
          title="Tidak dapat memuat CALK"
          message={error}
          onRetry={fetchNotes}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          {loading ? (
            <table className="w-full">
              <FinanceTableSkeleton rows={5} cols={4} />
            </table>
          ) : notes.length === 0 ? (
            <FinanceEmptyState
              title="Belum Ada Catatan Laporan"
              description="Belum ada catatan naratif yang dibuat untuk laporan keuangan periode ini."
              icon={faFileLines}
            />
          ) : (
            <p className="text-xs font-medium text-slate-600">
              Menampilkan {notes.length} catatan pengungkapan aktif.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default FinancialNotesPage;
