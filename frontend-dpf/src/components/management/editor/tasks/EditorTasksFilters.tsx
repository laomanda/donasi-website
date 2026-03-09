import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { statusOptions, priorityOptions } from "./EditorTasksTypes";

type Props = {
    search: string;
    onSearchChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    priority: string;
    onPriorityChange: (value: string) => void;
    perPage: number;
    onPerPageChange: (value: number) => void;
    pageLabel: string;
};

export default function EditorTasksFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    priority,
    onPriorityChange,
    perPage,
    onPerPageChange,
    pageLabel,
}: Props) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Cari</span>
                        <div className="relative mt-2">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                            </span>
                            <input
                                value={search}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder="Cari Judul Atau Deskripsi..."
                                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                            />
                        </div>
                    </label>

                    <label className="block">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</span>
                        <select
                            value={status}
                            onChange={(event) => onStatusChange(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        >
                            <option value="">Semua</option>
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Prioritas</span>
                        <select
                            value={priority}
                            onChange={(event) => onPriorityChange(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        >
                            <option value="">Semua</option>
                            {priorityOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <label className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm sm:w-auto sm:justify-start">
                    <span>Per halaman</span>
                    <select
                        value={perPage}
                        onChange={(event) => onPerPageChange(Number(event.target.value))}
                        className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                    </select>
                </label>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-600">{pageLabel}</p>
            </div>
        </div>
    );
}
