import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@/utils/management/editorArticleUtils";
import type { Tag } from "../EditorTagTypes";

type EditorTagsTableProps = {
  tags: Tag[];
  loading: boolean;
  selection: {
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
    toggleAll: (ids: number[]) => void;
  };
  pageIds: number[];
  onEdit: (id: number) => void;
};

export default function EditorTagsTable({
  tags,
  loading,
  selection,
  pageIds,
  onEdit,
}: EditorTagsTableProps) {
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
            <th className="w-[40%] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Nama Tag
            </th>
            <th className="w-[12%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Urutan
            </th>
            <th className="w-[14%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Status
            </th>
            <th className="w-[18%] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Diperbarui
            </th>
            <th className="w-[12%] px-4 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-4">
                  <div className="h-4 w-4 rounded bg-slate-100" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-12 rounded bg-slate-100" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-28 rounded bg-slate-100" />
                </td>
                <td className="px-4 py-4">
                  <div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" />
                </td>
              </tr>
            ))
          ) : tags.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                Belum ada tag. Klik "Tambah Tag" untuk mulai.
              </td>
            </tr>
          ) : (
            tags.map((tag) => (
              <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selection.isSelected(tag.id)}
                    onChange={() => selection.toggle(tag.id)}
                    className="h-4 w-4 accent-brandGreen-600"
                  />
                </td>
                <td className="px-5 py-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => onEdit(tag.id)}
                    className="group block w-full max-w-full min-w-0 overflow-hidden text-left transition"
                  >
                    <p className="truncate text-sm font-bold text-slate-900 group-hover:text-brandGreen-700">
                      {tag.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-mono text-slate-500">
                      {tag.url || "Tanpa URL"}
                    </p>
                  </button>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    #{tag.sort_order}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 whitespace-nowrap ${
                      tag.is_active
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-rose-50 text-rose-700 ring-rose-200"
                    }`}
                  >
                    {tag.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                  {formatDate(tag.updated_at ?? tag.created_at)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onEdit(tag.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-brandGreen-500 hover:text-brandGreen-700"
                      title="Ubah Tag"
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
