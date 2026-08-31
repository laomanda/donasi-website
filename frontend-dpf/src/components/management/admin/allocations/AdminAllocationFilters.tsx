import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faHandHoldingHeart, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import type { AllocatableProgram } from "@/types/allocation";

type AdminAllocationFiltersProps = {
    q: string;
    setQ: (val: string) => void;
    programId: string;
    setProgramId: (val: string) => void;
    programs?: AllocatableProgram[];
};

const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number.isFinite(num) ? num : 0);
};

export default function AdminAllocationFilters({
    q,
    setQ,
    programId,
    setProgramId,
    programs = [],
}: AdminAllocationFiltersProps) {
    const hasFilter = Boolean(q || programId);

    // Only include programs that have funds/balance
    const fundedPrograms = programs.filter(
        (p) => p.collected_amount > 0 || p.remaining_balance > 0 || p.total_allocated > 0
    );

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative group flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-500">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                </span>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari keperluan, kegiatan, atau donatur..."
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5"
                />
            </div>

            {/* Program Dropdown Filter */}
            <div className="relative sm:w-80">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <FontAwesomeIcon icon={faHandHoldingHeart} className="text-xs" />
                </span>
                <select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-10 pr-10 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 cursor-pointer truncate"
                >
                    <option value="">Semua Program Bersaldo</option>
                    {fundedPrograms.map((p) => {
                        const val = p.program_id === null ? "general" : String(p.program_id);
                        return (
                            <option key={val} value={val}>
                                {p.program_title} (Tersedia: {formatRupiah(p.remaining_balance)})
                            </option>
                        );
                    })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Reset Button */}
            {hasFilter && (
                <button
                    type="button"
                    onClick={() => {
                        setQ("");
                        setProgramId("");
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-rose-600 active:scale-95 whitespace-nowrap"
                    title="Reset Filter"
                >
                    <FontAwesomeIcon icon={faRotateRight} className="text-xs" />
                    <span>Reset</span>
                </button>
            )}
        </div>
    );
}
