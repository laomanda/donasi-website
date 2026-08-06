import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faPlus,
  faSearch,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import http from "@/lib/http";
import { imagePlaceholder } from "@/lib/placeholder";
import {
  resolveMitraProductImage,
  type MitraProduct,
} from "@/components/management/editor/mitra-products/MitraProductTypes";

type Response = {
  data: MitraProduct[];
  current_page: number;
  last_page: number;
  total: number;
};

const getStatusTone = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200/60";
    case "draft":
      return "bg-amber-50 text-amber-700 ring-amber-200/60";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "published":
      return "Terbit";
    case "archived":
      return "Arsip";
    default:
      return "Draf";
  }
};

export default function EditorMitraProductsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MitraProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await http.get<Response>("/editor/mitra-products", {
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
      setError(null);
    } catch {
      setError("Gagal memuat produk mitra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status, search]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brandGreen-50 text-brandGreen-700">
              <FontAwesomeIcon icon={faStore} className="text-xs" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brandGreen-600">
              Konten Publik
            </p>
          </div>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
            Produk Mitra
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola produk publik pemberdayaan UMKM dan kontak WhatsApp mitra.
          </p>
          {!loading && (
            <p className="mt-3 text-xs font-bold text-slate-400">
              Total {pagination.total} produk
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate("/editor/mitra-products/create")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700 active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Tambah Produk</span>
        </button>
      </div>

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
            placeholder="Cari produk atau mitra..."
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

      {/* Main Table View */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {/* Desktop View */}
        <div className="hidden md:block">
          <table className="min-w-full table-fixed text-left">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="w-28 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Gambar
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Produk
                </th>
                <th className="w-48 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Mitra
                </th>
                <th className="w-32 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Status
                </th>
                <th className="w-24 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-14 w-20 rounded-xl bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-48 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-20 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="ml-auto h-8 w-10 rounded-xl bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm font-semibold text-slate-500">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FontAwesomeIcon icon={faStore} className="text-xl" />
                    </div>
                    <p className="mt-3">Belum ada produk mitra yang didaftarkan.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-5">
                        <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                          <img
                            src={resolveMitraProductImage(item.images?.[0]?.image)}
                            alt={item.title_id}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.src = imagePlaceholder;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 font-bold text-slate-900">{item.title_id}</p>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">/{item.slug}</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                        {item.nama_mitra || "-"}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${getStatusTone(
                            item.status
                          )}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => navigate(`/editor/mitra-products/${item.id}/edit`)}
                            aria-label="Ubah produk mitra"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-brandGreen-600"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
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

        {/* Mobile View */}
        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-4 p-4 animate-pulse">
                <div className="h-20 w-28 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              Belum ada produk mitra yang didaftarkan.
            </div>
          ) : (
            items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="p-4 transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex gap-3 items-start">
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                      <img
                        src={resolveMitraProductImage(item.images?.[0]?.image)}
                        alt={item.title_id}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = imagePlaceholder;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="line-clamp-1 font-bold text-slate-900">{item.title_id}</p>
                          <p className="text-xs text-slate-500">{item.nama_mitra || "-"}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase ring-1 ${getStatusTone(
                            item.status
                          )}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => navigate(`/editor/mitra-products/${item.id}/edit`)}
                          aria-label="Ubah produk mitra"
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-brandGreen-50 hover:text-brandGreen-600"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      {!loading && pagination.last_page > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 shadow-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
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
            onClick={() => setPage((value) => value + 1)}
            className="rounded-xl px-4 py-2 hover:bg-slate-50 disabled:opacity-40"
          >
            Berikutnya →
          </button>
        </div>
      )}
    </div>
  );
}
