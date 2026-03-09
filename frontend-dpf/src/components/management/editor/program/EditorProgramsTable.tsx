import type { Program } from "./EditorProgramTypes";
import EditorProgramRow from "./EditorProgramRow";
import { LoadingSkeleton, EmptyState } from "./EditorProgramUI";

type Props = {
    loading: boolean;
    items: Program[];
    pageIds: number[];
    selected: Set<number>;
    onToggle: (id: number) => void;
    onToggleAll: () => void;
    onEdit: (id: number) => void;
};

export default function EditorProgramsTable({
    loading,
    items,
    pageIds,
    selected,
    onToggle,
    onToggleAll,
    onEdit,
}: Props) {
    const isAllSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

    if (loading) return <div className="p-6"><LoadingSkeleton /></div>;
    
    if (items.length === 0) {
        return <EmptyState message="Belum ada program. Klik 'Buat Program' untuk mulai." />;
    }

    return (
        <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full table-fixed">
                <thead className="border-b border-slate-200 bg-slate-100">
                    <tr>
                        <th className="w-[6%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={onToggleAll}
                                className="h-4 w-4 accent-brandGreen-600"
                            />
                        </th>
                        <th className="w-[56%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Program</th>
                        <th className="w-[16%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
                        <th className="w-[16%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Diperbarui</th>
                        <th className="w-[6%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map((program) => (
                        <EditorProgramRow
                            key={program.id}
                            program={program}
                            isSelected={selected.has(program.id)}
                            onToggle={() => onToggle(program.id)}
                            onEdit={() => onEdit(program.id)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
