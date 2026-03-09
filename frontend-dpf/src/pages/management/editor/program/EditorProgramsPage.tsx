import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../../lib/bulk";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";

// Modular Components
import EditorProgramsHeader from "../../../../components/management/editor/program/EditorProgramsHeader";
import EditorProgramsFilters from "../../../../components/management/editor/program/EditorProgramsFilters";
import EditorProgramsTable from "../../../../components/management/editor/program/EditorProgramsTable";
import EditorProgramsList from "../../../../components/management/editor/program/EditorProgramsList";
import EditorProgramsPagination from "../../../../components/management/editor/program/EditorProgramsPagination";
import { ErrorState } from "../../../../components/management/editor/program/EditorProgramUI";

// Types
import type { Program, ProgramStatus, PaginationPayload } from "../../../../components/management/editor/program/EditorProgramTypes";

export function EditorProgramsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<Program[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ProgramStatus>("");
  const [category, setCategory] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [debouncedCategory, setDebouncedCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<{ category: string; category_en: string | null }[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((p) => p.id), [items]);

  const hasFilters = Boolean(q.trim() || status || category.trim());

  useEffect(() => {
    http.get<{ category: string; category_en: string | null }[]>("/editor/programs/categories").then((res) => {
      setAvailableCategories(res.data ?? []);
    }).catch(() => {
      // Fail silently for categories
    });
  }, []);

  const fetchPrograms = async (
    nextPage: number,
    overrides?: Partial<{ q: string; status: ProgramStatus; category: string; perPage: number }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const categoryValue = (overrides?.category ?? category).trim();
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<Program>>("/editor/programs", {
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
      setError("Gagal memuat data program.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 400);
    return () => window.clearTimeout(handle);
  }, [q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedCategory(category.trim());
    }, 400);
    return () => window.clearTimeout(handle);
  }, [category]);

  useEffect(() => {
    void fetchPrograms(1, {
      q: debouncedQ,
      status,
      category: debouncedCategory,
      perPage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, debouncedCategory, status, perPage]);

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
    setDebouncedCategory("");
    void fetchPrograms(1, { q: "", status: "", category: "" });
  };

  const goEdit = (id: number) => navigate(`/editor/programs/${id}/edit`);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/editor/programs/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} program.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchPrograms(1);
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <EditorProgramsHeader />

      <EditorProgramsFilters 
        q={q} onQChange={setQ}
        status={status} onStatusChange={setStatus}
        category={category} onCategoryChange={setCategory}
        perPage={perPage} onPerPageChange={setPerPage}
        availableCategories={availableCategories}
        pageLabel={pageLabel}
        hasFilters={hasFilters}
        onResetFilters={onResetFilters}
      />

      {error && <ErrorState message={error} />}

      <BulkActionsBar
        count={selection.count}
        itemLabel="program"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <EditorProgramsTable 
            loading={loading}
            items={items}
            pageIds={pageIds}
            selected={selection.selected}
            onToggle={selection.toggle}
            onToggleAll={() => selection.toggleAll(pageIds)}
            onEdit={goEdit}
        />

        <EditorProgramsList 
            loading={loading}
            items={items}
            selected={selection.selected}
            onToggle={selection.toggle}
            onEdit={goEdit}
        />

        <EditorProgramsPagination 
            page={page}
            lastPage={lastPage}
            loading={loading}
            onPageChange={(p) => void fetchPrograms(p)}
        />
      </div>
    </div>
  );
}

export default EditorProgramsPage;



