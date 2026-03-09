import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";
import { useBulkSelection } from "../../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../../components/ui/BulkActionsBar";
import { runWithConcurrency } from "../../../../lib/bulk";

// Components
import EditorBannersHeader from "../../../../components/management/editor/banner/list/EditorBannersHeader";
import EditorBannersTable from "../../../../components/management/editor/banner/list/EditorBannersTable";

// Types
import { type Banner } from "../../../../components/management/editor/banner/EditorBannerTypes";

export default function EditorBannersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selection = useBulkSelection<number>();
  const pageIds = banners.map(b => b.id);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<Banner[]>("/editor/banners");
      const list = Array.isArray(res.data) ? res.data : [];
      // Sort by display order
      setBanners(list.sort((a, b) => a.display_order - b.display_order));
    } catch {
      setError("Gagal memuat data banner. Silakan coba lagi.");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (banner: Banner) => {
    setDeletingId(banner.id);
    try {
      await http.delete(`/editor/banners/${banner.id}`);
      toast.success("Banner berhasil dihapus.");
      fetchBanners();
      selection.setSelected(new Set([...selection.selectedIds].filter(id => id !== banner.id)));
    } catch {
      toast.error("Gagal menghapus banner.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const idsToDelete = [...selection.selectedIds];
      const result = await runWithConcurrency(idsToDelete, 4, async (id) => {
        await http.delete(`/editor/banners/${id}`);
      });
      
      if (result.failed.length > 0) {
        toast.error(`Berhasil menghapus ${result.succeeded.length} banner, gagal ${result.failed.length}.`);
        selection.setSelected(new Set(result.failed.map(f => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} banner.`);
        selection.clear();
      }
      fetchBanners();
    } catch {
      toast.error("Terjadi kesalahan saat penghapusan massal.");
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <EditorBannersHeader 
        total={banners.length} 
        onCreate={() => navigate("/editor/banners/create")}
        loading={loading}
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <BulkActionsBar
        count={selection.count}
        itemLabel="banner"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={handleDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <EditorBannersTable
        banners={banners}
        loading={loading}
        selection={selection}
        onEdit={(id) => navigate(`/editor/banners/${id}/edit`)}
        onDelete={handleDelete}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        deletingId={deletingId}
      />

      {!loading && banners.length === 0 && !error && (
        <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
          <p className="text-sm font-bold">Belum ada banner yang ditambahkan</p>
          <p className="mt-1 text-xs">Klik tombol "Tambah Banner" untuk memulai slideshow beranda.</p>
        </div>
      )}
    </div>
  );
}
