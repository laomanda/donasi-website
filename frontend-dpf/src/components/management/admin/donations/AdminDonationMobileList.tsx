import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface AdminDonationMobileListProps {
  items: any[];
  loading: boolean;
  formatCurrency: (val: any) => string;
  formatDateTime: (val: any) => string;
  getStatusTone: (status: any) => string;
  getStatusLabel: (status: any) => string;
  normalizeSourceLabel: (val: any) => string;
  handleOpenWhatsapp: (item: any, e: React.MouseEvent) => void;
  openDonation: (id: number) => void;
}

export function AdminDonationMobileList({
  items,
  loading,
  formatCurrency,
  formatDateTime,
  getStatusTone,
  getStatusLabel,
  normalizeSourceLabel,
  handleOpenWhatsapp,
  openDonation,
}: AdminDonationMobileListProps) {
  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {loading ? (
        <div className="p-6 text-center text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-slate-500">Tidak ada data.</div>
      ) : (
        items.map((donation) => {
          const statusValue = String(donation.status ?? "").trim();
          let barColor = "border-l-slate-200";
          if (statusValue === "paid") barColor = "border-l-emerald-500";
          else if (statusValue === "pending") barColor = "border-l-amber-500";
          else if (statusValue === "failed" || statusValue === "cancelled") barColor = "border-l-rose-500";

          return (
            <div
              key={donation.id}
              className={`relative w-full p-5 text-left transition hover:bg-slate-50 border-l-4 ${barColor}`}
            >
              <div onClick={() => openDonation(donation.id)} className="cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-bold font-mono text-slate-400">{String(donation.donation_code ?? "-")}</p>
                    <p className="font-bold text-slate-900 text-base">{formatCurrency(donation.amount)}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(statusValue)}`}>
                    {getStatusLabel(statusValue)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">{String(donation.donor_name ?? "Anonim")}</p>
                <p className="text-xs text-slate-500 line-clamp-1 mb-3">{String(donation.program?.title ?? "Tanpa program")}</p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider text-[10px]">{normalizeSourceLabel(donation.payment_source)}</span>
                  <span className="text-xs font-medium text-slate-500">{formatDateTime(donation.created_at)}</span>
                </div>
              </div>

              {statusValue === "paid" && (
                <div className="mt-3 flex justify-between items-center">
                  {donation.whatsapp_sent_at && (
                    <span className="text-[10px] text-slate-400">
                      <FontAwesomeIcon icon={faWhatsapp} className="mr-1" />
                      {formatDateTime(donation.whatsapp_sent_at)}
                    </span>
                  )}
                  <button
                    onClick={(e) => handleOpenWhatsapp(donation, e)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition ring-1 ring-emerald-200 ml-auto"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                    {donation.whatsapp_sent_at ? "Kirim Ulang" : "Kirim Tanda Terima"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default AdminDonationMobileList;
