import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { formatIDR, formatDateShort, resolveStorageUrl } from "../shared/MitraUtils";

interface RecentAllocation {
  id: string;
  amount: number;
  title: string;
  created_at: string;
  proof_path?: string;
}

interface MitraRecentAllocationsProps {
  allocations: RecentAllocation[];
  locale: string;
  t: (key: string, fallback?: string) => string;
}

export function MitraRecentAllocations({ allocations, locale, t }: MitraRecentAllocationsProps) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            {t("table.recent_allocations", "Alokasi Pembiayaan")}
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            {t("table.recent_allocations_desc", "Penyaluran dana terakhir")}
          </p>
        </div>
        <Link
          to="/mitra/allocations"
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
                {t("table.title", "Keperluan")}
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("table.amount", "Nominal")}
              </th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("table.date", "Tanggal")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(Array.isArray(allocations) ? allocations : []).map((item) => (
              <tr key={item.id} className="group transition hover:bg-slate-50/80">
                <td className="px-6 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="line-clamp-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-brandGreen-700">
                        {item.title}
                      </p>
                    </div>
                    {item.proof_path && (
                      <a
                        href={resolveStorageUrl(item.proof_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-white hover:text-brandGreen-600 hover:shadow-md hover:ring-1 hover:ring-brandGreen-100"
                        title="Buka Bukti Penyaluran"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-rose-600">
                  -{formatIDR(item.amount)}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  {formatDateShort(item.created_at, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-slate-100 md:hidden">
        {allocations.map((item) => (
          <div key={item.id} className="p-5 transition-colors active:bg-slate-50">
            <div className="mb-4 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Keperluan
                </p>
                <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                  {item.title}
                </p>
              </div>
              {item.proof_path && (
                <a
                  href={resolveStorageUrl(item.proof_path)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-600 shadow-sm ring-1 ring-brandGreen-100"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
                </a>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-400">ID Transaksi</span>
                <span className="text-slate-600">#{String(item.id).slice(0, 8)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Tanggal</span>
                <span className="text-slate-600">{formatDateShort(item.created_at, locale)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-2xl bg-rose-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Total Nominal
                </span>
                <span className="font-heading text-lg font-black text-rose-600">
                  -{formatIDR(item.amount)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
