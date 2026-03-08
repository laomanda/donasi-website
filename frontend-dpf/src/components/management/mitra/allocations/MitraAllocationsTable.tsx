import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { formatIDR, formatDateLong, resolveStorageUrl } from "../shared/MitraUtils";

interface Allocation {
  id: number;
  title: string;
  amount: number;
  created_at: string;
  proof_path?: string;
}

interface MitraAllocationsTableProps {
  allocations: Allocation[];
  loading: boolean;
  locale: string;
  t: (key: string, fallback?: string) => string;
}

export function MitraAllocationsTable({
  allocations,
  loading,
  locale,
  t,
}: MitraAllocationsTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("mitra.allocation_title", "Keperluan Alokasi")}
            </th>
            <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("mitra.allocation_date", "Tanggal")}
            </th>
            <th className="px-8 py-6 text-right text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("common.amount", "Nominal")}
            </th>
            <th className="px-8 py-6 text-center text-[11px] font-bold uppercase tracking-[0.2em]">
              {t("mitra.proof", "Bukti")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-8 py-8" colSpan={4}>
                  <div className="h-5 w-full rounded-lg bg-slate-50" />
                </td>
              </tr>
            ))
          ) : (Array.isArray(allocations) ? allocations : []).length === 0 ? (
            <tr>
              <td colSpan={4} className="px-8 py-32 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-3xl" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {t("mitra.no_allocation_history", "Belum ada riwayat alokasi")}
                </h3>
              </td>
            </tr>
          ) : (
            (Array.isArray(allocations) ? allocations : []).map((item) => (
              <tr key={item.id} className="group transition-all hover:bg-slate-50/80">
                <td className="px-8 py-7">
                  <p className="font-bold leading-relaxed text-slate-900 group-hover:text-brandGreen-700">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    ID: #{String(item.id).slice(0, 8)}
                  </p>
                </td>
                <td className="px-8 py-7">
                  <p className="text-sm font-semibold text-slate-500 text-nowrap">
                    {formatDateLong(item.created_at, locale)}
                  </p>
                </td>
                <td className="px-8 py-7 text-right">
                  <span className="inline-block rounded-2xl bg-red-500 px-5 py-2 font-heading text-sm font-black tabular-nums text-white">
                    -{formatIDR(item.amount)}
                  </span>
                </td>
                <td className="px-8 py-7 text-center">
                  {item.proof_path ? (
                    <a
                      href={resolveStorageUrl(item.proof_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-900 hover:text-white hover:ring-slate-900"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                  ) : (
                    <span className="text-sm font-bold text-slate-300">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
