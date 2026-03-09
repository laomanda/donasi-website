import { formatDateTime, getCategoryLabel, getCategoryTone } from "@/utils/management/adminSuggestionUtils";

interface Suggestion {
  id: number;
  name: string;
  phone: string;
  category: string;
  message: string;
  is_anonymous: boolean;
  status: "baru" | "dibalas";
  created_at: string;
}

interface AdminSuggestionMobileListProps {
  items: Suggestion[];
  loading: boolean;
  onOpenDetail: (id: number) => void;
}

export const AdminSuggestionMobileList = ({
  items,
  loading,
  onOpenDetail,
}: AdminSuggestionMobileListProps) => {
  return (
    <div className="divide-y divide-slate-100 lg:hidden">
      {loading ? (
        Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="p-5 animate-pulse">
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
            <div className="mt-4 h-6 w-24 rounded-full bg-slate-100" />
          </div>
        ))
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada saran masuk.</div>
      ) : (
        items.map((item) => {
          const borderTone = item.category === "bug" ? "border-red-500" : item.category === "appreciation" ? "border-emerald-500" : item.category === "suggestion" ? "border-amber-500" : "border-slate-500";
          return (
            <div
              key={item.id}
              className={`cursor-pointer border-l-4 p-4 space-y-3 transition hover:bg-emerald-50/30 ${borderTone}`}
              onClick={() => onOpenDetail(item.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="truncate">{item.name}</span>
                    {!!item.is_anonymous && (
                      <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Anonim</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{item.phone}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getCategoryTone(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${item.status === 'baru' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'}`}>
                    {item.status === 'baru' ? 'Baru' : 'Dibalas'}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/50 p-3 ring-1 ring-slate-100">
                <p className="line-clamp-2 text-xs font-medium leading-relaxed text-slate-600 italic">"{item.message}"</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{formatDateTime(item.created_at)}</span>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminSuggestionMobileList;
