import { useEffect, useState, useMemo } from "react";
import http from "@/lib/http";
import { useToast } from "@/components/ui/ToastProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReceipt } from "@fortawesome/free-solid-svg-icons";

// Types
import type {
  CashFlowResponse,
  CashFlowSummary,
  ProgramBreakdown,
  CashFlowMutation,
} from "@/types/cashflow";

// Components
import { CashFlowHeader } from "@/components/management/keuangan/cashflow/CashFlowHeader";
import { CashFlowStats } from "@/components/management/keuangan/cashflow/CashFlowStats";
import { CashFlowProgramBreakdown } from "@/components/management/keuangan/cashflow/CashFlowProgramBreakdown";
import { CashFlowFilters } from "@/components/management/keuangan/cashflow/CashFlowFilters";
import { CashFlowTable } from "@/components/management/keuangan/cashflow/CashFlowTable";
import { CashFlowPagination } from "@/components/management/keuangan/cashflow/CashFlowPagination";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export function CashFlowReportPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [summary, setSummary] = useState<CashFlowSummary | undefined>(undefined);
  const [programs, setPrograms] = useState<ProgramBreakdown[]>([]);
  const [mutations, setMutations] = useState<CashFlowMutation[]>([]);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  // Filters
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "inflow" | "outflow">("all");

  const hasFilters = Boolean(q.trim() || dateFrom.trim() || dateTo.trim() || typeFilter !== "all");

  const fetchData = async (pageNum = page) => {
    setLoading(true);
    try {
      const res = await http.get<CashFlowResponse>("/admin/reports/cash-flow", {
        params: {
          page: pageNum,
          per_page: perPage,
          q: q.trim() || undefined,
          date_from: dateFrom.trim() || undefined,
          date_to: dateTo.trim() || undefined,
        },
      });

      setSummary(res.data.summary);
      setPrograms(res.data.program_breakdowns || []);
      setMutations(res.data.data || []);
      setPage(res.data.current_page || 1);
      setLastPage(res.data.last_page || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat laporan arus kas.", { title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData(page);
    }, 400);
    return () => clearTimeout(timer);
  }, [q, dateFrom, dateTo, page]);

  // Reset to page 1 on query/date change
  useEffect(() => {
    setPage(1);
  }, [q, dateFrom, dateTo]);

  // Client-side quick filter for mutation type (All / Inflow / Outflow)
  const displayedMutations = useMemo(() => {
    if (typeFilter === "all") return mutations;
    return mutations.filter((m) => m.type === typeFilter);
  }, [mutations, typeFilter]);

  const handleResetFilters = () => {
    setQ("");
    setDateFrom("");
    setDateTo("");
    setTypeFilter("all");
  };

  const handleExport = async (format: "pdf" | "excel") => {
    setExporting(true);
    try {
      const response = await http.get("/admin/reports/cash-flow/export", {
        params: {
          format,
          q: q.trim() || undefined,
          date_from: dateFrom.trim() || undefined,
          date_to: dateTo.trim() || undefined,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `laporan-arus-kas-dpf-${timestamp}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `Laporan berhasil diunduh dalam format ${format.toUpperCase()}.`,
        { title: "Export Berhasil" }
      );
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh laporan arus kas.", { title: "Export Gagal" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <CashFlowHeader
        exporting={exporting}
        onExport={handleExport}
        onRefresh={() => void fetchData(page)}
        loading={loading}
      />

      {/* Summary Cards */}
      <CashFlowStats
        summary={summary}
        loading={loading}
        formatCurrency={formatCurrency}
      />

      {/* Ring-Fenced Program Funds Breakdown */}
      <CashFlowProgramBreakdown
        programs={programs}
        loading={loading}
        formatCurrency={formatCurrency}
      />

      {/* Section: Jurnal & Riwayat Mutasi Kas */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Section Header Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-slate-50/70 px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs">
              <FontAwesomeIcon icon={faReceipt} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                Jurnal & Riwayat Mutasi Kas
              </h2>
              <p className="text-[11px] text-slate-400">
                Catatan kronologis seluruh arus kas masuk (donasi terverifikasi) dan arus kas keluar (penyaluran manfaat).
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-500 self-start sm:self-auto">
            Total {total} Transaksi Kas
          </span>
        </div>

        {/* Filters Toolbar */}
        <CashFlowFilters
          q={q}
          setQ={setQ}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          onReset={handleResetFilters}
          hasFilters={hasFilters}
        />

        {/* Unified Mutasi Ledger Table */}
        <div className="border-t border-slate-100 overflow-x-auto">
          <CashFlowTable
            mutations={displayedMutations}
            loading={loading}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Pagination Footer */}
        <CashFlowPagination
          page={page}
          lastPage={lastPage}
          total={total}
          loading={loading}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default CashFlowReportPage;
