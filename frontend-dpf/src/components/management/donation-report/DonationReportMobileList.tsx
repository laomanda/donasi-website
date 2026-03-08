import * as Utils from "./DonationReportUtils";

type DonationReportMobileListProps = {
  items: Utils.Donation[];
  loading: boolean;
};

export function DonationReportMobileList({ items, loading }: DonationReportMobileListProps) {
  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 bg-slate-50 md:hidden">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm font-bold text-slate-400">Memuat laporan...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-2 bg-slate-50 md:hidden">
        <p className="text-lg font-bold text-slate-400">Kosong</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 bg-white md:hidden">
      {items.map((item) => (
        <div key={item.id} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`h-6 w-1 rounded-full ${Utils.getStatusTone(item.status || "")}`} />
              <span className="font-mono text-[10px] font-bold text-slate-400">{item.donation_code || `#${item.id}`}</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ${Utils.getStatusTone(
                item.status || ""
              )}`}
            >
              {Utils.getStatusLabel(item.status || "")}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Donatur</p>
              <h4 className="text-sm font-bold text-slate-900">{item.donor_name || "Hamba Allah"}</h4>
              <p className="text-xs text-slate-500">{item.donor_email || "-"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Nominal</p>
                <p className="text-sm font-bold text-emerald-600">{Utils.formatCurrency(item.amount)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Sumber</p>
                <p className="text-xs font-bold text-slate-700">{Utils.normalizeSourceLabel(item.payment_source)}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Program</p>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{item.program?.title || "-"}</p>
            </div>

            <div className="pt-2 border-t border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 italic">{Utils.formatDateTime(item.created_at)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
