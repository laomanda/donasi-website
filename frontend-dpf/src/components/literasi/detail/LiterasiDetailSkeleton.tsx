export function LiterasiDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 w-full rounded-3xl bg-slate-100" />
      <div className="h-6 w-3/4 rounded-full bg-slate-100" />
      <div className="h-4 w-1/2 rounded-full bg-slate-100" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded-full bg-slate-100" />
        <div className="h-4 w-5/6 rounded-full bg-slate-100" />
        <div className="h-4 w-2/3 rounded-full bg-slate-100" />
        <div className="h-4 w-4/5 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}
