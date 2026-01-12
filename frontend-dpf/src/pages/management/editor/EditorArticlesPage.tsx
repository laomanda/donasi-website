import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faFilter,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../lib/bulk";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";

type ArticleStatus = "draft" | "review" | "published" | string;

type Article = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  status: ArticleStatus;
  updated_at?: string | null;
  created_at?: string | null;
};

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const getStatusTone = (status: ArticleStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "published") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (s === "review") return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-amber-50 text-amber-700 ring-amber-100";
};

const formatStatusLabel = (status: ArticleStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "published") return "Terbit";
  if (s === "review") return "Menunggu peninjauan";
  if (s === "draft") return "Draf";
  return String(status || "-");
};

export function EditorArticlesPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((a) => a.id), [items]);

  const hasFilters = Boolean(q.trim() || status || category.trim());

  const fetchArticles = async (
    nextPage: number,
    overrides?: Partial<{ q: string; status: ArticleStatus; category: string; perPage: number }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const categoryValue = (overrides?.category ?? category).trim();
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<Article>>("/editor/articles", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
          category: categoryValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat data artikel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchArticles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const onApplyFilters = () => void fetchArticles(1);
  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setCategory("");
    void fetchArticles(1, { q: "", status: "", category: "" });
  };

  const goEdit = (id: number) => navigate(`/editor/articles/${id}/edit`);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/editor/articles/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} artikel.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchArticles(1);
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              Konten
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Artikel</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Buat dan kelola artikel: draf, peninjauan, dan terbit.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/editor/articles/create")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            Buat Artikel
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Cari</span>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari judul atau ringkasan..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Semua status</option>
                <option value="draft">Draf</option>
                <option value="review">Menunggu peninjauan</option>
                <option value="published">Terbit</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Kategori</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Mis. edukasi"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="text-slate-400">
                <FontAwesomeIcon icon={faFilter} />
              </span>
              <span>Per halaman</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </label>

            <button
              type="button"
              onClick={onApplyFilters}
              className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
            >
              Terapkan
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Atur ulang
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-600">{pageLabel}</p>
          <p className="text-xs font-semibold text-slate-500">Klik judul untuk edit.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <BulkActionsBar
        count={selection.count}
        itemLabel="artikel"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="border-b border-primary-100 bg-primary-50">
              <tr>
                <th className="w-[6%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <input
                    type="checkbox"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    aria-label="Pilih semua artikel di halaman"
                    className="h-4 w-4"
                  />
                </th>
                <th className="w-[44%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Judul</th>
                <th className="w-[18%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Kategori</th>
                <th className="w-[14%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="w-[12%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Diperbarui</th>
                <th className="w-[6%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 w-4 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-3/4 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-2/3 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-28 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="ml-auto h-10 w-10 rounded-2xl bg-slate-100" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                    Belum ada artikel. Klik "Buat Artikel" untuk mulai.
                  </td>
                </tr>
              ) : (
                items.map((article) => (
                  <tr key={article.id} className="hover:bg-primary-50">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selection.isSelected(article.id)}
                        onChange={() => selection.toggle(article.id)}
                        aria-label={`Pilih artikel ${article.title}`}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <button type="button" onClick={() => goEdit(article.id)} className="group text-left">
                        <p className="truncate text-sm font-bold text-slate-900 group-hover:text-brandGreen-700">
                          {article.title}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{article.excerpt}</p>
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex max-w-full truncate rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(article.status)}`}>
                        {formatStatusLabel(article.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                      {formatDate(article.updated_at ?? article.created_at)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => goEdit(article.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                          aria-label="Ubah"
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

        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="h-4 w-4/5 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-6 w-24 rounded-full bg-slate-100" />
                  <div className="h-10 w-10 rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Belum ada artikel. Klik "Buat Artikel" untuk mulai.
            </div>
          ) : (
            items.map((article) => (
              <div key={article.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selection.isSelected(article.id)}
                      onChange={() => selection.toggle(article.id)}
                      aria-label={`Pilih artikel ${article.title}`}
                      className="mt-1 h-4 w-4"
                    />
                  </span>
                  <button type="button" onClick={() => goEdit(article.id)} className="block w-full text-left">
                    <p className="text-base font-bold text-slate-900">{article.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{article.excerpt}</p>
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusTone(article.status)}`}>
                      {formatStatusLabel(article.status)}
                    </span>
                    <span className="inline-flex max-w-[14rem] truncate rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                      {article.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goEdit(article.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                    aria-label="Ubah"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  Diperbarui: {formatDate(article.updated_at ?? article.created_at)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-slate-500">Halaman {page} dari {lastPage}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchArticles(Math.max(1, page - 1))}
              disabled={loading || page <= 1}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => void fetchArticles(Math.min(lastPage, page + 1))}
              disabled={loading || page >= lastPage}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Berikutnya
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorArticlesPage;




