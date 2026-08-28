import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";
import { runWithConcurrency } from "../../../../lib/bulk";
import type { Tag } from "../../../../components/management/editor/tag/EditorTagTypes";

// Components
import EditorTagsHeader from "../../../../components/management/editor/tag/list/EditorTagsHeader";
import EditorTagsFilters from "../../../../components/management/editor/tag/list/EditorTagsFilters";
import EditorTagsTable from "../../../../components/management/editor/tag/list/EditorTagsTable";
import EditorTagsList from "../../../../components/management/editor/tag/list/EditorTagsList";
import EditorTagsPagination from "../../../../components/management/editor/tag/list/EditorTagsPagination";

export default function EditorTagsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Tag[]>("/editor/tags");
      const list = Array.isArray(res.data) ? res.data : [];
      setTags(list);
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
    const handle = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [q]);

  // Client-side filtering & pagination for smooth performance
  const filteredTags = useMemo(() => {
    return tags.filter((t) => {
      if (status === "active" && !t.is_active) return false;
      if (status === "inactive" && t.is_active) return false;
      if (debouncedQ) {
        const query = debouncedQ.toLowerCase();
        const matchesName = (t.name || "").toLowerCase().includes(query);
        const matchesUrl = (t.url || "").toLowerCase().includes(query);
        if (!matchesName && !matchesUrl) return false;
      }
      return true;
    });
  }, [tags, debouncedQ, status]);

  const total = filteredTags.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  const paginatedTags = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredTags.slice(start, start + perPage);
  }, [filteredTags, page, perPage]);

  const pageIds = useMemo(() => paginatedTags.map((t) => t.id), [paginatedTags]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, status, perPage]);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const hasFilters = Boolean(q.trim() || status !== "all");

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const onResetFilters = () => {
    setQ("");
    setStatus("all");
    setDebouncedQ("");
    setPage(1);
  };

  const goEdit = (id: number) => navigate(`/editor/tags/${id}/edit`);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    setError(null);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/editor/tags/${id}`);
      });
      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, {
          title: "Sebagian gagal",
        });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} tag.`, { title: "Berhasil" });
        selection.clear();
      }
      await fetchTags();
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <EditorTagsHeader onCreate={() => navigate("/editor/tags/create")} />

      <EditorTagsFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
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
        itemLabel="tag"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <EditorTagsTable
          tags={paginatedTags}
          loading={loading}
          selection={selection}
          pageIds={pageIds}
          onEdit={goEdit}
        />

        <EditorTagsList
          tags={paginatedTags}
          loading={loading}
          selection={selection}
          onEdit={goEdit}
        />

        <EditorTagsPagination
          page={page}
          lastPage={lastPage}
          loading={loading}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
}
