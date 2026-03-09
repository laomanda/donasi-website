import type { Program } from "./EditorProgramTypes";
import EditorProgramCard from "./EditorProgramCard";
import { LoadingSkeleton, EmptyState } from "./EditorProgramUI";

type Props = {
    loading: boolean;
    items: Program[];
    selected: Set<number>;
    onToggle: (id: number) => void;
    onEdit: (id: number) => void;
};

export default function EditorProgramsList({
    loading,
    items,
    selected,
    onToggle,
    onEdit,
}: Props) {
    if (loading) return <div className="md:hidden p-5"><LoadingSkeleton rows={4} /></div>;

    if (items.length === 0) {
        return (
            <div className="md:hidden">
                <EmptyState message="Belum ada program. Klik 'Buat Program' untuk mulai." />
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-100 md:hidden">
            {items.map((program) => (
                <EditorProgramCard
                    key={program.id}
                    program={program}
                    isSelected={selected.has(program.id)}
                    onToggle={() => onToggle(program.id)}
                    onEdit={() => onEdit(program.id)}
                />
            ))}
        </div>
    );
}
