import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faFilter,
  faHeadset,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../lib/bulk";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";

type ConsultationStatus = "baru" | "dibalas" | "ditutup" | string;

type Consultation = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  topic: string;
  message: string;
  status?: ConsultationStatus | null;
  admin_notes?: string | null;
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

const getStatusTone = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "bg-amber-500 text-white shadow-md shadow-amber-500/20";
  if (s === "dibalas") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  if (s === "ditutup") return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
  return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
};

const getStatusLabel = (status: ConsultationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "baru") return "Baru";
  if (s === "dibalas") return "Dibalas";
  if (s === "ditutup") return "Ditutup";
  return String(status || "-");
};

export function AdminConsultationsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<Consultation[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ConsultationStatus>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((item) => item.id), [items]);

  const hasFilters = Boolean(q.trim() || status);

  const fetchConsultations = async (
    nextPage: number,
    overrides?: Partial<{ q: string; status: ConsultationStatus; perPage: number }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<Consultation>>("/admin/consultations", {
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
      setError("Gagal memuat data konsultasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchConsultations(1);
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

  // Real-time filtering effect
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchConsultations(1);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const onReset = () => {
    setQ("");
    setStatus("");
    // Effect will trigger fetch
  };

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/admin/consultations/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} konsultasi.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchConsultations(1);
    } finally {
      setBulkDeleting(false);
    }
  };

  const openDetail = (id: number) => navigate(`/admin/consultations/${id}`);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
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
                  Layanan
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Konsultasi Wakaf
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Kelola pertanyaan masuk, status tindak lanjut, dan berikan respon cepat kepada jamaah.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-50 backdrop-blur-sm">
                Total Konsultasi
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Pencarian</span>
            <div className="relative mt-2 group">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nama atau topik..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</span>
            <div className="relative mt-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">Semua status</option>
                <option value="baru">Baru</option>
                <option value="dibalas">Dibalas</option>
                <option value="ditutup">Ditutup</option>
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
        itemLabel="konsultasi"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[6%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <input
                    type="checkbox"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    aria-label="Pilih semua konsultasi di halaman"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="w-[24%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Pemohon
                </th>
                <th className="w-[42%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Topik
                </th>
                <th className="w-[14%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </th>
                <th className="w-[14%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
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
                      <div className="h-4 w-56 rounded bg-slate-100" />
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
                  <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada konsultasi.
                  </td>
                </tr>
              ) : (

                items.map((item) => {
                  const statusValue = String(item.status ?? "").trim().toLowerCase();
                  let barColor = "border-l-slate-200";
                  if (statusValue === "dibalas") barColor = "border-l-emerald-500";
                  else if (statusValue === "baru") barColor = "border-l-amber-500";
                  else if (statusValue === "ditutup") barColor = "border-l-slate-500";

                  return (
                    <tr
                      key={item.id}
                      className={`cursor-pointer transition hover:bg-slate-50 border-l-4 ${barColor}`}
                      onClick={() => openDetail(item.id)}
                    >
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selection.isSelected(item.id)}
                          onChange={() => selection.toggle(item.id)}
                          aria-label={`Pilih konsultasi ${item.name}`}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {item.phone ? item.phone : item.email ? item.email : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.topic}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.message}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(String(item.status ?? ""))}`}>
                          {getStatusLabel(String(item.status ?? ""))}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                        {formatDateTime(item.created_at)}
                      </td>
                    </tr>
                  );
                })
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
            <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada konsultasi.</div>
          ) : (

            items.map((item) => {
              const statusValue = String(item.status ?? "").trim().toLowerCase();
              let barColor = "border-l-slate-200";
              if (statusValue === "dibalas") barColor = "border-l-emerald-500";
              else if (statusValue === "baru") barColor = "border-l-amber-500";
              else if (statusValue === "ditutup") barColor = "border-l-slate-500";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openDetail(item.id)}
                  className={`w-full p-5 text-left transition hover:bg-slate-50 border-l-4 ${barColor}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{item.topic}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(String(item.status ?? ""))}`}>
                      {getStatusLabel(String(item.status ?? ""))}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-500">{formatDateTime(item.created_at)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-700">
            <FontAwesomeIcon icon={faHeadset} />
          </span>
          {pageLabel}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchConsultations(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => void fetchConsultations(Math.min(lastPage, page + 1))}
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

export default AdminConsultationsPage;

