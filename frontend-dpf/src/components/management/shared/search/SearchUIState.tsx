export function LoadingList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{message}</div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
      {message}
    </div>
  );
}

import type { LoadState } from "@/types/search";

export const renderSectionContent = <T,>(
  state: LoadState<T>,
  emptyLabel: string,
  renderItem: (item: T) => React.ReactNode
) => {
  if (state.loading) return <LoadingList />;
  if (state.error) return <ErrorState message={state.error} />;
  if (!state.data.length) return <EmptyState message={emptyLabel} />;
  return state.data.map(renderItem);
};
