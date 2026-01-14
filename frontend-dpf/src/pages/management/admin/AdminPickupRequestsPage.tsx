import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faFilter,
  faMagnifyingGlass,
  faTruckRampBox,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../lib/bulk";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";

type PickupStatus = "baru" | "dijadwalkan" | "selesai" | "dibatalkan" | string;

type PickupRequest = {
  id: number;
  donor_name: string;
  donor_phone: string;
  address_full: string;
  city: string;
  district: string;
  wakaf_type: string;
  estimation?: string | null;
  preferred_time?: string | null;
  status?: PickupStatus | null;
  assigned_officer?: string | null;
  notes?: string | null;
  created_at?: string | null;
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

const getStatusTone = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (s === "dijadwalkan") return "bg-blue-50 text-blue-700 ring-blue-100";
  if (s === "selesai") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (s === "dibatalkan") return "bg-red-50 text-red-700 ring-red-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const getStatusLabel = (status: PickupStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "Baru";
  if (s === "dijadwalkan") return "Dijadwalkan";
  if (s === "selesai") return "Selesai";
  if (s === "dibatalkan") return "Dibatalkan";
  return String(status || "-");
};

export function AdminPickupRequestsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<PickupRequest[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PickupStatus>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((item) => item.id), [items]);
  const hasFilters = Boolean(q.trim() || status);

  const fetchRequests = async (
    nextPage: number,
    overrides?: Partial<{ q: string; status: PickupStatus; perPage: number }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<PickupRequest>>("/admin/pickup-requests", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat data jemput wakaf.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

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

  const onReset = () => {
    setQ("");
    setStatus("");
    void fetchRequests(1, { q: "", status: "" });
  };

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/admin/pickup-requests/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} permintaan.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchRequests(1);
    } finally {
      setBulkDeleting(false);
    }
  };

  const openDetail = (id: number) => navigate(`/admin/pickup-requests/${id}`);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              <span className="h-2 w-2 rounded-full bg-primary-600" />
              Layanan
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Jemput Wakaf</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Pantau permintaan jemput, jadwalkan petugas, dan tutup permintaan.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
            <FontAwesomeIcon icon={faTruckRampBox} />
            {pageLabel}
          </span>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Pencarian</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nama atau nomor WhatsApp..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Semua status</option>
                <option value="baru">Baru</option>
                <option value="dijadwalkan">Dijadwalkan</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="text-slate-400">
                <FontAwesomeIcon icon={faFilter} />
              </span>
              <span>Per halaman</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => void fetchRequests(1)}
              className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
            >
              Terapkan
            </button>

            {hasFilters ? (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Atur ulang
              </button>
            ) : null}
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
        itemLabel="jemput wakaf"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="border-b border-primary-100 bg-primary-50">
              <tr>
                <th className="w-[6%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <input
                    type="checkbox"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    aria-label="Pilih semua permintaan di halaman"
                    className="h-4 w-4"
                  />
                </th>
                <th className="w-[22%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Donatur
                </th>
                <th className="w-[28%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Lokasi
                </th>
                <th className="w-[18%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Jenis wakaf
                </th>
                <th className="w-[14%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </th>
                <th className="w-[12%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 7 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-4 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-48 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-24 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-28 rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada permintaan jemput.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="cursor-pointer transition hover:bg-slate-50" onClick={() => openDetail(item.id)}>
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selection.isSelected(item.id)}
                        onChange={() => selection.toggle(item.id)}
                        aria-label={`Pilih permintaan ${item.donor_name}`}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-900">{item.donor_name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.donor_phone}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.city}, {item.district}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.address_full}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-900">{item.wakaf_type}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.estimation ? item.estimation : "-"}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusTone(String(item.status ?? ""))}`}>
                        {getStatusLabel(String(item.status ?? ""))}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDateTime(item.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="p-5 animate-pulse">
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 h-6 w-24 rounded-full bg-slate-100" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada permintaan.</div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openDetail(item.id)}
                className="w-full p-5 text-left transition hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{item.donor_name}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">{item.city}, {item.district}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusTone(String(item.status ?? ""))}`}>
                    {getStatusLabel(String(item.status ?? ""))}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">{formatDateTime(item.created_at)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-700">
            <FontAwesomeIcon icon={faTruckRampBox} />
          </span>
          {pageLabel}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchRequests(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => void fetchRequests(Math.min(lastPage, page + 1))}
            disabled={page >= lastPage || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Berikutnya
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPickupRequestsPage;

