import * as Utils from "./DonationReportUtils";

type DonationReportTableProps = {
  items: Utils.Donation[];
  loading: boolean;
  visibleColumns: Utils.ReportColumn[];
};

export function DonationReportTable({ items, loading, visibleColumns }: DonationReportTableProps) {
  if (loading) {
    return (
      <div className="hidden min-h-[400px] w-full flex-col items-center justify-center space-y-4 bg-slate-50/50 md:flex">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm font-bold text-slate-500">Memuat data...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="hidden min-h-[400px] w-full flex-col items-center justify-center space-y-2 bg-slate-50/50 md:flex">
        <p className="text-lg font-bold text-slate-400">Tidak ada data ditemukan</p>
        <p className="text-sm text-slate-400">Coba ubah filter atau kata kunci pencarian Anda</p>
      </div>
    );
  }

  const isVisible = (id: Utils.ReportColumn) => visibleColumns.includes(id);

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[140px]">Kode</th>
            {isVisible("donor") && (
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Donatur</th>
            )}
            {isVisible("qualification") && (
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Kualifikasi</th>
            )}
            {isVisible("program") && (
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Program</th>
            )}
            {isVisible("source") && (
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Sumber</th>
            )}
            {isVisible("status") && (
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
            )}
            {isVisible("nominal") && (
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Nominal</th>
            )}
            {isVisible("time") && (
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Waktu</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((item) => (
            <tr key={item.id} className="group transition hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-1 min-w-[4px] rounded-full ${Utils.getStatusTone(item.status || "")}`} />
                  <span className="font-mono text-[11px] font-bold text-slate-900">{item.donation_code || `#${item.id}`}</span>
                </div>
              </td>

              {isVisible("donor") && (
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 leading-tight">{item.donor_name || "Hamba Allah"}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{item.donor_email || "-"}</span>
                  </div>
                </td>
              )}

              {isVisible("qualification") && (
                <td className="px-6 py-4">
                  <span className="inline-flex whitespace-nowrap rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    {item.donor_qualification || "Baru"}
                  </span>
                </td>
              )}

              {isVisible("program") && (
                <td className="px-6 py-4">
                  <p className="max-w-[220px] text-xs font-semibold text-slate-600 leading-relaxed" title={item.program?.title || ""}>
                    {item.program?.title || "-"}
                  </p>
                </td>
              )}

              {isVisible("source") && (
                <td className="px-6 py-4 text-[12px] font-bold text-slate-500">
                  {Utils.normalizeSourceLabel(item.payment_source)}
                </td>
              )}

              {isVisible("status") && (
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset ${Utils.getStatusTone(
                      item.status || ""
                    )}`}
                  >
                    {Utils.getStatusLabel(item.status || "")}
                  </span>
                </td>
              )}

              {isVisible("nominal") && (
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-slate-900">{Utils.formatCurrency(item.amount)}</span>
                </td>
              )}

              {isVisible("time") && (
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-bold text-slate-400">{Utils.formatDateTime(item.created_at)}</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
