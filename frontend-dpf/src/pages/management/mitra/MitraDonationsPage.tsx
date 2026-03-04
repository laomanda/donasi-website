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
  program?: { 
    title: string;
    title_en: string | null;
  };
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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header Section - Modern Gradient & Professional Typography */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-600 to-teal-700 p-8 shadow-xl shadow-emerald-100 md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/5 blur-2xl" />
        
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="font-heading text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("mitra.recent_donations")}
            </h1>
            <p className="mt-4 text-lg font-medium text-emerald-50/90 leading-relaxed">
              {t("mitra.donations_subtitle")}
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={loadingPdf}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-white/10 px-8 py-4 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur-md transition-all hover:bg-white/20 hover:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingPdf ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faFilePdf} className="transition-transform group-hover:scale-110" />
            )}
            <span>{t("mitra.download_report")}</span>
          </button>
        </div>
      </div>

       {/* Filters Section - Elegant & Functional */}
       <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FontAwesomeIcon icon={faFilter} />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900">
              {t("mitra.filter_search")}
            </h3>
          </div>
          {(search.trim() || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 transition-colors hover:text-rose-700 hover:underline"
            >
              {t("mitra.reset_filter")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t("nav.search", "Pencarian")}</label>
            <div className="relative group">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                }}
                placeholder={t("mitra.search_program_placeholder")}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t("mitra.date_from")}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t("mitra.date_to_label")}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">{t("mitra.donation_code")}</th>
                <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">{t("mitra.program")}</th>
                <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">{t("common.status")}</th>
                <th className="px-8 py-6 text-right text-[11px] font-bold uppercase tracking-[0.2em]">{t("common.amount")}</th>
                <th className="px-8 py-6 text-center text-[11px] font-bold uppercase tracking-[0.2em]">{t("mitra.invoice")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-8" colSpan={5}>
                        <div className="h-5 w-full rounded-lg bg-slate-50" />
                      </td>
                    </tr>
                ))
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                      <FontAwesomeIcon icon={faReceipt} className="text-3xl" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-slate-900">{t("mitra.no_donation_history")}</h3>
                    <p className="mt-2 text-slate-500">Coba ubah kata kunci atau periode filter Anda.</p>
                  </td>
                </tr>
              ) : (
                donations.map((don) => (
                  <tr key={don.id} className="group transition-all hover:bg-slate-50/80">
                    <td className="px-8 py-7 whitespace-nowrap">
                      <p className="font-bold text-slate-900 tabular-nums uppercase">{don.donation_code}</p>
                      <p className="mt-1 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(don.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-8 py-7">
                      <p className="font-bold text-slate-900 leading-relaxed">
                        {locale === "en" && don.program?.title_en 
                          ? don.program.title_en 
                          : (don.program?.title ?? t("mitra.general_donation"))}
                      </p>
                    </td>
                    <td className="px-8 py-7">
                        <StatusBadge status={don.status} t={t} />
                    </td>
                    <td className="px-8 py-7 text-right">
                      <span className="inline-block px-5 py-2 font-heading text-sm font-black text-white rounded-2xl bg-brandGreen-600 tabular-nums shadow-sm ring-1 ring-brandGreen-600">
                        {formatIDR(don.amount)}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-center">
                      {don.status === 'paid' ? (
                         <button 
                            onClick={() => handleDownloadInvoice(don.id, don.donation_code)}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition shadow-sm ring-1 ring-slate-200 hover:ring-slate-900"
                         >
                            <FontAwesomeIcon icon={faFileInvoiceDollar} />
                         </button>
                      ) : (
                         <span className="text-slate-300 text-sm font-bold">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
           {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-6 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-12 w-full bg-slate-100 rounded-2xl" />
                </div>
              ))
           ) : donations.length === 0 ? (
              <div className="px-6 py-24 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                  <FontAwesomeIcon icon={faReceipt} className="text-3xl" />
                </div>
                <h3 className="mt-6 text-base font-bold text-slate-900">{t("mitra.no_donation_history")}</h3>
              </div>
           ) : (
              donations.map((don) => (
                <div key={don.id} className="p-6 transition-colors space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("mitra.donation_code")}</p>
                      <p className="text-sm font-bold text-slate-900 uppercase">
                         {don.donation_code}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                         {new Date(don.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={don.status} t={t} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("mitra.program")}</p>
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                        {locale === "en" && don.program?.title_en 
                          ? don.program.title_en 
                          : (don.program?.title ?? t("mitra.general_donation"))}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-[20px] bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600">
                       <FontAwesomeIcon icon={faReceipt} className="text-[10px]" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{t("common.amount")}</span>
                    </div>
                    <span className="font-heading text-lg font-black text-emerald-700">{formatIDR(don.amount).replace('Rp', 'Rp ')}</span>
                  </div>

                  {don.status === 'paid' && (
                    <div className="pt-2">
                      <button 
                          onClick={() => handleDownloadInvoice(don.id, don.donation_code)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
                      >
                          <FontAwesomeIcon icon={faFileInvoiceDollar} />
                          {t("mitra.download_invoice", "Download Invoice")}
                      </button>
                    </div>
                  )}
                </div>
              ))
           )}
        </div>

        {/* Dynamic Pagination Controls */}
        {!loading && donations.length > 0 && (
          <div className="flex flex-col gap-4 items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-6 sm:flex-row">
            <div className="text-sm font-bold text-slate-500">
               {t("mitra.showing_info")
                 .replace("{count}", donations.length.toString())
                 .replace("{total}", totalItems.toString())}
            </div>
            <div className="flex gap-3">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 shadow-sm"
              >
                <FontAwesomeIcon icon={faChevronLeft} size="sm" />
              </button>
              <div className="flex h-12 min-w-[48px] items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-black text-white shadow-lg shadow-slate-200">
                {currentPage} / {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 shadow-sm"
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
    paid: "text-emerald-50 bg-emerald-600 ring-emerald-600",
    pending: "text-amber-50 bg-amber-600 ring-amber-600",
    failed: "text-rose-50 bg-rose-600 ring-rose-600",
    expired: "text-slate-50 bg-slate-600 ring-slate-600",
  };
  
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 transition-all ${styles[status] || "text-slate-400 bg-slate-50 ring-slate-100"}`}>
      {t(`status.${status}`, status)}
    </span>
  );
}
