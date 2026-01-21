import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faMagnifyingGlass,
  faReceipt,
  faFileArrowDown,
  faCoins,
  faHandHoldingDollar,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

type DonationStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | string;

type Donation = {
  id: number;
  donation_code?: string | null;
  donor_name?: string | null;
  donor_email?: string | null;
  donor_phone?: string | null;
  amount?: number | string | null;
  status?: DonationStatus | null;
  payment_source?: string | null;
  payment_method?: string | null;
  payment_channel?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  program?: { id?: number; title?: string | null } | null;
};

type ReportSummary = {
  total_count?: number;
  total_amount?: number;
  manual_count?: number;
  manual_amount?: number;
  midtrans_count?: number;
  midtrans_amount?: number;
};

type ReportPayload = {
  data: Donation[];
  current_page?: number;
  per_page?: number;
  last_page?: number;
  total?: number;
  summary?: ReportSummary;
};

type DonationReportPageProps = {
  role?: "admin" | "superadmin";
};

const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

const formatCount = (value: number | undefined) =>
  new Intl.NumberFormat("id-ID").format(Number.isFinite(Number(value)) ? Number(value) : 0);

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
  if (s === "paid") return "bg-emerald-600 text-white ring-emerald-700/60";
  if (s === "pending") return "bg-amber-500 text-slate-900 ring-amber-600/60";
  if (s === "failed" || s === "cancelled") return "bg-rose-600 text-white ring-rose-700/60";
  if (s === "expired") return "bg-slate-400 text-slate-900 ring-slate-500/60";
  return "bg-slate-300 text-slate-900 ring-slate-400/60";
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

export function DonationReportPage({ role: propRole }: DonationReportPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const role = propRole || (location.pathname.startsWith("/superadmin") ? "superadmin" : "admin");
  const apiBase = role === "superadmin" ? "/superadmin" : "/admin";

  const [items, setItems] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<DonationStatus>("");
  const [paymentSource, setPaymentSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = Boolean(q.trim() || status || paymentSource || dateFrom.trim() || dateTo.trim());

  const fetchReports = async (
    nextPage: number,
    overrides?: Partial<{
      q: string;
      status: DonationStatus;
      paymentSource: string;
      dateFrom: string;
      dateTo: string;
      perPage: number;
    }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const sourceValue = (overrides?.paymentSource ?? paymentSource).trim();
    const fromValue = (overrides?.dateFrom ?? dateFrom).trim();
    const toValue = (overrides?.dateTo ?? dateTo).trim();
    const perPageValue = overrides?.perPage ?? perPage;

    setLoading(true);
    setError(null);
    try {
      const res = await http.get<ReportPayload>(`${apiBase}/reports/donations`, {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
          payment_source: sourceValue || undefined,
          date_from: fromValue || undefined,
          date_to: toValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setSummary(res.data.summary ?? null);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch {
      setError("Gagal memuat laporan donasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      void fetchReports(1);
    }, 400);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, paymentSource, dateFrom, dateTo, perPage]);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setPaymentSource("");
    setDateFrom("");
    setDateTo("");
  };

  const downloadFile = (data: Blob, filename: string) => {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportReport = async (format: "pdf" | "xlsx") => {
    setExporting(true);
    try {
      const res = await http.get(`${apiBase}/reports/donations/export`, {
        params: {
          q: q.trim() || undefined,
          status: status || undefined,
          payment_source: paymentSource.trim() || undefined,
          date_from: dateFrom.trim() || undefined,
          date_to: dateTo.trim() || undefined,
          format,
        },
        responseType: "blob",
      });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const filename = `laporan-donasi-${timestamp}.${format}`;
      downloadFile(res.data, filename);
    } catch {
      toast.error("Gagal mengekspor laporan.", { title: "Export gagal" });
    } finally {
      setExporting(false);
    }
  };

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
                  Laporan
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Laporan Donasi
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Ringkasan dan daftar donasi berdasarkan rentang waktu serta sumber pembayaran.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void exportReport("pdf")}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                <FontAwesomeIcon icon={faFileArrowDown} />
                Export PDF
              </button>
              <button
                type="button"
                onClick={() => void exportReport("xlsx")}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <FontAwesomeIcon icon={faFileArrowDown} />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Donasi Card */}
        <div className="relative overflow-hidden rounded-[28px] border border-emerald-600 bg-emerald-600 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex flex-col h-full justify-between z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-md">
                <FontAwesomeIcon icon={faReceipt} className="text-xl" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">Total Transaksi</span>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold text-white tracking-tight">
                {loading ? "-" : formatCount(summary?.total_count)}
              </p>
              <p className="text-xs font-bold text-emerald-100 mt-1">Semua donasi berhasil</p>
            </div>
          </div>
        </div>

        {/* Total Nominal Card */}
        <div className="relative overflow-hidden rounded-[28px] border border-brandBlueTeal-500 bg-brandBlueTeal-500 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex flex-col h-full justify-between z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-md">
                <FontAwesomeIcon icon={faCoins} className="text-xl" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-brandBlueTeal-100">Total Nominal</span>
            </div>
            <div>
              <p className="text-3xl font-heading font-bold text-white tracking-tight">
                {loading ? "-" : formatCurrency(summary?.total_amount ?? 0)}
              </p>
              <p className="text-xs font-bold text-brandBlueTeal-100 mt-1">Akumulasi dana terkumpul</p>
            </div>
          </div>
        </div>

        {/* Manual Card */}
        <div className="relative overflow-hidden rounded-[28px] border border-brandWarmOrange-500 bg-brandWarmOrange-500 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex flex-col h-full justify-between z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-md">
                <FontAwesomeIcon icon={faHandHoldingDollar} className="text-xl" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-brandWarmOrange-100">Manual (Transfer)</span>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-white tracking-tight">
                {loading ? "-" : formatCurrency(summary?.manual_amount ?? 0)}
              </p>
              <p className="text-xs font-bold text-brandWarmOrange-100 mt-1">
                {loading ? "-" : `${formatCount(summary?.manual_count)} transaksi`}
              </p>
            </div>
          </div>
        </div>

        {/* Midtrans Card */}
        <div className="relative overflow-hidden rounded-[28px] border border-brandPurple-500 bg-brandPurple-500 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex flex-col h-full justify-between z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-md">
                <FontAwesomeIcon icon={faCreditCard} className="text-xl" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-brandPurple-100">Midtrans (Auto)</span>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-white tracking-tight">
                {loading ? "-" : formatCurrency(summary?.midtrans_amount ?? 0)}
              </p>
              <p className="text-xs font-bold text-brandPurple-100 mt-1">
                {loading ? "-" : `${formatCount(summary?.midtrans_count)} transaksi`}
              </p>
            </div>
          </div>
        </div>
      </section>

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
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Cari</span>
              <div className="relative mt-2 group">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Kode / Nama..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Status</span>
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
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Sumber</span>
              <div className="relative mt-2">
                <select
                  value={paymentSource}
                  onChange={(e) => setPaymentSource(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Sumber</option>
                  <option value="midtrans">Midtrans</option>
                  <option value="manual">Manual</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-xs" />
                </div>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Dari Tgl</span>
                <div className="relative mt-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Sampai</span>
                <div className="relative mt-2">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-50 pt-6 mt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Tampilkan</span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 appearance-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Data</span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              {/* Removed Apply Button for real-time filtering */}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[16%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Kode
                </th>
                <th className="w-[20%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Donatur
                </th>
                <th className="w-[24%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Program
                </th>
                <th className="w-[10%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Sumber
                </th>
                <th className="w-[10%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </th>
                <th className="w-[10%] px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Nominal
                </th>
                <th className="w-[10%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-48 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-16 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-20 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="ml-auto h-4 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada donasi yang cocok.
                  </td>
                </tr>
              ) : (
                items.map((donation) => {
                  const code = String(donation.donation_code ?? "").trim() || `#${donation.id}`;
                  const donor = String(donation.donor_name ?? "").trim() || "Anonim";
                  const programTitle = String(donation.program?.title ?? "").trim() || "Tanpa program";
                  const statusValue = String(donation.status ?? "").trim().toLowerCase();
                  const source = normalizeSourceLabel(donation.payment_source);
                  const when = donation.paid_at ?? donation.created_at;

                  let barColor = "border-l-slate-200";
                  if (statusValue === "paid") barColor = "border-l-emerald-500";
                  else if (statusValue === "pending") barColor = "border-l-amber-500";
                  else if (statusValue === "failed") barColor = "border-l-rose-500";
                  else if (statusValue === "expired") barColor = "border-l-slate-400";

                  // Determine detail link based on role
                  const detailLink = role === 'superadmin'
                    ? `/superadmin/donations/${donation.id}`
                    : `/admin/donations/${donation.id}`;

                  return (
                    <tr
                      key={donation.id}
                      className={`cursor-pointer transition hover:bg-slate-50 border-l-4 ${barColor}`}
                      onClick={() => navigate(detailLink)}
                    >
                      <td className="px-6 py-5">
                        <p className="font-mono text-xs font-bold text-slate-500">{code}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{donor}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {donation.payment_method ? String(donation.payment_method) : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">{programTitle}</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600">{source}</td>
                      <td className="px-6 py-5">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                            getStatusTone(statusValue),
                          ].join(" ")}
                        >
                          {getStatusLabel(statusValue)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-sm font-bold text-slate-900 tracking-tight">
                        {formatCurrency(donation.amount)}
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-500">{formatDateTime(when)}</td>
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
            <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada donasi yang cocok.</div>
          ) : (
            items.map((donation) => {
              const code = String(donation.donation_code ?? "").trim() || `#${donation.id}`;
              const donor = String(donation.donor_name ?? "").trim() || "Anonim";
              const programTitle = String(donation.program?.title ?? "").trim() || "Tanpa program";
              const statusValue = String(donation.status ?? "").trim().toLowerCase();
              const when = donation.paid_at ?? donation.created_at;

              let barColor = "border-l-slate-200";
              if (statusValue === "paid") barColor = "border-l-emerald-500";
              else if (statusValue === "pending") barColor = "border-l-amber-500";
              else if (statusValue === "failed") barColor = "border-l-rose-500";
              else if (statusValue === "expired") barColor = "border-l-slate-400";

              const detailLink = role === 'superadmin'
                ? `/superadmin/donations/${donation.id}`
                : `/admin/donations/${donation.id}`;

              return (
                <div
                  key={donation.id}
                  className={`w-full p-5 text-left transition hover:bg-slate-50 border-l-4 ${barColor}`}
                  onClick={() => navigate(detailLink)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-slate-500">{code}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{donor}</p>
                    </div>
                    <span
                      className={[
                        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold",
                        getStatusTone(statusValue),
                      ].join(" ")}
                    >
                      {getStatusLabel(statusValue)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="line-clamp-1 text-xs font-semibold text-slate-600">{programTitle}</p>
                    <div className="flex items-center justify-between gap-3 border-t border-slate-50 pt-3">
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(donation.amount)}</span>
                      <span className="text-xs font-semibold text-slate-400">{formatDateTime(when)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-700">
            <FontAwesomeIcon icon={faReceipt} />
          </span>
          {pageLabel}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchReports(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => void fetchReports(Math.min(lastPage, page + 1))}
            disabled={page >= lastPage || loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}

export default DonationReportPage;
