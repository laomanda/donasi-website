import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";

export function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
          <h2 className="font-heading text-xl font-bold text-slate-900">{title}</h2>
        </div>
        {subtitle ? <p className="text-sm font-medium text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  loading,
  title,
  value,
  icon,
  theme,
}: {
  loading: boolean;
  title: string;
  value: string;
  icon: any;
  theme: "emerald" | "amber" | "rose" | "violet" | "slate";
}) {
  const [primaryTitle, secondaryTitle] = (() => {
    const parts = String(title ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return [parts[0] ?? "", ""];
    return [parts[0] ?? "", parts.slice(1).join(" ")];
  })();

  const styles = {
    emerald: { accent: "border-l-emerald-600", icon: "bg-emerald-600 text-white" },
    amber: { accent: "border-l-amber-500", icon: "bg-amber-500 text-slate-900" },
    rose: { accent: "border-l-rose-600", icon: "bg-rose-600 text-white" },
    violet: { accent: "border-l-violet-600", icon: "bg-violet-600 text-white" },
    slate: { accent: "border-l-slate-700", icon: "bg-slate-700 text-white" },
  }[theme];

  return (
    <div className={`rounded-[24px] border border-slate-200 border-l-4 p-5 shadow-sm transition-all hover:shadow-md ${styles.accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
          ) : (
            <span className="block font-heading text-3xl font-bold text-slate-900">{value}</span>
          )}
          <div className="mt-2 min-h-[34px] text-xs font-bold uppercase leading-4 tracking-[0.18em] text-slate-500">
            <span className="block">{primaryTitle}</span>
            {secondaryTitle && <span className="block">{secondaryTitle}</span>}
          </div>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ${styles.icon}`}>
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-200" />;
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-8 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white ring-1 ring-slate-800">
        <FontAwesomeIcon icon={faLayerGroup} />
      </div>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
    </div>
  );
}
