import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faTruckRampBox,
} from "@fortawesome/free-solid-svg-icons";
import type { PaginationPayload, PickupRequest, PickupStatus } from "@/types/pickup";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { runWithConcurrency } from "@/lib/bulk";
import { useBulkSelection } from "@/components/ui/useBulkSelection";
import { BulkActionsBar } from "@/components/ui/BulkActionsBar";
import AdminPickupFilters from "@/components/management/admin/pickups/AdminPickupFilters";
import AdminPickupList from "@/components/management/admin/pickups/AdminPickupList";

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
  if (s === "baru") return "bg-amber-500 text-white shadow-md shadow-amber-500/20";
  if (s === "dijadwalkan") return "bg-blue-600 text-white shadow-md shadow-blue-600/20";
  if (s === "selesai") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  if (s === "dibatalkan") return "bg-rose-600 text-white shadow-md shadow-rose-600/20";
  return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
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
  const location = useLocation();
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

  // Real-time filtering effect
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchRequests(1);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

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
      window.dispatchEvent(new Event("refresh-badges"));
    } finally {
      setBulkDeleting(false);
    }
  };

  const basePath = location.pathname.split('/').slice(0, 2).join('/');
  const openDetail = (id: number) => navigate(`${basePath}/pickup-requests/${id}`);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  Operasional
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Jemput Wakaf
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Kelola dan pantau permintaan penjemputan wakaf dari donatur dengan efisien dan tepat waktu.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-50 backdrop-blur-sm">
                Total Permintaan
                <span className="font-bold text-white">{new Intl.NumberFormat("id-ID").format(total)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <AdminPickupFilters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        perPage={perPage}
        setPerPage={setPerPage}
        total={total}
        loading={loading}
        onReset={onReset}
      />

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

      <AdminPickupList
        items={items}
        loading={loading}
        selection={selection}
        pageIds={pageIds}
        getStatusTone={getStatusTone}
        getStatusLabel={getStatusLabel}
        formatDateTime={formatDateTime}
        onOpenDetail={openDetail}
      />

      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-700">
            <FontAwesomeIcon icon={faTruckRampBox} />
          </span>
          {pageLabel}
        </div>
        <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
          <button
            type="button"
            onClick={() => void fetchRequests(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:w-auto"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => void fetchRequests(Math.min(lastPage, page + 1))}
            disabled={page >= lastPage || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:w-auto"
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

