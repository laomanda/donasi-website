import React from "react";

export const PanelContentSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-6 w-full animate-pulse rounded-lg bg-slate-200"
        />
      ))}
    </div>
  );
};

export const DashboardPageSkeleton: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 sm:px-5 md:px-6 lg:px-8 py-4">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-300" />
        </div>
      </div>

      {/* Period control strip skeleton */}
      <div className="h-14 w-full animate-pulse rounded-2xl bg-slate-200" />

      {/* KPI Grid skeleton */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>

      {/* 2 panels skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      {/* Integrity & Journals skeleton */}
      <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-56 w-full animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
};
