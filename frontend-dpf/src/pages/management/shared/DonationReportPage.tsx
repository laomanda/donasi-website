import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faFilter,
  faMagnifyingGlass,
  faReceipt,
  faFileArrowDown,
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
  role: "admin" | "superadmin";
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
  if (s === "paid") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (s === "pending") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (s === "failed" || s === "cancelled") return "bg-red-50 text-red-700 ring-red-100";
  if (s === "expired") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
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

export function DonationReportPage({ role }: DonationReportPageProps) {
  const toast = useToast();
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
    void fetchReports(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const onApplyFilters = () => void fetchReports(1);
  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setPaymentSource("");
    setDateFrom("");
    setDateTo("");
    void fetchReports(1, { q: "", status: "", paymentSource: "", dateFrom: "", dateTo: "" });
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


  const badgeClass =
    role === "superadmin"
      ? "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100"
      : "bg-primary-50 text-primary-700 ring-primary-100";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1 ${badgeClass}`}>
              <span className="h-2 w-2 rounded-full bg-brandGreen-600" />
              Laporan
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
              Laporan Donasi
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Ringkasan dan daftar donasi berdasarkan rentang waktu serta sumber pembayaran.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void exportReport("pdf")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <FontAwesomeIcon icon={faFileArrowDown} />
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => void exportReport("xlsx")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-brandGreen-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <FontAwesomeIcon icon={faFileArrowDown} />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <FontAwesomeIcon icon={faReceipt} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total Donasi</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {loading ? "-" : formatCount(summary?.total_count)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total Nominal</p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {loading ? "-" : formatCurrency(summary?.total_amount ?? 0)}
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Manual</p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {loading ? "-" : formatCurrency(summary?.manual_amount ?? 0)}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {loading ? "-" : `${formatCount(summary?.manual_count)} transaksi`}
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Midtrans</p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {loading ? "-" : formatCurrency(summary?.midtrans_amount ?? 0)}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {loading ? "-" : `${formatCount(summary?.midtrans_count)} transaksi`}
          </p>
        </div>
      </section>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Cari</span>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Kode donasi atau nama donatur..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Semua status</option>
                <option value="pending">Menunggu</option>
                <option value="paid">Lunas</option>
                <option value="failed">Gagal</option>
                <option value="expired">Kedaluwarsa</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Sumber pembayaran</span>
              <select
                value={paymentSource}
                onChange={(e) => setPaymentSource(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Semua</option>
                <option value="midtrans">Midtrans</option>
                <option value="manual">Manual</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Tanggal (dari)</span>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400">Tanggal (sampai)</span>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
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
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </label>

            <button
              type="button"
              onClick={onApplyFilters}
              className="inline-flex items-center justify-center rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
            >
              Terapkan
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Atur ulang
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-600">{pageLabel}</p>
          <p className="text-xs font-semibold text-slate-500">Gunakan tombol ekspor untuk mengunduh file.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="border-b border-primary-100 bg-primary-50">
              <tr>
                <th className="w-[16%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Kode
                </th>
                <th className="w-[20%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Donatur
                </th>
                <th className="w-[24%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Program
                </th>
                <th className="w-[10%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Sumber
                </th>
                <th className="w-[10%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </th>
                <th className="w-[10%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Nominal
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
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-40 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-52 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-24 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="ml-auto h-4 w-28 rounded bg-slate-100" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-28 rounded bg-slate-100" />
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
                  const statusValue = String(donation.status ?? "").trim();
                  const source = normalizeSourceLabel(donation.payment_source);
                  const when = donation.paid_at ?? donation.created_at;
                  return (
                    <tr key={donation.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{code}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{source}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-900">{donor}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {donation.payment_method ? String(donation.payment_method) : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">{programTitle}</p>
                        {donation.program?.id ? (
                          <p className="mt-1 text-xs font-semibold text-slate-500">ID program: {donation.program.id}</p>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-slate-500">Tanpa program</p>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-700">{source}</td>
                      <td className="px-6 py-5">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                            getStatusTone(statusValue),
                          ].join(" ")}
                        >
                          {getStatusLabel(statusValue)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right text-sm font-bold text-slate-900">
                        {formatCurrency(donation.amount)}
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
            <div className="p-6 text-center text-sm font-semibold text-slate-500">Belum ada donasi yang cocok.</div>
          ) : (
            items.map((donation) => {
              const code = String(donation.donation_code ?? "").trim() || `#${donation.id}`;
              const donor = String(donation.donor_name ?? "").trim() || "Anonim";
              const programTitle = String(donation.program?.title ?? "").trim() || "Tanpa program";
              const statusValue = String(donation.status ?? "").trim();
              const when = donation.paid_at ?? donation.created_at;
              return (
                <div key={donation.id} className="w-full p-5 text-left transition hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{code}</p>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{donor}</p>
                    </div>
                    <span
                      className={[
                        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                        getStatusTone(statusValue),
                      ].join(" ")}
                    >
                      {getStatusLabel(statusValue)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Program</span>
                      <span className="line-clamp-1 text-sm font-semibold text-slate-900">{programTitle}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Nominal</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(donation.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">Waktu</span>
                      <span className="text-sm font-semibold text-slate-700">{formatDateTime(when)}</span>
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
