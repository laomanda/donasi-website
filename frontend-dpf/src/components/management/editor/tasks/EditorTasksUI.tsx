import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export function TaskSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={["rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8", className].join(" ")}>
            {children}
        </div>
    );
}

export function TaskBadge({ label, icon, className = "" }: { label: string; icon?: any; className?: string }) {
    return (
        <div className={["flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 sm:py-3", className].join(" ")}>
            {icon && <FontAwesomeIcon icon={icon} className="text-brandGreen-600" />}
            <span>{label}</span>
        </div>
    );
}

export function TaskError({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-700 bg-rose-600 p-4 text-sm font-semibold text-white">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            {message}
        </div>
    );
}

export function TaskSkeleton() {
    return (
        <div className="space-y-3">
            <div className="h-40 w-full animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-40 w-full animate-pulse rounded-3xl bg-slate-100" />
        </div>
    );
}

export function TaskEmpty({ message }: { message: string }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm font-semibold text-slate-500">
            {message}
        </div>
    );
}
