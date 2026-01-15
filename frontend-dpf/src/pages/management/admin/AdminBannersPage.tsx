import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import imagePlaceholder from "../../../brand/assets/image-placeholder.jpg";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";
import { runWithConcurrency } from "../../../lib/bulk";

type Banner = {
  id: number;
  image_path: string;
  display_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getBackendBaseUrl = () => {
  const api = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const backend = import.meta.env.VITE_BACKEND_URL ?? api.replace(/\/api(\/v1)?$/, "");
  return String(backend).replace(/\/$/, "");
};

const resolveStorageUrl = (path: string | null | undefined) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${getBackendBaseUrl()}/storage/${clean}`;
};

export function AdminBannersPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((banner) => banner.id), [items]);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Banner[]>("/admin/banners");
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
    } catch {
      setError("Gagal memuat data banner.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBanners();
  }, []);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const onDelete = async (banner: Banner) => {
    const confirmed = window.confirm("Hapus banner ini? Banner yang dihapus tidak akan tampil di landing page.");
    if (!confirmed) return;
    setDeletingId(banner.id);
    setError(null);
    try {
      await http.delete(`/admin/banners/${banner.id}`);
      await fetchBanners();
    } catch {
      setError("Gagal menghapus banner.");
    } finally {
      setDeletingId(null);
    }
  };

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    const confirmed = window.confirm("Hapus semua banner yang dipilih?");
    if (!confirmed) return;
    setBulkDeleting(true);
    setError(null);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/admin/banners/${id}`);
      });
      if (result.failed.length) {
        setError(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`);
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        selection.clear();
      }
      await fetchBanners();
    } finally {
      setBulkDeleting(false);
    }
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [items]);

  const total = items.length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              Banner
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Banner</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kelola slideshow banner yang tampil di bagian atas landing page.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-primary-700 ring-1 ring-primary-100">
                Total: <span className="ml-1 font-bold text-slate-900">{total}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/banners/create")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            Tambah Banner
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      <BulkActionsBar
        count={selection.count}
        itemLabel="banner"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="border-b border-primary-100 bg-primary-50">
              <tr className="text-xs font-bold tracking-wide text-slate-500">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    aria-label="Pilih semua banner di halaman"
                    className="h-4 w-4"
                  />
                </th>
                <th className="px-6 py-4">Urutan</th>
                <th className="px-6 py-4">Banner</th>
                <th className="px-6 py-4">Diperbarui</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-6 w-14 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-28 rounded-2xl bg-slate-100" />
                        <div className="h-4 w-40 rounded bg-slate-100" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada banner.
                  </td>
                </tr>
              ) : (
                sorted.map((banner) => {
                  const imageUrl = resolveStorageUrl(banner.image_path) ?? imagePlaceholder;
                  const updated = banner.updated_at ?? banner.created_at;
                  return (
                    <tr key={banner.id} className="hover:bg-primary-50">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selection.isSelected(banner.id)}
                          onChange={() => selection.toggle(banner.id)}
                          aria-label={`Pilih banner ${banner.display_order ?? 0}`}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                          #{banner.display_order ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-28 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                            <img
                              src={imageUrl}
                              alt="Banner"
                              className="h-full w-full object-cover"
                              onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">Banner #{banner.display_order ?? 0}</p>
                            <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
                              {banner.image_path ? banner.image_path : "Tanpa path"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDate(updated)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/banners/${banner.id}/edit`)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                            aria-label="Ubah"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDelete(banner)}
                            className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Hapus"
                            disabled={deletingId === banner.id || bulkDeleting}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-24 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                  <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))
          ) : sorted.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Belum ada banner.
            </div>
          ) : (
            sorted.map((banner) => {
              const imageUrl = resolveStorageUrl(banner.image_path) ?? imagePlaceholder;
              const updated = banner.updated_at ?? banner.created_at;
              return (
                <div key={banner.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selection.isSelected(banner.id)}
                      onChange={() => selection.toggle(banner.id)}
                      aria-label={`Pilih banner ${banner.display_order ?? 0}`}
                      className="mt-2 h-4 w-4"
                    />
                    <button type="button" onClick={() => navigate(`/admin/banners/${banner.id}/edit`)} className="w-full text-left">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-24 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                          <img
                            src={imageUrl}
                            alt="Banner"
                            className="h-full w-full object-cover"
                            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-bold text-slate-900">Banner #{banner.display_order ?? 0}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{banner.image_path ?? "-"}</p>
                          <p className="mt-2 text-xs font-semibold text-slate-500">Diperbarui: {formatDate(updated)}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      #{banner.display_order ?? 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/banners/${banner.id}/edit`)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                      aria-label="Ubah"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(banner)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Hapus"
                      disabled={deletingId === banner.id || bulkDeleting}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {!loading && !error && sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
          Banner belum tersedia. Tambahkan banner pertama untuk ditampilkan di landing page.
        </div>
      ) : null}
    </div>
  );
}

export default AdminBannersPage;
