import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faExternalLinkAlt,
    faHandHoldingHeart,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import type { Allocation } from "@/types/allocation";
import { resolveStorageUrl } from "@/lib/urls";

type AdminAllocationTableProps = {
    allocations: Allocation[];
    loading: boolean;
    formatDate: (val: string) => string;
    formatCurrency: (val: number) => string;
    pageIds?: number[];
    selected?: Set<number>;
    onToggle?: (id: number) => void;
    onToggleAll?: () => void;
};

export default function AdminAllocationTable({
    allocations,
    loading,
    formatDate,
    formatCurrency,
    pageIds = [],
    selected = new Set(),
    onToggle,
    onToggleAll,
}: AdminAllocationTableProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith("/keuangan") ? "/keuangan" : "/admin";

    const isAllSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

    return (
        <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[860px] text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                        {onToggleAll && (
                            <th className="w-12 px-4 py-3.5 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={onToggleAll}
                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                                />
                            </th>
                        )}
                        <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Tanggal Penyaluran
                        </th>
                        <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Program Donasi
                        </th>
                        <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Keperluan / Kegiatan
                        </th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Nominal
                        </th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                {onToggleAll && (
                                    <td className="w-12 px-4 py-4 text-center">
                                        <div className="h-4 w-4 mx-auto rounded bg-slate-100" />
                                    </td>
                                )}
                                <td className="px-5 py-4">
                                    <div className="h-3.5 w-24 rounded bg-slate-100" />
                                </td>
                                <td className="px-5 py-4">
                                    <div className="h-7 w-40 rounded bg-slate-100" />
                                </td>
                                <td className="px-5 py-4">
                                    <div className="h-4 w-48 rounded bg-slate-100" />
                                </td>
                                <td className="px-5 py-4">
                                    <div className="h-5 w-24 rounded bg-slate-100 ml-auto" />
                                </td>
                                <td className="px-5 py-4">
                                    <div className="h-8 w-16 rounded bg-slate-100 mx-auto" />
                                </td>
                            </tr>
                        ))
                    ) : allocations.length === 0 ? (
                        <tr>
                            <td colSpan={onToggleAll ? 6 : 5} className="px-5 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-300 mb-3">
                                    <FontAwesomeIcon
                                        icon={faMagnifyingGlass}
                                        className="text-lg"
                                    />
                                </div>
                                <p className="text-xs font-bold text-slate-800">
                                    Tidak ada data penyaluran ditemukan
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Coba sesuaikan kata kunci pencarian Anda.
                                </p>
                            </td>
                        </tr>
                    ) : (
                        allocations.map((alloc) => {
                            const programTitle =
                                alloc.program?.title ||
                                alloc.donation?.program?.title ||
                                "Dana Umum / Wakaf Terbuka";

                            const donorName = alloc.donation?.donor_name || alloc.user?.name;
                            const isRowSelected = selected.has(alloc.id);

                            return (
                                <tr
                                    key={alloc.id}
                                    onClick={() => navigate(`${basePath}/allocations/${alloc.id}`)}
                                    className={`group cursor-pointer transition ${
                                        isRowSelected ? "bg-emerald-50/70" : "hover:bg-emerald-50/40"
                                    }`}
                                    title="Klik untuk melihat detail penyaluran"
                                >
                                    {onToggle && (
                                        <td
                                            className="w-12 px-4 py-4 text-center align-middle"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isRowSelected}
                                                onChange={() => onToggle(alloc.id)}
                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    <td className="px-5 py-4 align-middle whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                {
                                                    formatDate(
                                                        alloc.allocated_at || alloc.created_at,
                                                    ).split(",")[0]
                                                }
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {
                                                    formatDate(
                                                        alloc.allocated_at || alloc.created_at,
                                                    ).split(",")[1]
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-middle whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/60 max-w-xs truncate">
                                                <FontAwesomeIcon icon={faHandHoldingHeart} className="text-[10px] shrink-0" />
                                                <span className="truncate">{programTitle}</span>
                                            </span>
                                            {donorName && (
                                                <span className="text-[11px] text-slate-400 truncate max-w-[120px]" title={`Donatur: ${donorName}`}>
                                                    ({donorName})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-middle">
                                        <p
                                            className="text-xs font-medium text-slate-700 truncate max-w-xs xl:max-w-md"
                                            title={alloc.description || "Penyaluran dana program"}
                                        >
                                            {alloc.description || "Penyaluran dana program"}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-right align-middle whitespace-nowrap">
                                        <span className="font-heading text-sm font-bold text-rose-600 inline-block whitespace-nowrap">
                                            -{formatCurrency(alloc.amount)}
                                        </span>
                                    </td>
                                    <td
                                        className="px-5 py-4 text-center align-middle whitespace-nowrap"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="inline-flex items-center justify-center gap-1.5">
                                            <Link
                                                to={`${basePath}/allocations/${alloc.id}/edit`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-300"
                                                title="Edit Penyaluran"
                                            >
                                                <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                                            </Link>

                                            {alloc.proof_path && (
                                                <a
                                                    href={resolveStorageUrl(alloc.proof_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-600 shadow-xs transition hover:bg-emerald-50 hover:border-emerald-300"
                                                    title="Buka Bukti Dokumentasi"
                                                >
                                                    <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                                </a>
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
    );
}
