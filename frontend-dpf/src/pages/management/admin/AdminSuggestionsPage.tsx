import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faFilter,
  faMagnifyingGlass,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { getAuthUser } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../lib/bulk";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";

type Suggestion = {
  id: number;
  name: string;
  phone: string;
  category: string;
  message: string;
  is_anonymous: boolean;
  status: "baru" | "dibalas";
  created_at: string;
};

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    suggestion: "Saran",
    bug: "Laporan Bug",
    appreciation: "Apresiasi",
    other: "Lainnya",
  };
  return map[cat] || cat;
};

const getCategoryTone = (cat: string) => {
  if (cat === "bug") return "bg-red-500 text-white shadow-md shadow-red-500/20";
  if (cat === "appreciation") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  if (cat === "suggestion") return "bg-amber-500 text-white shadow-md shadow-amber-500/20";
  return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
};

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

  const authUser = useMemo(() => getAuthUser(), []);
  const isViewer = useMemo(() => authUser?.roles?.some(r => r.name === 'pelihat'), [authUser]);

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

  const basePath = location.pathname.split('/').slice(0, 2).join('/');
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <FontAwesomeIcon icon={faCommentDots} />
                  Feedback
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Saran Muzakki
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Dengarkan suara donatur untuk pengembangan layanan DPF yang lebih baik.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-50 backdrop-blur-sm">
                Total Masukan
                <span className="font-bold text-white">{new Intl.NumberFormat("id-ID").format(total)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FontAwesomeIcon icon={faFilter} />
            </div>
            Filter & Pencarian
          </h3>
          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Pencarian</span>
            <div className="relative mt-2 group">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nama, no telp, atau isi pesan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Kategori</span>
            <div className="relative mt-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua kategori</option>
                <option value="suggestion">Saran</option>
                <option value="bug">Laporan Bug</option>
                <option value="appreciation">Apresiasi</option>
                <option value="other">Lainnya</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
              </div>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</span>
            <div className="relative mt-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua Status</option>
                <option value="baru">Baru</option>
                <option value="dibalas">Dibalas</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FontAwesomeIcon icon={faFilter} className="text-xs" />
              </div>
            </div>
          </label>

          <div className="flex items-end">
            <label className="block w-full">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Per Halaman</span>
              <div className="relative mt-2">
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value={10}>10 Data</option>
                  <option value={20}>20 Data</option>
                  <option value={30}>30 Data</option>
                  <option value={50}>50 Data</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-xs" />
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

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
        hideDelete={isViewer}
      />

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[5%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <input
                    type="checkbox"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="w-[20%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Donatur
                </th>
                <th className="w-[12%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Kategori
                </th>
                <th className="w-[10%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </th>
                <th className="w-[35%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Pesan
                </th>
                <th className="w-[18%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 w-4 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5"><div className="h-6 w-24 rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-16 rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-full rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada saran masuk.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="group cursor-pointer transition hover:bg-slate-50"
                    onClick={() => openDetail(item.id)}
                  >
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selection.isSelected(item.id)}
                        onChange={() => selection.toggle(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        {!!item.is_anonymous && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Anonim</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.phone}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold ${getCategoryTone(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === 'baru' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                        {item.status === 'baru' ? 'Baru' : 'Dibalas'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium leading-relaxed text-slate-700">{item.message}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-slate-600">
                      {formatDateTime(item.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="divide-y divide-slate-100 lg:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-5 animate-pulse">
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 h-6 w-24 rounded-full bg-slate-100" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada saran masuk.</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="cursor-pointer p-5 space-y-3 transition hover:bg-slate-50"
                onClick={() => openDetail(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      {item.name}
                      {!!item.is_anonymous && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Anonim</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{item.phone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${getCategoryTone(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold ${item.status === 'baru' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                      {item.status === 'baru' ? 'Baru' : 'Dibalas'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{item.message}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-400">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-slate-600">{pageLabel}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchSuggestions(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => void fetchSuggestions(Math.min(lastPage, page + 1))}
            disabled={page >= lastPage || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            Berikutnya
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSuggestionsPage;
