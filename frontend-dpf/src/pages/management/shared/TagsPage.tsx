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
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
              Footer
            </span>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Tags</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
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

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="border-b border-slate-200 bg-slate-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    aria-label="Pilih semua tag di halaman"
                    className="h-4 w-4 accent-brandGreen-600"
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
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">Memuat tags...</td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">Belum ada tag.</td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <Fragment key={tag.id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selection.isSelected(tag.id)}
                          onChange={() => selection.toggle(tag.id)}
                          aria-label={`Pilih tag ${tag.name}`}
                          className="h-4 w-4 accent-brandGreen-600"
                        />
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-900">
                        <p className="line-clamp-1">{tag.name}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500 max-w-xs">
                        <p className="line-clamp-1">{tag.url || "-"}</p>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tag.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {tag.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">{tag.sort_order}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`${routeBase}/tags/${tag.id}/edit`)}
                          className="text-brandGreen-600 hover:text-brandGreen-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId((current) => (current === tag.id ? null : tag.id))}
                          disabled={deletingId === tag.id || bulkDeleting}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Hapus"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                    {confirmDeleteId === tag.id ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-0">
                          <div className="my-2 rounded-2xl border border-red-100 bg-red-50 p-4">
                            <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
                            <p className="mt-1 text-sm text-red-700">Yakin ingin menghapus tag "{tag.name}"? Klik "Ya, hapus" untuk melanjutkan.</p>
                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                                disabled={deletingId === tag.id || bulkDeleting}
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(tag)}
                                className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={deletingId === tag.id || bulkDeleting}
                              >
                                {deletingId === tag.id ? "Menghapus..." : "Ya, hapus"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}

export default TagsPage;
