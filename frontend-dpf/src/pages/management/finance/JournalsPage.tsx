import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateRight, faReceipt } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceStatusBadge,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  CurrencyDisplay,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { JournalEntry } from "@/types/finance";
import { formatFinanceDate, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function JournalsPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJournals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getJournals({ per_page: 20 });
      setJournals(res.data || []);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat daftar jurnal umum."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchJournals();
  }, []);

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Jurnal Umum"
        description="Pencatatan transaksi keuangan berpasangan (double-entry). Setiap transaksi memuat minimal satu debit dan satu kredit yang seimbang."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchJournals}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Segarkan
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} />
              Buat Jurnal Baru
            </button>
          </div>
        }
      />

      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat jurnal"
          message={error}
          onRetry={fetchJournals}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-6 py-4">Nomor Jurnal</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4 text-right">Debit</th>
                  <th className="px-6 py-4 text-right">Kredit</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>

              {loading ? (
                <FinanceTableSkeleton rows={5} cols={6} />
              ) : journals.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6} className="py-12">
                      <FinanceEmptyState
                        title="Belum Ada Jurnal"
                        description="Belum ada transaksi jurnal umum pada sistem. Buat entri jurnal pertama atau import data."
                        icon={faReceipt}
                      />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-slate-100 text-xs">
                  {journals.map((journal) => (
                    <tr key={journal.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {journal.journal_number}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatFinanceDate(journal.date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 max-w-md truncate">
                        {journal.description}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <CurrencyDisplay amount={journal.total_debit} tone="debit" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <CurrencyDisplay amount={journal.total_credit} tone="credit" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <FinanceStatusBadge status={journal.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalsPage;
