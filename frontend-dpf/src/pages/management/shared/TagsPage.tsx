import { useEffect, useMemo, useState, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import TagService from "../../../services/TagService";
import type { Tag } from "../../../services/TagService";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";
import { runWithConcurrency } from "../../../lib/bulk";
import http from "../../../lib/http";

const resolveRoleBase = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment === "admin" || segment === "editor") return segment;
  return "editor";
};

export function TagsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const roleBase = useMemo(() => resolveRoleBase(location.pathname), [location.pathname]);
  const routeBase = `/${roleBase}`;

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => tags.map((t) => t.id), [tags]);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TagService.getAll();
      setTags(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data tag.");
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTags();
  }, []);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const handleDelete = async (tag: Tag) => {
    setDeletingId(tag.id);
    setError(null);
    try {
      await TagService.delete(tag.id);
      await fetchTags();
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus tag.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    setConfirmDeleteId(null);
    setError(null);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/${roleBase}/tags/${id}`);
      });
      if (result.failed.length) {
        setError(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`);
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        selection.clear();
      }
      await fetchTags();
    } finally {
      setBulkDeleting(false);
    }
  };

  const total = tags.length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
              Footer
            </span>
            <h2 className="mt-2 truncate font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Tags</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Kelola daftar tag populer yang muncul di footer website.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-brandGreen-700 ring-1 ring-brandGreen-100">
                Total: <span className="ml-1 font-bold text-slate-900">{total}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`${routeBase}/tags/create`)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 sm:w-auto md:px-5 md:py-3"
          >
            <FontAwesomeIcon icon={faPlus} />
            Tambah Tag
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="tag"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

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
                       <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tag.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
                    onClick={() => navigate(`${routeBase}/tags/${tag.id}/edit`)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId((current) => (current === tag.id ? null : tag.id))}
                    disabled={deletingId === tag.id || bulkDeleting}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} size="sm" />
                  </button>
                </div>

                {confirmDeleteId === tag.id && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
                    <p className="mt-1 text-xs leading-relaxed text-red-700">Yakin ingin menghapus tag "{tag.name}"? Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 rounded-xl bg-white py-2 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200"
                        disabled={deletingId === tag.id || bulkDeleting}
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => void handleDelete(tag)}
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
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    className="h-4 w-4 rounded accent-brandGreen-600"
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
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-bold text-slate-400">Memuat tags...</td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-bold text-slate-400">Belum ada tag.</td>
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
                          className="h-4 w-4 rounded accent-brandGreen-600 transition"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        {tag.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">
                        <p className="line-clamp-1">{tag.url || "-"}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ring-1 ring-inset ${tag.is_active ? "bg-green-50 text-green-700 ring-green-100" : "bg-red-50 text-red-700 ring-red-100"}`}>
                          {tag.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                         {tag.sort_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => navigate(`${routeBase}/tags/${tag.id}/edit`)}
                            className="font-bold text-brandGreen-600 hover:text-brandGreen-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId((current) => (current === tag.id ? null : tag.id))}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50"
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
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => void handleDelete(tag)}
                                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
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
    </div>
  );
}

export default TagsPage;
