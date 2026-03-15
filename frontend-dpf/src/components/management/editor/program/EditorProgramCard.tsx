import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { type Program } from "./EditorProgramTypes";
import { formatDate, formatCurrency, getStatusTone, formatStatusLabel, getRemainingDays } from "./EditorProgramUtils";

type Props = {
    program: Program;
    isSelected: boolean;
    onToggle: () => void;
    onEdit: () => void;
};

export default function EditorProgramCard({ program, isSelected, onToggle, onEdit }: Props) {
    const remainingDays = getRemainingDays(program.published_at, program.deadline_days);
    const deadlineText = remainingDays !== null 
        ? (remainingDays > 0 ? `${remainingDays} hari` : "Selesai")
        : "Tanpa batas";

    return (
        <div className="p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
            <div className="flex items-start gap-3">
                <span onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggle}
                        aria-label={`Pilih program ${program.title}`}
                        className="mt-1 h-4 w-4 accent-brandGreen-600"
                    />
                </span>
                <button type="button" onClick={onEdit} className="block w-full text-left">
                    <p className="text-base font-bold text-slate-900 group-hover:text-brandGreen-700 transition line-clamp-2">{program.title}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 whitespace-nowrap ${getStatusTone(program.status)}`}>
                            {formatStatusLabel(program.status)}
                        </span>
                        <span className="inline-flex max-w-[14rem] truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                            {program.category}
                        </span>
                        {program.is_highlight ? (
                            <span className="inline-flex items-center rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white ring-1 ring-violet-700/70">
                                Highlight
                            </span>
                        ) : null}
                    </div>
                </button>
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
                Target: <span className="font-bold text-slate-700">{formatCurrency(program.target_amount)}</span>
                <span className="mx-2 text-slate-300">-</span>
                Terkumpul: <span className="font-bold text-slate-700">{formatCurrency(program.collected_amount)}</span>
                <span className="mx-2 text-slate-300">-</span>
                Batas waktu: <span className="font-bold text-slate-700">{deadlineText}</span>
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-500">
                    {program.published_at ? "Tanggal program" : "Diperbarui"}: {formatDate(program.published_at ?? program.updated_at ?? program.created_at)}
                </p>
                <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700 shrink-0"
                    aria-label="Ubah"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>
            </div>
        </div>
    );
}
