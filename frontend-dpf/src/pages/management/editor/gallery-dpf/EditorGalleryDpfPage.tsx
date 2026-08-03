import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import EditorGalleryDpfHeader from "@/components/management/editor/gallery-dpf/list/EditorGalleryDpfHeader";
import EditorGalleryDpfTable from "@/components/management/editor/gallery-dpf/list/EditorGalleryDpfTable";
import type { GalleryDpf } from "@/components/management/editor/gallery-dpf/GalleryDpfTypes";

type PaginatedGallery = { data: GalleryDpf[]; current_page: number; last_page: number; total: number };

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

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await http.get<PaginatedGallery>("/editor/gallery-dpf", { params: { page, per_page: 15, status: status || undefined, q: search || undefined } });
      setItems(response.data.data ?? []);
      setPagination({ current_page: response.data.current_page, last_page: response.data.last_page, total: response.data.total });
    } catch {
      setItems([]);
      setError("Gagal memuat gallery aktivitas DPF. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Keep the same local-effect data loading pattern used by existing Editor pages.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchItems(); }, [page, status]);

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
      fetchItems();
    } catch {
      toast.error("Gagal menghapus aktivitas DPF.", { title: "Gagal" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <EditorGalleryDpfHeader total={pagination.total} loading={loading} onCreate={() => navigate("/editor/gallery-dpf/create")} />
      <form onSubmit={handleSearch} className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari caption..." className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50" />
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-brandGreen-400 focus:outline-none focus:ring-4 focus:ring-brandGreen-50"><option value="">Semua status</option><option value="draft">Draf</option><option value="published">Terbit</option><option value="archived">Arsip</option></select>
        <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Cari</button>
      </form>
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
      <EditorGalleryDpfTable items={items} loading={loading} onEdit={(id) => navigate(`/editor/gallery-dpf/${id}/edit`)} onDelete={handleDelete} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} deletingId={deletingId} />
      {!loading && pagination.last_page > 1 && <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-xl px-3 py-2 hover:bg-slate-50 disabled:opacity-40">Sebelumnya</button><span>Halaman {pagination.current_page} dari {pagination.last_page}</span><button type="button" disabled={page >= pagination.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-xl px-3 py-2 hover:bg-slate-50 disabled:opacity-40">Berikutnya</button></div>}
    </div>
  );
}
