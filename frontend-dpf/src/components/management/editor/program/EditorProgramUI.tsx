import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export function SectionCard({ children, className = "", borderL = "" }: { children: React.ReactNode; className?: string; borderL?: string }) {
    return (
        <div className={[
            "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8",
            borderL ? `border-l-4 ${borderL}` : "",
            className
        ].join(" ")}>
            {children}
        </div>
    );
}

export function FormSection({ title, subtitle, icon: Icon, children, className = "", borderL = "" }: { title: string; subtitle?: string; icon?: any; children: React.ReactNode; className?: string; borderL?: string }) {
    return (
        <div className={[
            "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8",
            borderL ? `border-l-4 ${borderL}` : "",
            className
        ].join(" ")}>
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="font-heading text-xl font-semibold text-slate-900">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
                </div>
                {Icon && (
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                        <FontAwesomeIcon icon={Icon} />
                    </span>
                )}
            </div>
            {children}
        </div>
    ); SectionCard }

export function ErrorState({ message }: { message: string }) {
    return (
        <div className="rounded-2xl border border-rose-600 bg-rose-500 p-4 text-sm font-semibold text-white">
            <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                {message}
            </div>
        </div>
    );
}

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-20 w-full rounded-2xl bg-slate-100" />
            ))}
        </div>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="p-12 text-center text-sm font-semibold text-slate-500 rounded-[28px] border border-dashed border-slate-300 bg-white">
            {message}
        </div>
    );
}

export function FormLabel({ label, required, optional, subLabel }: { label: string; required?: boolean; optional?: boolean; subLabel?: string }) {
    return (
        <span className="block mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {label} {required && <span className="text-red-500">*</span>} {optional && <span className="text-slate-400">(opsional)</span>}
            </span>
            {subLabel && <p className="mt-1 text-xs text-slate-500">{subLabel}</p>}
        </span>
    );
}
