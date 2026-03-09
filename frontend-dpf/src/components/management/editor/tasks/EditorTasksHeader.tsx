import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { TaskBadge, TaskSection } from "./EditorTasksUI";

type Props = {
    total: number;
    title: string;
    subtitle: string;
    badgeLabel: string;
};

export default function EditorTasksHeader({ total, title, subtitle, badgeLabel }: Props) {
    return (
        <TaskSection>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                        <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
                        {badgeLabel}
                    </span>
                    <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
                        {title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        {subtitle}
                    </p>
                </div>

                <TaskBadge icon={faListCheck} label={`Total: ${total}`} />
            </div>
        </TaskSection>
    );
}
