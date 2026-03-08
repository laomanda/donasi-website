import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReceipt } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface AdminDonationTableProps {
  items: any[];
  loading: boolean;
  selection: any;
  pageIds: number[];
  formatCurrency: (val: any) => string;
  formatDateTime: (val: any) => string;
  getStatusTone: (status: any) => string;
  getStatusLabel: (status: any) => string;
  normalizeSourceLabel: (val: any) => string;
  handleOpenWhatsapp: (item: any, e: React.MouseEvent) => void;
  openDonation: (id: number) => void;
}

export function AdminDonationTable({
  items,
  loading,
  selection,
  pageIds,
  formatCurrency,
  formatDateTime,
  getStatusTone,
  getStatusLabel,
  normalizeSourceLabel,
  handleOpenWhatsapp,
  openDonation,
}: AdminDonationTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-[6%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <input
                  type="checkbox"
                  checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                  onChange={() => selection.toggleAll(pageIds)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="w-[18%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Kode</th>
              <th className="w-[20%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Donatur</th>
              <th className="w-[26%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Program</th>
              <th className="w-[11%] px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Nominal</th>
              <th className="w-[19%] px-6 py-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/4 rounded bg-slate-100" />
                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FontAwesomeIcon icon={faReceipt} className="text-2xl" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">Belum ada donasi</h3>
                  <p className="text-slate-500">Coba sesuaikan filter pencarian Anda.</p>
                </td>
              </tr>
            ) : (
              items.map((donation) => {
                const code = String(donation.donation_code ?? "").trim() || `#${donation.id}`;
                const donor = String(donation.donor_name ?? "").trim() || "Anonim";
                const programTitle = String(donation.program?.title ?? "").trim() || "Tanpa program";
                const statusValue = String(donation.status ?? "").trim();
                const source = normalizeSourceLabel(donation.payment_source);
                const tone = getStatusTone(statusValue);

                // Color bar logic
                let barColor = "border-l-slate-200";
                if (statusValue === "paid") barColor = "border-l-emerald-500";
                else if (statusValue === "pending") barColor = "border-l-amber-500";
                else if (statusValue === "failed" || statusValue === "cancelled") barColor = "border-l-rose-500";

                return (
                  <tr
                    key={donation.id}
                    className={`group cursor-pointer transition hover:bg-slate-50 border-l-4 ${barColor}`}
                    onClick={() => openDonation(donation.id)}
                  >
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selection.isSelected(donation.id)}
                        onChange={() => selection.toggle(donation.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-mono text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition">{code}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded bg-slate-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm whitespace-nowrap">
                          {source}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">{formatDateTime(donation.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{donor}</p>
                      {donation.donor_phone && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                           <FontAwesomeIcon icon={faWhatsapp} className="text-emerald-500" />
                           {donation.donor_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <p className="line-clamp-1 text-sm font-medium text-slate-600">{programTitle}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(donation.amount)}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
                          {getStatusLabel(statusValue)}
                          </span>
                          
                          {statusValue === 'paid'  && (
                              <div className="flex flex-col items-center gap-1">
                                  <button
                                      onClick={(e) => handleOpenWhatsapp(donation, e)}
                                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition ring-1 ring-emerald-200 whitespace-nowrap"
                                      title="Kirim Bukti via WhatsApp"
                                  >
                                      <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                                      <span>{donation.whatsapp_sent_at ? "Kirim Ulang" : "Kirim WA"}</span>
                                  </button>
                                  {donation.whatsapp_sent_at && (
                                      <span className="text-[9px] text-slate-400 font-medium">
                                          {formatDateTime(donation.whatsapp_sent_at)}
                                      </span>
                                  )}
                              </div>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDonationTable;
