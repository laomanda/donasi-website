import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { useBulkSelection } from "@/components/ui/useBulkSelection";
import { BulkActionsBar } from "@/components/ui/BulkActionsBar";
import { runWithConcurrency } from "@/lib/bulk";
import EditorGalleryDpfHeader from "@/components/management/editor/gallery-dpf/list/EditorGalleryDpfHeader";
import EditorGalleryDpfTable from "@/components/management/editor/gallery-dpf/list/EditorGalleryDpfTable";
import type { GalleryDpf } from "@/components/management/editor/gallery-dpf/GalleryDpfTypes";

type PaginatedGallery = {
  data: GalleryDpf[];
  current_page: number;
  last_page: number;
  total: number;
};

export default function EditorGalleryDpfPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<GalleryDpf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((a) => a.id), [items]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await http.get<PaginatedGallery>("/editor/gallery-dpf", {
        params: {
          page,
          per_page: 15,
          status: status || undefined,
          q: search || undefined,
        },
      });
      setItems(response.data.data ?? []);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch {
      setItems([]);
      setError("Gagal memuat galeri aktivitas DPF. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, status]);

  useEffect(() => {
    selection.keepOnly(pageIds);
  }, [pageIds.join(",")]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleDelete = async (item: GalleryDpf) => {
    setDeletingId(item.id);
    try {
      await http.delete(`/editor/gallery-dpf/${item.id}`);
      toast.success("Aktivitas DPF berhasil dihapus.", { title: "Berhasil" });
      setConfirmDeleteId(null);
      selection.setSelected(new Set([...selection.selectedIds].filter((id) => id !== item.id)));
      fetchItems();
    } catch {
      toast.error("Gagal menghapus aktivitas DPF.", { title: "Gagal" });
    } finally {
      setDeletingId(null);
    }
  };

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const idsToDelete = [...selection.selectedIds];
      const result = await runWithConcurrency(idsToDelete, 4, async (id) => {
        await http.delete(`/editor/gallery-dpf/${id}`);
      });

      if (result.failed.length > 0) {
        toast.error(
          `Berhasil menghapus ${result.succeeded.length} item, gagal ${result.failed.length}.`,
          { title: "Sebagian Gagal" }
        );
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} aktivitas DPF.`, {
          title: "Berhasil",
        });
        selection.clear();
      }

      fetchItems();
    } catch {
      toast.error("Terjadi kesalahan saat penghapusan massal.", { title: "Gagal" });
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header Banner */}
      <EditorGalleryDpfHeader
        total={pagination.total}
        loading={loading}
        onCreate={() => navigate("/editor/gallery-dpf/create")}
      />

      {/* Filter & Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari caption..."
            className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draf</option>
          <option value="published">Terbit</option>
          <option value="archived">Arsip</option>
        </select>
        <button
          type="submit"
          className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
        >
          Cari
        </button>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        count={selection.count}
        itemLabel="aktivitas DPF"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      {/* Main Table */}
      <EditorGalleryDpfTable
        items={items}
        loading={loading}
        selection={selection}
        onEdit={(id) => navigate(`/editor/gallery-dpf/${id}/edit`)}
        onDelete={handleDelete}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        deletingId={deletingId}
      />

      {/* Pagination Footer */}
      {!loading && pagination.last_page > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 shadow-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-xl px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
          >
            ← Sebelumnya
          </button>
          <span>
            Halaman {pagination.current_page} dari {pagination.last_page}
          </span>
          <button
            type="button"
            disabled={page >= pagination.last_page}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-xl px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
          >
            Berikutnya →
          </button>
        </div>
      )}
    </div>
  );
}
