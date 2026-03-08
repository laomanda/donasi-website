import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faFileInvoiceDollar, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { formatIDR, formatDateLong, resolveStorageUrl } from "../shared/MitraUtils";

interface Allocation {
  id: number;
  title: string;
  amount: number;
  created_at: string;
  proof_path?: string;
}

interface MitraAllocationCardsProps {
  allocations: Allocation[];
  loading: boolean;
  locale: string;
  t: (key: string, fallback?: string) => string;
}

export function MitraAllocationCards({
  allocations,
  loading,
  locale,
  t,
}: MitraAllocationCardsProps) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-100 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse p-6 space-y-4">
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
            <div className="h-12 w-full bg-slate-100 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="px-6 py-24 text-center md:hidden">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
          <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-3xl" />
        </div>
        <h3 className="mt-6 text-base font-bold text-slate-900">
          {t("mitra.no_allocation_history", "Belum ada riwayat alokasi")}
        </h3>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {(Array.isArray(allocations) ? allocations : []).map((item) => (
        <div key={item.id} className="space-y-5 p-6 transition-colors">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                {t("mitra.allocation_title", "Keperluan Alokasi")}
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-600 shadow-sm ring-1 ring-brandGreen-100"
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
              <span className="text-slate-600">{formatDateLong(item.created_at, locale)}</span>
            </div>

            <div className="flex items-center justify-between rounded-[20px] bg-rose-50 p-4 ring-1 ring-rose-100 mt-2">
              <div className="flex items-center gap-2 text-rose-500">
                <FontAwesomeIcon icon={faReceipt} className="text-[10px]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {t("common.amount", "Nominal")}
                </span>
              </div>
              <span className="font-heading text-lg font-black text-rose-600">
                -{formatIDR(item.amount).replace("Rp", "Rp ")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
