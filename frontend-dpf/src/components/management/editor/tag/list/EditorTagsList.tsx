import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@/utils/management/editorArticleUtils";
import type { Tag } from "../EditorTagTypes";

type EditorTagsListProps = {
  tags: Tag[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
  };
  onEdit: (id: number) => void;
};

export default function EditorTagsList({
  tags,
  loading,
  selection,
  onEdit,
}: EditorTagsListProps) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-100 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-5 animate-pulse">
            <div className="h-4 w-3/5 rounded bg-slate-100" />
            <div className="mt-3 h-3 w-4/5 rounded bg-slate-100" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-6 w-20 rounded-full bg-slate-100" />
              <div className="h-10 w-10 rounded-2xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="p-8 text-center text-sm font-semibold text-slate-500 md:hidden">
        Belum ada tag. Klik "Tambah Tag" untuk mulai.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {tags.map((tag) => (
        <div key={tag.id} className="p-5">
          <div className="flex items-start gap-3">
            <span onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selection.isSelected(tag.id)}
                onChange={() => selection.toggle(tag.id)}
                className="mt-1 h-4 w-4 accent-brandGreen-600"
              />
            </span>
            <button
              type="button"
              onClick={() => onEdit(tag.id)}
              className="block w-full max-w-full overflow-hidden text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-base font-bold text-slate-900">{tag.name}</p>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 whitespace-nowrap ${
                    tag.is_active
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-rose-50 text-rose-700 ring-rose-200"
                  }`}
                >
                  {tag.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500 font-mono">
                {tag.url || "Tanpa URL"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Urutan: <span className="font-bold text-slate-700">#{tag.sort_order}</span>
              </p>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-500">
              Diperbarui: {formatDate(tag.updated_at ?? tag.created_at)}
            </p>

            <button
              type="button"
              onClick={() => onEdit(tag.id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
              title="Ubah Tag"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
