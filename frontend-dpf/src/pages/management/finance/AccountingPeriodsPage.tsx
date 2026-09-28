import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
  FinanceStatusBadge,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import type { AccountingPeriod } from "@/types/finance";
import { formatFinanceDate, extractFinanceErrorMessage } from "@/utils/financeUtils";

export function AccountingPeriodsPage() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getAccountingPeriods();
      setPeriods(res || []);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat periode akuntansi."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPeriods();
  }, []);

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Periode Akuntansi & Kontrol Tutup Buku"
        description="Pengendalian status pembukuan bulanan/tahunan. Periode yang telah ditutup (closed) dikunci secara permanen dan tidak dapat menerima mutasi transaksi."
        actions={
          <button
            type="button"
            onClick={fetchPeriods}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            Segarkan
          </button>
        }
      />

      {error ? (
        <FinanceErrorState
          title="Tidak dapat memuat periode"
          message={error}
          onRetry={fetchPeriods}
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-6 py-4">Periode</th>
                  <th className="px-6 py-4">Rentang Tanggal</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Waktu Penutupan</th>
                  <th className="px-6 py-4">Catatan Penutupan</th>
                </tr>
              </thead>

              {loading ? (
                <FinanceTableSkeleton rows={5} cols={5} />
              ) : periods.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-12">
                      <FinanceEmptyState
                        title="Belum Ada Periode Terbuka"
                        description="Belum ada periode akuntansi yang dibuat di sistem."
                        icon={faCalendarCheck}
                      />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-slate-100 text-xs">
                  {periods.map((p) => (
                    <tr key={p.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {p.period_name} ({p.year})
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatFinanceDate(p.start_date)} - {formatFinanceDate(p.end_date)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <FinanceStatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {p.closed_at ? formatFinanceDate(p.closed_at) : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                        {p.closing_notes || "-"}
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

export default AccountingPeriodsPage;
