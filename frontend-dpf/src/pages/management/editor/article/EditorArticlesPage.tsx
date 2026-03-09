import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../../lib/bulk";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";

// Types
import type { Article, ArticleStatus, ArticlePaginationPayload } from "../../../../types/article";

// Components
import EditorArticleHeader from "../../../../components/management/editor/article/EditorArticleHeader";
import EditorArticleFilters from "../../../../components/management/editor/article/EditorArticleFilters";
import EditorArticleTable from "../../../../components/management/editor/article/EditorArticleTable";
import EditorArticleList from "../../../../components/management/editor/article/EditorArticleList";
import EditorArticlePagination from "../../../../components/management/editor/article/EditorArticlePagination";

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
  const [availableCategories, setAvailableCategories] = useState<Array<{ category: string; category_en: string | null }>>([]);
  const [debouncedQ, setDebouncedQ] = useState("");

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
      const res = await http.get<ArticlePaginationPayload>("/editor/articles", {
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

  const fetchCategories = async () => {
    try {
      const res = await http.get<Array<{ category: string; category_en: string | null }>>("/editor/articles/categories");
      setAvailableCategories(res.data ?? []);
    } catch {
      console.error("Gagal memuat kategori.");
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 400);
    return () => window.clearTimeout(handle);
  }, [q]);

  useEffect(() => {
    void fetchArticles(1, {
      q: debouncedQ,
      status,
      category: category,
      perPage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, category, status, perPage]);

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

  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setCategory("");
    setDebouncedQ("");
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
      <EditorArticleHeader onCreate={() => navigate("/editor/articles/create")} />

      <EditorArticleFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        availableCategories={availableCategories}
        perPage={perPage}
        setPerPage={setPerPage}
        onReset={onResetFilters}
        hasFilters={hasFilters}
        pageLabel={pageLabel}
      />

      {error && (
        <div className="rounded-2xl border border-rose-600 bg-rose-500 p-4 text-sm font-semibold text-white">
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
        <EditorArticleTable
          items={items}
          loading={loading}
          selection={selection}
          pageIds={pageIds}
          onEdit={goEdit}
        />

        <EditorArticleList
          items={items}
          loading={loading}
          selection={selection}
          onEdit={goEdit}
        />

        <EditorArticlePagination
          page={page}
          lastPage={lastPage}
          loading={loading}
          onPageChange={(p) => void fetchArticles(p)}
        />
      </div>
    </div>
  );
}

export default EditorArticlesPage;




