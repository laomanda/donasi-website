import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { formatDate, getStatusTone, formatStatusLabel } from "../../../../utils/management/editorArticleUtils";
import type { Article } from "../../../../types/article";

type EditorArticleTableProps = {
  items: Article[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
    toggleAll: (ids: number[]) => void;
  };
  pageIds: number[];
  onEdit: (id: number) => void;
};

export default function EditorArticleTable({
  items,
  loading,
  selection,
  pageIds,
  onEdit,
}: EditorArticleTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full table-fixed">
        <thead className="border-b border-slate-200 bg-slate-100">
          <tr>
            <th className="w-[4%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <input
                type="checkbox"
                checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                onChange={() => selection.toggleAll(pageIds)}
                className="h-4 w-4 accent-brandGreen-600"
              />
            </th>
            <th className="w-[40%] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Judul</th>
            <th className="w-[14%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Kategori</th>
            <th className="w-[14%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
            <th className="w-[18%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Diperbarui</th>
            <th className="w-[10%] px-4 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-4"><div className="h-4 w-4 rounded bg-slate-100" /></td>
                <td className="px-5 py-4"><div className="h-4 w-3/4 rounded bg-slate-100" /></td>
                <td className="px-4 py-4"><div className="h-4 w-2/3 rounded bg-slate-100" /></td>
                <td className="px-4 py-4"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
                <td className="px-4 py-4"><div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" /></td>
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                Belum ada artikel. Klik "Buat Artikel" untuk mulai.
              </td>
            </tr>
          ) : (
            items.map((article) => (
              <tr key={article.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selection.isSelected(article.id)}
                    onChange={() => selection.toggle(article.id)}
                    className="h-4 w-4 accent-brandGreen-600"
                  />
                </td>
                <td className="px-5 py-4 min-w-0">
                  <button type="button" onClick={() => onEdit(article.id)} className="group block w-full max-w-full min-w-0 overflow-hidden text-left transition">
                    <p className="line-clamp-2 overflow-hidden break-words text-sm font-bold text-slate-900 group-hover:text-brandGreen-700">
                      {article.title}
                    </p>
                    <p className="mt-1 line-clamp-1 overflow-hidden break-words text-xs font-semibold text-slate-500">{article.excerpt}</p>
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex max-w-full truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      {article.category}
                    </span>
                    {article.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-300">
                        <FontAwesomeIcon icon={faThumbtack} className="text-[9px]" />
                        Pin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 whitespace-nowrap ${getStatusTone(article.status)}`}>
                    {formatStatusLabel(article.status)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                  {formatDate(article.updated_at ?? article.created_at)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onEdit(article.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
