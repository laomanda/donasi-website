import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { runWithConcurrency } from "@/lib/bulk";
import { useBulkSelection } from "@/components/ui/useBulkSelection";
import { BulkActionsBar } from "@/components/ui/BulkActionsBar";

// Modular Components
import AdminSuggestionHeader from "@/components/management/admin/suggestions/AdminSuggestionHeader";
import AdminSuggestionFilters from "@/components/management/admin/suggestions/AdminSuggestionFilters";
import AdminSuggestionTable from "@/components/management/admin/suggestions/AdminSuggestionTable";
import AdminSuggestionMobileList from "@/components/management/admin/suggestions/AdminSuggestionMobileList";
import AdminSuggestionPagination from "@/components/management/admin/suggestions/AdminSuggestionPagination";

interface PaginationPayload<T> {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

interface Suggestion {
  id: number;
  name: string;
  phone: string;
  category: string;
  message: string;
  is_anonymous: boolean;
  status: "baru" | "dibalas";
  created_at: string;
}

export function AdminSuggestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [items, setItems] = useState<Suggestion[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((item) => item.id), [items]);

  const hasFilters = Boolean(q.trim() || category || statusFilter);

  const fetchSuggestions = async (
    nextPage: number,
    overrides?: Partial<{ q: string; category: string; status: string; perPage: number }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const catValue = overrides?.category ?? category;
    const statusValue = overrides?.status ?? statusFilter;
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<Suggestion>>("/admin/suggestions", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          category: catValue || undefined,
          status: statusValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat data saran.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSuggestions(1);
  }, [perPage]);

  useEffect(() => {
    selection.keepOnly(pageIds);
  }, [pageIds.join(",")]);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSuggestions(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [q, category, statusFilter]);

  const onReset = () => {
    setQ("");
    setCategory("");
    setStatusFilter("");
  };

  const basePath = location.pathname.split("/").slice(0, 2).join("/");
  const openDetail = (id: number) => navigate(`${basePath}/suggestions/${id}`);

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    if (!window.confirm(`Hapus ${selection.count} saran terpilih?`)) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/admin/suggestions/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} saran.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchSuggestions(1);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    if (key === "q") setQ(value);
    if (key === "category") setCategory(value);
    if (key === "status") setStatusFilter(value);
    if (key === "perPage") setPerPage(value);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminSuggestionHeader total={total} />

      <AdminSuggestionFilters
        q={q}
        category={category}
        status={statusFilter}
        perPage={perPage}
        onFilterChange={handleFilterChange}
        onReset={onReset}
        hasFilters={hasFilters}
      />

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <BulkActionsBar
        count={selection.count}
        itemLabel="saran"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <AdminSuggestionTable
        items={items}
        loading={loading}
        selection={selection}
        pageIds={pageIds}
        onOpenDetail={openDetail}
      />

      <AdminSuggestionMobileList
        items={items}
        loading={loading}
        onOpenDetail={openDetail}
      />

      <AdminSuggestionPagination
        page={page}
        lastPage={lastPage}
        pageLabel={pageLabel}
        loading={loading}
        onPageChange={(nextPage) => void fetchSuggestions(nextPage)}
      />
    </div>
  );
}

export default AdminSuggestionsPage;
