import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExternalLinkAlt,
    faHandHoldingHeart,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import type { Allocation } from "@/types/allocation";
import { resolveStorageUrl } from "@/lib/urls";

type AdminAllocationListProps = {
    allocations: Allocation[];
    loading: boolean;
    formatDate: (val: string) => string;
    formatCurrency: (val: number) => string;
    selected?: Set<number>;
    onToggle?: (id: number) => void;
};

export default function AdminAllocationList({
    allocations,
    loading,
    formatDate,
    formatCurrency,
    selected = new Set(),
    onToggle,
}: AdminAllocationListProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith("/keuangan") ? "/keuangan" : "/admin";

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
                    <p className="text-sm font-bold text-slate-900">
                        Tidak ada data penyaluran ditemukan
                    </p>
                </div>
            ) : (
                allocations.map((alloc) => {
                    const programTitle =
                        alloc.program?.title ||
                        alloc.donation?.program?.title ||
                        "Dana Umum / Wakaf Terbuka";

                    const isCardSelected = selected.has(alloc.id);

                    return (
                        <div
                            key={alloc.id}
                            onClick={() => navigate(`${basePath}/allocations/${alloc.id}`)}
                            className={`p-5 space-y-3 cursor-pointer active:bg-slate-50 transition-colors ${
                                isCardSelected ? "bg-emerald-50/60" : ""
                            }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {onToggle && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isCardSelected}
                                                onChange={() => onToggle(alloc.id)}
                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/60 max-w-[180px] truncate">
                                        <FontAwesomeIcon icon={faHandHoldingHeart} className="text-[10px] shrink-0" />
                                        <span className="truncate">{programTitle}</span>
                                    </span>
                                </div>
                                <p className="font-heading text-sm font-bold text-rose-600 shrink-0">
                                    -{formatCurrency(alloc.amount)}
                                </p>
                            </div>

                            <p className="text-xs font-medium text-slate-800 leading-relaxed line-clamp-2">
                                {alloc.description || "Penyaluran dana program"}
                            </p>

                            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2">
                                <p className="text-[11px] text-slate-400 font-medium">
                                    {formatDate(alloc.allocated_at || alloc.created_at)}
                                </p>

                                <div
                                    className="flex items-center gap-1.5"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link
                                        to={`${basePath}/allocations/${alloc.id}/edit`}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-emerald-700"
                                        title="Edit Penyaluran"
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                                    </Link>

                                    {alloc.proof_path && (
                                        <a
                                            href={resolveStorageUrl(alloc.proof_path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-600 shadow-xs transition hover:bg-emerald-50"
                                            title="Bukti Dokumentasi"
                                        >
                                            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
