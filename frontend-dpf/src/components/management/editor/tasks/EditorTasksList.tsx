import { type EditorTaskItem } from "./EditorTasksTypes";
import EditorTaskCard from "./EditorTaskCard";
import { TaskSkeleton, TaskEmpty } from "./EditorTasksUI";

type Props = {
    items: EditorTaskItem[];
    loading: boolean;
    updatingIds: number[];
    onStatusChange: (id: number, status: string) => void;
    emptyMessage: string;
};

export default function EditorTasksList({
    items,
    loading,
    updatingIds,
    onStatusChange,
    emptyMessage,
}: Props) {
    if (loading && items.length === 0) {
        return <TaskSkeleton />;
    }

    if (items.length === 0) {
        return <TaskEmpty message={emptyMessage} />;
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <EditorTaskCard
                    key={`task-${item.id}`}
                    item={item}
                    busy={updatingIds.includes(item.id)}
                    onStatusChange={(status) => onStatusChange(item.id, status)}
                />
            ))}
        </div>
    );
}
