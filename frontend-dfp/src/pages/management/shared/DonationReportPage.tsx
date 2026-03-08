import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";

// Modular Components & Utils
import * as Utils from "../../../components/management/donation-report/DonationReportUtils";
import { DonationReportHeader } from "../../../components/management/donation-report/DonationReportHeader";
import { DonationReportStats } from "../../../components/management/donation-report/DonationReportStats";
import { DonationReportFilters } from "../../../components/management/donation-report/DonationReportFilters";
import { DonationReportTable } from "../../../components/management/donation-report/DonationReportTable";
import { DonationReportMobileList } from "../../../components/management/donation-report/DonationReportMobileList";
import { DonationReportPagination } from "../../../components/management/donation-report/DonationReportPagination";

type ReportSummary = {
  total_count?: number;
  total_amount?: number;
  manual_count?: number;
  manual_amount?: number;
  midtrans_count?: number;
  midtrans_amount?: number;
  top_donor?: {
    donor_name: string;
    total_amount: number;
    donation_count: number;
  } | null;
  top_program?: {
    program_title: string;
    total_amount: number;
    donation_count: number;
  } | null;
};

type ReportPayload = {
  data: Utils.Donation[];
  current_page?: number;
  per_page?: number;
  last_page?: number;
  total?: number;
  summary?: ReportSummary;
};

type DonationReportPageProps = {
  role?: "admin" | "superadmin";
};

export function DonationReportPage({ role: propRole }: DonationReportPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const role = propRole || (location.pathname.startsWith("/superadmin") ? "superadmin" : "admin");
  const apiBase = role === "superadmin" ? "/superadmin" : "/admin";

  const [items, setItems] = useState<Utils.Donation[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Utils.DonationStatus>("");
  const [paymentSource, setPaymentSource] = useState("");
  const [qualification, setQualification] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFilters = Boolean(q.trim() || status || paymentSource || qualification || dateFrom.trim() || dateTo.trim());

  const fetchReports = async (
    nextPage: number,
    overrides?: Partial<{
      q: string;
      status: Utils.DonationStatus;
      paymentSource: string;
      qualification: string;
      dateFrom: string;
      dateTo: string;
      perPage: number;
    }>
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const sourceValue = (overrides?.paymentSource ?? paymentSource).trim();
    const qualificationValue = (overrides?.qualification ?? qualification).trim();
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
          qualification: qualificationValue || undefined,
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
  }, [q, status, paymentSource, qualification, dateFrom, dateTo, perPage]);

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
    setQualification("");
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
          qualification: qualification.trim() || undefined,
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

  const onDetail = (id: number) => {
    const basePath = location.pathname.split("/").slice(0, 2).join("/");
    navigate(`${basePath}/donations/${id}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">
      <DonationReportHeader exporting={exporting} onExport={exportReport} />

      <DonationReportStats
        summary={summary}
        loading={loading}
        formatCurrency={Utils.formatCurrency}
        formatCount={Utils.formatCount}
      />

      <DonationReportFilters
        q={q}
        setQ={setQ}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        status={status}
        setStatus={setStatus}
        qualification={qualification}
        setQualification={setQualification}
        paymentSource={paymentSource}
        setPaymentSource={setPaymentSource}
        perPage={perPage}
        setPerPage={setPerPage}
        onResetFilters={onResetFilters}
        hasFilters={hasFilters}
      />

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-100">
        <DonationReportTable items={items} loading={loading} onDetail={onDetail} />
        <DonationReportMobileList items={items} loading={loading} onDetail={onDetail} />
      </div>

      <DonationReportPagination
        page={page}
        lastPage={lastPage}
        loading={loading}
        pageLabel={pageLabel}
        onPageChange={(newPage) => void fetchReports(newPage)}
      />
    </div>
  );
}

export default DonationReportPage;
