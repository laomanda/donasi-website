import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

interface AdminRecentDonationsProps {
  loading: boolean;
  donations: any[];
  getDonationStatusStyles: (status: string) => any;
  getDonationStatusLabel: (status: string) => string;
  formatCurrency: (value: number) => string;
  formatDateTime: (value: string | null | undefined) => string;
  normalizeNumber: (value: unknown) => number;
}

export function AdminRecentDonations({
  loading,
  donations,
  getDonationStatusStyles,
  getDonationStatusLabel,
  formatCurrency,
  formatDateTime,
  normalizeNumber,
}: AdminRecentDonationsProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-[28px] border border-slate-200 bg-brandGreen-100/50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaksi</p>
          <h2 className="font-heading text-xl font-semibold text-slate-900">Donasi Terbaru</h2>
          <p className="text-sm font-medium text-slate-600">10 transaksi terakhir yang masuk ke sistem.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/donations")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-emerald-600 hover:text-white"
        >
          Lihat semua
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
              <div className="mt-4 h-6 w-32 rounded-full bg-slate-200" />
            </div>
          ))
        ) : donations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
            Belum ada donasi terbaru.
          </div>
        ) : (
          donations.map((item, idx) => {
            const programTitle = String(item.program?.title ?? "").trim() || "Tanpa program";
            const donor = String(item.donor_name ?? "").trim() || "Anonim";
            const amount = normalizeNumber(item.amount);
            const statusValue = String(item.status ?? "").trim() || "-";
            const status = getDonationStatusStyles(statusValue);
            const onClick = item.id ? () => navigate(`/admin/donations/${item.id}`) : () => navigate("/admin/donations");
            return (
              <button
                key={String(item.id ?? idx)}
                type="button"
                onClick={onClick}
                className={`flex w-full flex-col gap-3 rounded-2xl border border-slate-200 border-l-4 ${status.border} bg-white p-4 text-left shadow-sm transition hover:border-emerald-500`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{programTitle}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-600">Donatur: {donor}</p>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${status.badge}`}>
                    <FontAwesomeIcon icon={status.icon} className="text-[11px]" />
                    {getDonationStatusLabel(statusValue)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-slate-700">
                    Nominal: <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                  </span>
                  <span className="text-slate-500">Waktu: {formatDateTime(item.created_at)}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AdminRecentDonations;
