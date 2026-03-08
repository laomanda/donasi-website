import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  badge,
}: ChartCardProps) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h2 className="font-heading text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <div className="h-72 w-full">{children}</div>
    </div>
  );
}
