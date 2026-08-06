import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import http from "@/lib/http";
import EditorGalleryMitraHeader from "@/components/management/editor/gallery-mitra/list/EditorGalleryMitraHeader";
import EditorGalleryMitraTable from "@/components/management/editor/gallery-mitra/list/EditorGalleryMitraTable";
import type { GalleryMitra } from "@/components/management/editor/gallery-mitra/GalleryMitraTypes";

type PaginatedGallery = {
  data: GalleryMitra[];
  current_page: number;
  last_page: number;
  total: number;
};

export default function EditorGalleryMitraPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryMitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await http.get<PaginatedGallery>("/editor/gallery-mitra", {
        params: {
          page,
          per_page: 15,
          status: status || undefined,
          q: debouncedSearch || undefined,
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
      setError("Gagal memuat galeri aktivitas mitra. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, status, debouncedSearch]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header Banner */}
      <EditorGalleryMitraHeader
        total={pagination.total}
        loading={loading}
        onCreate={() => navigate("/editor/gallery-mitra/create")}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
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
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Main Table */}
      <EditorGalleryMitraTable
        items={items}
        loading={loading}
        onEdit={(id) => navigate(`/editor/gallery-mitra/${id}/edit`)}
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
