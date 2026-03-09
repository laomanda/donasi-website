import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { formatDate, getStatusTone, formatStatusLabel } from "../../../../utils/management/editorArticleUtils";
import type { Article } from "../../../../types/article";

type EditorArticleListProps = {
  items: Article[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
  };
  onEdit: (id: number) => void;
};

export default function EditorArticleList({
  items,
  loading,
  selection,
  onEdit,
}: EditorArticleListProps) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-100 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-5 animate-pulse">
            <div className="h-4 w-4/5 rounded bg-slate-100" />
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-6 w-24 rounded-full bg-slate-100" />
              <div className="h-10 w-10 rounded-2xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm font-semibold text-slate-500 md:hidden">
        Belum ada artikel. Klik "Buat Artikel" untuk mulai.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {items.map((article) => (
        <div key={article.id} className="p-5">
          <div className="flex items-start gap-3">
            <span onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selection.isSelected(article.id)}
                onChange={() => selection.toggle(article.id)}
                className="mt-1 h-4 w-4 accent-brandGreen-600"
              />
            </span>
            <button type="button" onClick={() => onEdit(article.id)} className="block w-full text-left">
              <p className="text-base font-bold text-slate-900">{article.title}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{article.excerpt}</p>
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 whitespace-nowrap ${getStatusTone(article.status)}`}>
                {formatStatusLabel(article.status)}
              </span>
              <span className="inline-flex max-w-[14rem] truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {article.category}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEdit(article.id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Diperbarui: {formatDate(article.updated_at ?? article.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}
