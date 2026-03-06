export function LiterasiSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="aspect-[16/9] w-full rounded-xl bg-slate-100 animate-pulse" />

      <div className="mt-5 flex gap-2">
        <div className="h-3 w-4 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
      </div>

      <div className="mt-4 h-6 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-2 h-6 w-3/4 rounded-full bg-slate-100 animate-pulse" />

      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
      </div>

      <div className="mt-auto pt-6">
        <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
