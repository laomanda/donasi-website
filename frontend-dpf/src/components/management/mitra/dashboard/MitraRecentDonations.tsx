import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { MitraStatusBadge } from "../shared/MitraStatusBadge";
import { formatIDR, formatDateShort } from "../shared/MitraUtils";

interface RecentDonation {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  donatur_name: string;
}

interface MitraRecentDonationsProps {
  donations: RecentDonation[];
  locale: string;
  t: (key: string, fallback?: string) => string;
}

export function MitraRecentDonations({ donations, locale, t }: MitraRecentDonationsProps) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            {t("table.recent_donations", "Donasi Terbaru")}
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            {t("table.recent_donations_desc", "Data transaksi masuk terakhir")}
          </p>
        </div>
        <Link
          to="/mitra/donations"
          className="group text-sm font-bold text-brandGreen-600 transition-colors hover:text-brandGreen-700"
        >
          {t("common.view_all", "Lihat Semua")}{" "}
          <FontAwesomeIcon
            icon={faChevronRight}
            className="ml-1 text-[10px] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("table.donatur", "Donatur")}
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("table.amount", "Nominal")}
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("table.status", "Status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(Array.isArray(donations) ? donations : []).map((item) => (
              <tr key={item.id} className="group transition hover:bg-slate-50/80">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-600 transition group-hover:bg-white group-hover:shadow-md group-hover:ring-1 group-hover:ring-slate-100">
                      {item.donatur_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">
                        {item.donatur_name}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {formatDateShort(item.created_at, locale)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  {formatIDR(item.amount)}
                </td>
                <td className="px-6 py-4">
                  <MitraStatusBadge status={item.status} t={t} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-slate-100 md:hidden">
        {donations.map((item) => (
          <div key={item.id} className="p-5 transition-colors active:bg-slate-50">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-600">
                  {item.donatur_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.donatur_name}</p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {formatDateShort(item.created_at, locale)}
                  </p>
                </div>
              </div>
              <MitraStatusBadge status={item.status} t={t} />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Donasi
              </span>
              <span className="font-heading text-lg font-black text-slate-900">
                {formatIDR(item.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
