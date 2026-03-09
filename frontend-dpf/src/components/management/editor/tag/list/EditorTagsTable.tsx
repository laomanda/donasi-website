import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { type Tag } from "../EditorTagTypes";

type Props = {
  tags: Tag[];
  loading: boolean;
  selection: {
    selectedIds: number[];
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
    toggleAll: (ids: number[]) => void;
  };
  onEdit: (id: number) => void;
  onDelete: (tag: Tag) => void;
  confirmDeleteId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
  deletingId: number | null;
  bulkDeleting: boolean;
};

export default function EditorTagsTable({
  tags,
  loading,
  selection,
  onEdit,
  onDelete,
  confirmDeleteId,
  setConfirmDeleteId,
  deletingId,
  bulkDeleting,
}: Props) {
  const pageIds = tags.map((t) => t.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id));

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* MOBILE VIEW ARTIKEL CARDS */}
      <div className="block divide-y divide-slate-100 lg:hidden">
        {loading ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">Memuat tags...</div>
        ) : tags.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-500">Belum ada tag.</div>
        ) : (
          tags.map((tag) => (
            <div key={`card-${tag.id}`} className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selection.isSelected(tag.id)}
                    onChange={() => selection.toggle(tag.id)}
                    className="h-5 w-5 rounded accent-brandGreen-600"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-bold text-slate-900">{tag.name}</h3>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        tag.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tag.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{tag.url || "Tanpa URL"}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-400">
                    <span className="inline-flex items-center gap-1.5 uppercase tracking-wider">
                      Urutan: <span className="text-slate-900 font-bold">{tag.sort_order}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onEdit(tag.id)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  disabled={bulkDeleting}
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDeleteId(confirmDeleteId === tag.id ? null : tag.id)}
                  disabled={deletingId === tag.id || bulkDeleting}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </button>
              </div>

              {confirmDeleteId === tag.id && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
                  <p className="mt-1 text-xs leading-relaxed text-red-700">
                    Yakin ingin menghapus tag "{tag.name}"? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 rounded-xl bg-white py-2 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                      disabled={deletingId === tag.id || bulkDeleting}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => onDelete(tag)}
                      className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700"
                      disabled={deletingId === tag.id || bulkDeleting}
                    >
                      {deletingId === tag.id ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* TABLE VIEW (Large screens) */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => selection.toggleAll(pageIds)}
                  className="h-4 w-4 rounded accent-brandGreen-600 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Tag</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">URL</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Urutan</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm font-bold text-slate-400">
                  Memuat tags...
                </td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm font-bold text-slate-400">
                  Belum ada tag.
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <Fragment key={tag.id}>
                  <tr className="group transition hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selection.isSelected(tag.id)}
                        onChange={() => selection.toggle(tag.id)}
                        className="h-4 w-4 rounded accent-brandGreen-600 transition cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{tag.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">
                      <p className="line-clamp-1">{tag.url || "-"}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ring-1 ring-inset ${
                          tag.is_active ? "bg-green-50 text-green-700 ring-green-100" : "bg-red-50 text-red-700 ring-red-100"
                        }`}
                      >
                        {tag.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{tag.sort_order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => onEdit(tag.id)}
                          disabled={bulkDeleting}
                          className="font-bold text-brandGreen-600 hover:text-brandGreen-700 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(confirmDeleteId === tag.id ? null : tag.id)}
                          disabled={deletingId === tag.id || bulkDeleting}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {confirmDeleteId === tag.id && (
                    <tr className="bg-rose-50/10">
                      <td colSpan={6} className="px-6 py-3">
                        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold text-rose-800">
                              Hapuskan tag <span className="font-bold">"{tag.name}"</span>?
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                                disabled={deletingId === tag.id || bulkDeleting}
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => onDelete(tag)}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
                                disabled={deletingId === tag.id || bulkDeleting}
                              >
                                {deletingId === tag.id ? "Menghapus..." : "Ya, Hapus"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
