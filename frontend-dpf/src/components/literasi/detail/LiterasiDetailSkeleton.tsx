export function LiterasiDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] lg:items-start animate-pulse">
      {/* Left Skeleton (Article) */}
      <div className="space-y-6">
        <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-slate-200" />
            <div className="h-6 w-32 rounded-full bg-slate-200" />
          </div>
          <div className="h-8 w-3/4 rounded-xl bg-slate-200" />
          <div className="h-4 w-1/2 rounded-md bg-slate-200" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="h-4 w-full rounded-md bg-slate-200" />
          <div className="h-4 w-5/6 rounded-md bg-slate-200" />
          <div className="h-4 w-2/3 rounded-md bg-slate-200" />
          <div className="h-4 w-4/5 rounded-md bg-slate-200" />
        </div>
      </div>

      {/* Right Skeleton (Sidebar) */}
      <div className="space-y-6 hidden lg:block">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="h-6 w-40 rounded-md bg-slate-200" />
          <div className="aspect-[16/9] w-full rounded-xl bg-slate-200" />
          <div className="h-4 w-3/4 rounded-md bg-slate-200" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="h-6 w-32 rounded-md bg-slate-200" />
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="h-16 w-20 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-16 w-20 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

