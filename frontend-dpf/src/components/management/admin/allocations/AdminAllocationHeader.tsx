import { useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faFileArrowDown,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

type AdminAllocationHeaderProps = {
    total: number;
    exporting?: boolean;
    onExport?: (format: "pdf" | "xlsx") => void;
};

export default function AdminAllocationHeader({
    total,
    exporting = false,
    onExport,
}: AdminAllocationHeaderProps) {
    const location = useLocation();
    const basePath = location.pathname.startsWith("/keuangan") ? "/keuangan" : "/admin";

    return (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 shadow-xl">
            {/* Background Decorative Accents */}
            <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-72 w-72 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 md:p-10">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    {/* Left: Title & Subtitle */}
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-200">
                                Total: {new Intl.NumberFormat("id-ID").format(total)} Transaksi
                            </span>
                        </div>

                        <div>
                            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                                Penyaluran Dana Program
                            </h1>
                            <p className="mt-1 max-w-2xl text-xs sm:text-sm font-medium text-emerald-100/90 leading-relaxed">
                                Monitoring dan kelola penyaluran dana program donasi & wakaf secara transparan dan akuntabel.
                            </p>
                        </div>
                    </div>

                    {/* Right: Action Buttons (Exports & Create in a single line) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0 overflow-x-auto pb-1 xl:pb-0">
                        {onExport && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onExport("xlsx")}
                                    disabled={exporting}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-white/25 active:scale-95 backdrop-blur-sm ring-1 ring-white/20 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
                                    title="Unduh laporan format Excel (.xlsx)"
                                >
                                    <FontAwesomeIcon
                                        icon={exporting ? faSpinner : faFileArrowDown}
                                        className={`text-xs ${exporting ? "animate-spin" : ""}`}
                                    />
                                    <span>Ekspor Excel</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onExport("pdf")}
                                    disabled={exporting}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-white/25 active:scale-95 backdrop-blur-sm ring-1 ring-white/20 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
                                    title="Unduh laporan format PDF"
                                >
                                    <FontAwesomeIcon
                                        icon={exporting ? faSpinner : faFileArrowDown}
                                        className={`text-xs ${exporting ? "animate-spin" : ""}`}
                                    />
                                    <span>Ekspor PDF</span>
                                </button>
                            </>
                        )}

                        <Link
                            to={`${basePath}/allocations/create`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-950/20 transition-all hover:bg-emerald-50 hover:shadow-xl active:scale-95 whitespace-nowrap shrink-0"
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="rounded-full bg-emerald-100 p-1 text-[10px] text-emerald-700"
                            />
                            <span>Buat Penyaluran Baru</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
