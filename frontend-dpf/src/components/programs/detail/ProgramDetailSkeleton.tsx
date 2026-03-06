export function ProgramDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <div className="h-[320px] rounded-[32px] bg-slate-100 animate-pulse sm:h-[380px]" />
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-5 w-40 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-4 h-8 w-4/5 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-3 h-4 w-2/3 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-6 w-40 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-5 space-y-3">
            <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
            <div className="h-4 w-5/6 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-4 w-4/6 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="space-y-6 lg:col-span-5">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-4 w-28 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-4 h-8 w-3/4 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-6 h-12 w-full rounded-2xl bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-4 w-40 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-12 w-full rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
