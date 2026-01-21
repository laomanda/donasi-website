import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faFilter,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { runWithConcurrency } from "../../../lib/bulk";
import { useBulkSelection } from "../../../components/ui/useBulkSelection";
import { BulkActionsBar } from "../../../components/ui/BulkActionsBar";

type DonationStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | string;

type Donation = {
  id: number;
  donation_code?: string | null;
  donor_name?: string | null;
  amount?: number | string | null;
  status?: DonationStatus | null;
  paid_at?: string | null;
  created_at?: string | null;
};

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value);

const formatDateTime = (value: string | null | undefined) => {
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

const getStatusTone = (status: DonationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  if (s === "pending") return "bg-amber-500 text-white shadow-md shadow-amber-500/20";
  if (s === "failed" || s === "cancelled") return "bg-rose-600 text-white shadow-md shadow-rose-600/20";
  if (s === "expired") return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
  return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
};

const getStatusLabel = (status: DonationStatus) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "paid") return "Lunas";
  if (s === "pending") return "Menunggu";
  if (s === "failed") return "Gagal";
  if (s === "expired") return "Kedaluwarsa";
  if (s === "cancelled") return "Dibatalkan";
  return String(status || "-");
};

export function AdminDonationConfirmationsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<DonationStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((d) => d.id), [items]);
  const skipAutoFetchRef = useRef(false);

  const hasFilters = Boolean(q.trim() || (status && status !== "pending"));
  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-400";
  const compactSelectClass =
    "rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none";

  const fetchConfirmations = async (
    nextPage: number,
    overrides?: Partial<{ q: string; status: DonationStatus; perPage: number }>,
    options?: { background?: boolean }
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const perPageValue = overrides?.perPage ?? perPage;

    if (!options?.background) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await http.get<PaginationPayload<Donation>>("/admin/donations", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
          payment_source: "manual",
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      if (!options?.background) {
        setError("Gagal memuat konfirmasi donasi.");
      }
    } finally {
      if (!options?.background) {
        setLoading(false);
      }
    }
  };

  // Real-time polling
  useEffect(() => {
    // Jangan polling jika user sedang mengetik search
    if (q.trim().length > 0) return;

    const interval = window.setInterval(() => {
      // Background fetch: tidak mengubah loading state
      void fetchConfirmations(page, undefined, { background: true });
    }, 3000); // 3 detik delay

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, q, status]); // Re-create interval if params change

  useEffect(() => {
    if (skipAutoFetchRef.current) {
      skipAutoFetchRef.current = false;
      return;
    }
    const delay = q.trim().length ? 350 : 0;
    const timer = window.setTimeout(() => {
      void fetchConfirmations(1, { q, status, perPage });
    }, delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, perPage]);

  useEffect(() => {
    selection.keepOnly(pageIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIds.join(",")]);

  const onResetFilters = () => {
    skipAutoFetchRef.current = true;
    setQ("");
    setStatus("pending");
    void fetchConfirmations(1, { q: "", status: "pending" });
  };

  const onDeleteSelected = async () => {
    if (selection.count === 0) return;
    setBulkDeleting(true);
    try {
      const result = await runWithConcurrency(selection.selectedIds, 4, async (id) => {
        await http.delete(`/admin/donations/${id}`);
      });

      if (result.failed.length) {
        toast.error(`Berhasil menghapus ${result.succeeded.length}, gagal ${result.failed.length}.`, { title: "Sebagian gagal" });
        selection.setSelected(new Set(result.failed.map((f) => f.id)));
      } else {
        toast.success(`Berhasil menghapus ${result.succeeded.length} donasi.`, { title: "Berhasil" });
        selection.clear();
      }

      await fetchConfirmations(1);
      window.dispatchEvent(new Event("refresh-badges"));
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-700 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-7 sm:p-9 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-50 ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Donasi manual
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl">Konfirmasi Donasi</h1>
                <p className="mt-2 max-w-2xl text-sm font-medium text-emerald-100/90">
                  Daftar transfer manual yang perlu diverifikasi agar dana tercatat dengan benar.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-50 backdrop-blur-sm">
                Total data
                <span className="font-bold text-white">{formatCount(total)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <FontAwesomeIcon icon={faFilter} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Filter</p>
                <h2 className="text-lg font-bold text-slate-900">Cari Konfirmasi</h2>
                <p className="text-sm font-medium text-slate-500">Saring donasi manual yang perlu diverifikasi.</p>
              </div>
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
                  className={compactSelectClass}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </label>
              {hasFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  Atur ulang
                </button>
              )}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Pencarian</span>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Kode donasi atau nama donatur..."
                  className={`${inputClass} pl-11`}
                />
              </div>
            </label>

            <label className="block">
              <span className={labelClass}>Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="">Semua status</option>
                <option value="pending">Menunggu</option>
                <option value="paid">Lunas</option>
                <option value="failed">Gagal</option>
                <option value="expired">Kedaluwarsa</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
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
        itemLabel="donasi"
        onClear={selection.clear}
        onSelectAllPage={() => selection.toggleAll(pageIds)}
        onDeleteSelected={onDeleteSelected}
        disabled={loading || bulkDeleting}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[6%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <input
                    type="checkbox"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    aria-label="Pilih semua donasi di halaman"
                    className="h-4 w-4 accent-emerald-600"
                  />
                </th>
                <th className="w-[26%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Kode
                </th>
                <th className="w-[28%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Donatur
                </th>
                <th className="w-[16%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Nominal
                </th>
                <th className="w-[14%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </th>
                <th className="w-[10%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-4 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-44 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="ml-auto h-4 w-28 rounded bg-slate-100" />
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
                    Belum ada konfirmasi donasi.
                  </td>
                </tr>
              ) : (
                items.map((donation) => {
                  const code = String(donation.donation_code ?? "").trim() || `#${donation.id}`;
                  const donor = String(donation.donor_name ?? "").trim() || "Anonim";
                  const when = donation.paid_at ?? donation.created_at;

                  const s = String(donation.status ?? "").toLowerCase();
                  let barColor = "border-l-slate-200";
                  if (s === "paid") barColor = "border-l-emerald-500";
                  else if (s === "pending") barColor = "border-l-amber-500";
                  else if (s === "failed" || s === "cancelled") barColor = "border-l-rose-500";
                  else if (s === "expired") barColor = "border-l-slate-600";

                  return (
                    <tr
                      key={donation.id}
                      className={`cursor-pointer transition hover:bg-emerald-50/40 border-l-4 ${barColor}`}
                      onClick={() => navigate(`/admin/donations/${donation.id}`)}
                    >
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selection.isSelected(donation.id)}
                          onChange={() => selection.toggle(donation.id)}
                          aria-label={`Pilih donasi ${code}`}
                          className="h-4 w-4 accent-emerald-600"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{code}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Manual transfer</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-900">{donor}</p>
                      </td>
                      <td className="px-6 py-5 text-right text-sm font-bold text-slate-900">
                        {formatCurrency(donation.amount)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                            getStatusTone(String(donation.status ?? "")),
                          ].join(" ")}
                        >
                          {getStatusLabel(String(donation.status ?? ""))}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">{formatDateTime(when)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 h-6 w-28 rounded-full bg-slate-100" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada konfirmasi.</div>
          ) : (
            items.map((donation) => {
              const code = String(donation.donation_code ?? "").trim() || `#${donation.id}`;
              const donor = String(donation.donor_name ?? "").trim() || "Anonim";
              const when = donation.paid_at ?? donation.created_at;

              const s = String(donation.status ?? "").toLowerCase();
              let barColor = "border-l-slate-200";
              if (s === "paid") barColor = "border-l-emerald-500";
              else if (s === "pending") barColor = "border-l-amber-500";
              else if (s === "failed" || s === "cancelled") barColor = "border-l-rose-500";
              else if (s === "expired") barColor = "border-l-slate-600";

              return (
                <button
                  key={donation.id}
                  type="button"
                  onClick={() => navigate(`/admin/donations/${donation.id}`)}
                  className={`w-full p-5 text-left transition hover:border-emerald-200 hover:bg-emerald-50 border-l-4 ${barColor}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{code}</p>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{donor}</p>
                    </div>
                    <span
                      className={[
                        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold",
                        getStatusTone(String(donation.status ?? "")),
                      ].join(" ")}
                    >
                      {getStatusLabel(String(donation.status ?? ""))}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-500">Nominal</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(donation.amount)}</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-500">Waktu: {formatDateTime(when)}</div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchConfirmations(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => void fetchConfirmations(Math.min(lastPage, page + 1))}
            disabled={page >= lastPage || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Berikutnya
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDonationConfirmationsPage;



