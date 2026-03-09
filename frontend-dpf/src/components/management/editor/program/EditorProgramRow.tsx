import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { type Program } from "./EditorProgramTypes";
import { formatDate, formatCurrency, getStatusTone, formatStatusLabel } from "./EditorProgramUtils";

type Props = {
    program: Program;
    isSelected: boolean;
    onToggle: () => void;
    onEdit: () => void;
};

export default function EditorProgramRow({ program, isSelected, onToggle, onEdit }: Props) {
    return (
        <tr className="hover:bg-slate-50">
            <td className="px-6 py-5">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggle}
                    aria-label={`Pilih program ${program.title}`}
                    className="h-4 w-4 accent-brandGreen-600"
                />
            </td>
            <td className="px-6 py-5">
                <button type="button" onClick={onEdit} className="group text-left">
                    <p className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-brandGreen-700">
                        {program.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex max-w-full line-clamp-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                            {program.category}
                        </span>
                        {program.is_highlight ? (
                            <span className="inline-flex items-center rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white ring-1 ring-violet-700/70">
                                Highlight
                            </span>
                        ) : null}
                        <span className="text-xs font-semibold text-slate-500">
                            Target: <span className="font-bold text-slate-700">{formatCurrency(program.target_amount)}</span>
                            <span className="mx-2 text-slate-300">-</span>
                            Terkumpul: <span className="font-bold text-slate-700">{formatCurrency(program.collected_amount)}</span>
                            <span className="mx-2 text-slate-300">-</span>
                            Batas hari: <span className="font-bold text-slate-700">{program.deadline_days ?? "–"}</span>
                        </span>
                    </div>
                </button>
            </td>
            <td className="px-6 py-5">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 whitespace-nowrap ${getStatusTone(program.status)}`}>
                    {formatStatusLabel(program.status)}
                </span>
            </td>
            <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                {formatDate(program.published_at ?? program.updated_at ?? program.created_at)}
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
                        aria-label="Ubah"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
