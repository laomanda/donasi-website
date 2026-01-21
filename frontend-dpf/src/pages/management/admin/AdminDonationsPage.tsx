import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faFilter,
  faMagnifyingGlass,
  faPlus,
  faReceipt,
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
  payment_source?: string | null;
  payment_method?: string | null;
  payment_channel?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  program?: { id?: number; title?: string | null } | null;
};

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

type ProgramOption = {
  id: number;
  title: string;
};

type ProgramsPayload = PaginationPayload<{
  id: number;
  title: string;
}>;

const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

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

const normalizeSourceLabel = (value: string | null | undefined) => {
  const s = String(value ?? "").trim().toLowerCase();
  if (!s) return "-";
  if (s === "midtrans") return "Midtrans";
  if (s === "manual") return "Manual";
  return value ?? "-";
};

export function AdminDonationsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<DonationStatus>("");
  const [paymentSource, setPaymentSource] = useState("");
  const [programId, setProgramId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [programLoading, setProgramLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selection = useBulkSelection<number>();
  const pageIds = useMemo(() => items.map((d) => d.id), [items]);

  const hasFilters = Boolean(
    q.trim() || status || paymentSource || programId.trim() || dateFrom.trim() || dateTo.trim()
  );

  const fetchPrograms = async () => {
    setProgramLoading(true);
    try {
      const res = await http.get<ProgramsPayload>("/admin/programs", { params: { page: 1, per_page: 100 } });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setProgramOptions(
        list
          .filter((item) => item && typeof item === "object" && typeof (item as any).id === "number")
          .map((item) => ({ id: Number((item as any).id), title: String((item as any).title ?? "") }))
      );
    } catch {
      setProgramOptions([]);
    } finally {
      setProgramLoading(false);
    }
  };

  const fetchDonations = async (
    nextPage: number,
    overrides?: Partial<{
      q: string;
      status: DonationStatus;
      paymentSource: string;
      programId: string;
      dateFrom: string;
      dateTo: string;
      perPage: number;
    }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const sourceValue = (overrides?.paymentSource ?? paymentSource).trim();
    const programIdValue = (overrides?.programId ?? programId).trim();
    const fromValue = (overrides?.dateFrom ?? dateFrom).trim();
    const toValue = (overrides?.dateTo ?? dateTo).trim();
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<PaginationPayload<Donation>>("/admin/donations", {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
          payment_source: sourceValue || undefined,
          program_id: programIdValue ? Number(programIdValue) : undefined,
          date_from: fromValue || undefined,
          date_to: toValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat data donasi.");
    } finally {
      setLoading(false);
    }
  };

  // Effect: Real-time filtering with debounce
  useEffect(() => {
    void fetchPrograms();
  }, []);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDonations(1);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, paymentSource, programId, dateFrom, dateTo, perPage]);

  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setPaymentSource("");
    setProgramId("");
    setDateFrom("");
    setDateTo("");
    // The effect will trigger the fetch
  };

  const openDonation = (id: number) => navigate(`/admin/donations/${id}`);

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

      await fetchDonations(1);
      window.dispatchEvent(new Event("refresh-badges"));
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header Section - Solid & Professional */}
      <div className="relative overflow-hidden rounded-[28px] bg-emerald-600 p-8 shadow-lg md:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
              Operasional
            </span>
            <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl text-shadow-sm">
              Donasi Masuk
            </h1>
            <p className="mt-2 max-w-2xl text-emerald-100 font-medium text-lg">
              Kelola seluruh transaksi donasi, verifikasi pembayaran, dan pantau arus dana masuk secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/donations/manual")}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-md transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-200">
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
              </span>
              Input Manual
            </button>
          </div>
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      {/* Filters Section */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-heading text-lg font-bold text-slate-800">
            <FontAwesomeIcon icon={faFilter} className="mr-2 text-emerald-500" />
            Filter & Pencarian
          </h3>
          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Pencarian</span>
              <div className="relative mt-2 group">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Kode / Donatur..."
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
                  <option value="">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="paid">Lunas</option>
                  <option value="failed">Gagal</option>
                  <option value="expired">Kedaluwarsa</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-xs" />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Sumber</span>
              <div className="relative mt-2">
                <select
                  value={paymentSource}
                  onChange={(e) => setPaymentSource(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Sumber</option>
                  <option value="midtrans">Midtrans (Otomatis)</option>
                  <option value="manual">Manual (Transfer)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-xs" />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Program</span>
              <div className="relative mt-2">
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  disabled={programLoading}
                >
                  <option value="">{programLoading ? "Memuat..." : "Semua Program"}</option>
                  {programOptions.map((p) => (
                    <option key={p.id} value={String(p.id)}>{p.title}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-xs" />
                </div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dari Tanggal</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Sampai Tanggal</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              {hasFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="flex-1 rounded-xl bg-rose-50 px-6 py-3 text-sm font-bold text-rose-600 shadow-sm ring-1 ring-inset ring-rose-100 transition hover:bg-rose-100"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500" />
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

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[6%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <input
                    type="checkbox"
                    checked={pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id))}
                    onChange={() => selection.toggleAll(pageIds)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="w-[18%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Kode</th>
                <th className="w-[20%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Donatur</th>
                <th className="w-[30%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Program</th>
                <th className="w-[14%] px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Nominal</th>
                <th className="w-[12%] px-6 py-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-1/4 rounded bg-slate-100" />
                          <div className="h-3 w-1/3 rounded bg-slate-100" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FontAwesomeIcon icon={faReceipt} className="text-2xl" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">Belum ada donasi</h3>
                    <p className="text-slate-500">Coba sesuaikan filter pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                items.map((donation) => {
                  const code = String(donation.donation_code ?? "").trim() || `#${donation.id}`;
                  const donor = String(donation.donor_name ?? "").trim() || "Anonim";
                  const programTitle = String(donation.program?.title ?? "").trim() || "Tanpa program";
                  const statusValue = String(donation.status ?? "").trim();
                  const source = normalizeSourceLabel(donation.payment_source);
                  const tone = getStatusTone(statusValue);

                  // Color bar logic
                  let barColor = "border-l-slate-200";
                  if (statusValue === "paid") barColor = "border-l-emerald-500";
                  else if (statusValue === "pending") barColor = "border-l-amber-500";
                  else if (statusValue === "failed" || statusValue === "cancelled") barColor = "border-l-rose-500";

                  return (
                    <tr
                      key={donation.id}
                      className={`group cursor-pointer transition hover:bg-slate-50 border-l-4 ${barColor}`}
                      onClick={() => openDonation(donation.id)}
                    >
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selection.isSelected(donation.id)}
                          onChange={() => selection.toggle(donation.id)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-mono text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition">{code}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center rounded bg-slate-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                            {source}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">{formatDateTime(donation.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{donor}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-medium text-slate-600">{programTitle}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(donation.amount)}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
                          {getStatusLabel(statusValue)}
                        </span>
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
            <div className="p-6 text-center text-slate-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Tidak ada data.</div>
          ) : (
            items.map(donation => {
              const statusValue = String(donation.status ?? "").trim();
              let barColor = "border-l-slate-200";
              if (statusValue === "paid") barColor = "border-l-emerald-500";
              else if (statusValue === "pending") barColor = "border-l-amber-500";
              else if (statusValue === "failed" || statusValue === "cancelled") barColor = "border-l-rose-500";

              return (
                <button
                  key={donation.id}
                  type="button"
                  onClick={() => openDonation(donation.id)}
                  className={`w-full p-5 text-left transition hover:bg-slate-50 border-l-4 ${barColor}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-bold font-mono text-slate-400">{String(donation.donation_code ?? "-")}</p>
                      <p className="font-bold text-slate-900 text-base">{formatCurrency(donation.amount)}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(statusValue)}`}>
                      {getStatusLabel(statusValue)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{String(donation.donor_name ?? "Anonim")}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-3">{String(donation.program?.title ?? "Tanpa program")}</p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider text-[10px]">{normalizeSourceLabel(donation.payment_source)}</span>
                    <span className="text-xs font-medium text-slate-500">{formatDateTime(donation.created_at)}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{pageLabel}</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchDonations(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              type="button"
              onClick={() => void fetchDonations(Math.min(lastPage, page + 1))}
              disabled={page >= lastPage || loading}
              className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDonationsPage;

