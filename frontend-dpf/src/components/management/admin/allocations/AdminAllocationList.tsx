import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faCoins } from "@fortawesome/free-solid-svg-icons";
import type { Allocation } from "@/types/allocation";
import { resolveStorageUrl } from "@/lib/urls";

type AdminAllocationListProps = {
  allocations: Allocation[];
  loading: boolean;
  formatDate: (val: string) => string;
  formatCurrency: (val: number) => string;
};

export default function AdminAllocationList({
  allocations,
  loading,
  formatDate,
  formatCurrency,
}: AdminAllocationListProps) {
  return (
    <div className="lg:hidden divide-y divide-slate-100">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 space-y-4 animate-pulse">
            <div className="flex justify-between">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-12 w-full rounded bg-slate-100" />
            <div className="h-6 w-32 rounded bg-slate-100" />
          </div>
        ))
      ) : allocations.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm font-bold text-slate-900">Tidak ada data ditemukan</p>
        </div>
      ) : (
        allocations.map((alloc) => (
          <div key={alloc.id} className="p-6 space-y-4 active:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Waktu Transaksi</p>
                <p className="text-sm font-bold text-slate-700">{formatDate(alloc.created_at)}</p>
              </div>
              {alloc.proof_path && (
                <a
                  href={resolveStorageUrl(alloc.proof_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 shadow-sm"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </a>
              )}
            </div>

            <div className="flex items-center gap-4 py-4 border-y border-slate-50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <FontAwesomeIcon icon={faCoins} className="text-lg" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Mitra Pelaksana</p>
                <p className="font-bold text-slate-900 truncate">{alloc.user.name}</p>
                <p className="text-[11px] font-semibold text-slate-500 truncate">{alloc.user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 leading-snug">{alloc.description}</p>
                <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {alloc.program?.title ?? "Program Umum"}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Nominal</span>
                <span className="font-heading text-xl font-black text-rose-600">-{formatCurrency(alloc.amount)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
