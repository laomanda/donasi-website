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

interface AdminSuggestionTableProps {
  items: Suggestion[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggleAll: (ids: number[]) => void;
    toggle: (id: number) => void;
  };
  pageIds: number[];
  onOpenDetail: (id: number) => void;
}

export const AdminSuggestionTable = ({
  items,
  loading,
  selection,
  pageIds,
  onOpenDetail,
}: AdminSuggestionTableProps) => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full table-fixed overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-[5%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <input
                  type="checkbox"
                  checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                  onChange={() => selection.toggleAll(pageIds)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="w-[20%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Donatur
              </th>
              <th className="w-[12%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Kategori
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Status
              </th>
              <th className="w-[35%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Pesan
              </th>
              <th className="w-[18%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Waktu
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-4 w-4 rounded bg-slate-100" /></td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-32 rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                  </td>
                  <td className="px-6 py-5"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-6 w-16 rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-full rounded bg-slate-100" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                  Belum ada saran masuk.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const borderTone = item.category === "bug" ? "border-red-500" : item.category === "appreciation" ? "border-emerald-500" : item.category === "suggestion" ? "border-amber-500" : "border-slate-500";
                return (
                  <tr
                    key={item.id}
                    className={`group cursor-pointer border-l-[6px] border-transparent transition hover:bg-slate-50 ${borderTone.replace("border-", "hover:border-")}`}
                    onClick={() => onOpenDetail(item.id)}
                  >
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selection.isSelected(item.id)}
                        onChange={() => selection.toggle(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        {!!item.is_anonymous && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Anonim</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.phone}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold ${getCategoryTone(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === "baru" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
                        {item.status === "baru" ? "Baru" : "Dibalas"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="line-clamp-2 text-sm font-medium leading-relaxed text-slate-700">{item.message}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-slate-600">
                      {formatDateTime(item.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSuggestionTable;
