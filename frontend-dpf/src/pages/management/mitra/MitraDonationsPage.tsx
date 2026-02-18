import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faReceipt, 
  faFileInvoiceDollar, 
  faChevronLeft, 
  faChevronRight,
  faFilter,
  faMagnifyingGlass,
  faSpinner,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useLang } from "../../../lib/i18n";
import { mitraDict, translate } from "../../../i18n/mitra";

type Donation = {
  id: number;
  donation_code: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  program?: { title: string };
};

export function MitraDonationsPage() {
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        q: search,
        date_from: dateFrom,
        date_to: dateTo,
        per_page: "10"
      });

      const res = await http.get(`/mitra/donations?${params.toString()}`);
      const responseData = res.data.data;
      
      setDonations(responseData.data);
      setTotalPages(responseData.last_page);
      setTotalItems(responseData.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetFilters = () => {
      setSearch("");
      setDateFrom("");
      setDateTo("");
      setCurrentPage(1);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleDownloadInvoice = async (donationId: number, code: string) => {
    try {
      const res = await http.get(`/mitra/donations/${donationId}/export`, {
        params: { lang: locale },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleExportPdf = async () => {
    setLoadingPdf(true);
    try {
      const params = new URLSearchParams({
        q: search,
        date_from: dateFrom,
        date_to: dateTo,
        lang: locale
      });
      const res = await http.get(`/mitra/donations/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-donasi-${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export PDF failed:", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Solid & Clean */}
      <div className="relative overflow-hidden rounded-[28px] bg-emerald-600 p-8 md:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              {t("mitra.recent_donations")}
            </h1>
            <p className="mt-2 max-w-2xl text-emerald-50 font-medium text-lg">
              {t("mitra.donations_subtitle")}
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={loadingPdf}
            className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70 md:mt-0"
          >
            {loadingPdf ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faFilePdf} />
            )}
            <span>{t("mitra.download_report")}</span>
          </button>
        </div>
      </div>

       {/* Filters Section */}
       <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-heading text-lg font-bold text-slate-800">
            <FontAwesomeIcon icon={faFilter} className="mr-2 text-emerald-500" />
            {t("mitra.filter_search")}
          </h3>
          {(search.trim() || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              {t("mitra.reset_filter")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("nav.search", "Pencarian")}</span>
                    <div className="relative mt-2 group">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </span>
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder={t("mitra.search_program_placeholder")}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("mitra.date_from")}</span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("mitra.date_to_label")}</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                </label>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("mitra.donation_code")}</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("mitra.program")}</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("common.status")}</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("common.amount")}</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("mitra.invoice")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-6" colSpan={5}>
                        <div className="h-4 w-full rounded bg-slate-50" />
                      </td>
                    </tr>
                ))
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                      <FontAwesomeIcon icon={faReceipt} className="text-2xl" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900">{t("mitra.no_donation_history")}</h3>
                  </td>
                </tr>
              ) : (
                donations.map((don) => (
                  <tr key={don.id} className="text-sm transition-colors hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 tabular-nums">{don.donation_code}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          {new Date(don.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 mb-1">{don.program?.title ?? t("mitra.general_donation")}</p>
                    </td>
                    <td className="px-6 py-5">
                        <StatusBadge status={don.status} t={t} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="inline-block px-2.5 py-1 font-bold text-white rounded-lg bg-brandGreen-600 tabular-nums text-[11px] lg:text-xs whitespace-nowrap shadow-sm">
                        {formatIDR(don.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {don.status === 'paid' ? (
                         <button 
                            onClick={() => handleDownloadInvoice(don.id, don.donation_code)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition shadow-sm"
                         >
                            <FontAwesomeIcon icon={faFileInvoiceDollar} />
                         </button>
                      ) : (
                         <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls */}
        {!loading && donations.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="text-sm font-bold text-slate-500">
               {t("mitra.showing_info")
                 .replace("{count}", donations.length.toString())
                 .replace("{total}", totalItems.toString())}
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faChevronLeft} size="sm" />
              </button>
              <div className="flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white">
                {currentPage} / {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faChevronRight} size="sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, t }: { status: string, t: any }) {
  const styles: Record<string, string> = {
    paid: "text-emerald-600",
    pending: "text-amber-600",
    failed: "text-rose-600",
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${styles[status] || "text-slate-400"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'paid' ? 'bg-emerald-600' : status === 'pending' ? 'bg-amber-600' : 'bg-rose-600'}`} />
      {t(`status.${status}`, status)}
    </span>
  );
}
