import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import type { Allocation } from "@/types/allocation";
import { resolveStorageUrl } from "@/lib/urls";

type AdminAllocationTableProps = {
  allocations: Allocation[];
  loading: boolean;
  formatDate: (val: string) => string;
  formatCurrency: (val: number) => string;
};

export default function AdminAllocationTable({
  allocations,
  loading,
  formatDate,
  formatCurrency,
}: AdminAllocationTableProps) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Waktu & Tanggal</th>
            <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Mitra Pelaksana</th>
            <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Detail Penggunaan</th>
            <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Nominal</th>
            <th className="px-8 py-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Bukti</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-8 py-6">
                  <div className="h-4 w-24 rounded bg-slate-100" />
                </td>
                <td className="px-8 py-6">
                  <div className="h-10 w-40 rounded bg-slate-100" />
                </td>
                <td className="px-8 py-6">
                  <div className="h-10 w-48 rounded bg-slate-100" />
                </td>
                <td className="px-8 py-6">
                  <div className="h-6 w-24 rounded bg-slate-100 ml-auto" />
                </td>
                <td className="px-8 py-6">
                  <div className="h-8 w-8 rounded bg-slate-100 mx-auto" />
                </td>
              </tr>
            ))
          ) : allocations.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-8 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
                  <FontAwesomeIcon icon={faMagnifyingGlass} size="xl" />
                </div>
                <p className="text-sm font-bold text-slate-900">Tidak ada data ditemukan</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
              </td>
            </tr>
          ) : (
            allocations.map((alloc) => (
              <tr key={alloc.id} className="group transition hover:bg-slate-50/80">
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-700">{formatDate(alloc.created_at).split(",")[0]}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{formatDate(alloc.created_at).split(",")[1]}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{alloc.user.name}</p>
                      <p className="text-xs font-semibold text-slate-500 truncate">{alloc.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="line-clamp-1 font-bold text-slate-900">{alloc.description}</p>
                  <span className="mt-1.5 inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100">
                    {alloc.program?.title ?? "Program Umum"}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <p className="font-heading text-lg font-bold text-rose-600">
                    -{formatCurrency(alloc.amount)}
                  </p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center">
                    {alloc.proof_path ? (
                      <a
                        href={resolveStorageUrl(alloc.proof_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-md hover:ring-emerald-500"
                        title="Buka Bukti Transfer"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-slate-300 italic tracking-widest">
                        No File
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
