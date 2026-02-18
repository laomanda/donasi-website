import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMagnifyingGlass,
  faFilter,
  faReceipt,
  faFilePdf,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useLang } from "../../../lib/i18n";
import { mitraDict, translate } from "../../../i18n/mitra";

type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  created_at: string;
  program: {
    id: number;
    title: string;
  } | null;
};

export function MitraAllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [q, setQ] = useState("");
  
  // Dummy state for filters to match design (logic can be implemented later if needed)
  const [programId, setProgramId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await http.get("/mitra/allocations", {
          params: {
              q,
              date_from: dateFrom,
              date_to: dateTo
          }
      });
      // res.data.data is the paginated object. res.data.data.data is the array.
      setAllocations(res.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [q, dateFrom, dateTo]); // Trigger fetch when filters change

  const handleDownloadPdf = async () => {
      setLoadingPdf(true);
      try {
          const response = await http.get('/mitra/allocations/export/pdf', {
              params: {
                  q,
                  date_from: dateFrom,
                  date_to: dateTo,
                  lang: locale
              },
              responseType: 'blob'
          });
          
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Laporan_Alokasi_${new Date().toISOString().split('T')[0]}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (error) {
          console.error("Failed to download PDF", error);
      } finally {
          setLoadingPdf(false);
      }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const hasFilters = Boolean(q.trim() || programId || dateFrom || dateTo);

  const onResetFilters = () => {
      setQ("");
      setProgramId("");
      setDateFrom("");
      setDateTo("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header Section - Solid & Clean */}
      <div className="relative overflow-hidden rounded-[28px] bg-emerald-600 p-8 md:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
              {t("mitra.allocation_transparency")}
            </h1>
            <p className="mt-2 max-w-2xl text-emerald-50 font-medium text-lg">
              {t("mitra.dashboard_subtitle")}
            </p>
          </div>
          <button
              onClick={handleDownloadPdf}
              disabled={loadingPdf}
              className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70 md:mt-0"
            >
              {loadingPdf ? (
                 <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                 <FontAwesomeIcon icon={faFilePdf} />
              )}
              {t("mitra.download_report")}
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
          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
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
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder={t("mitra.search_placeholder")}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("mitra.date_from")}</span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("mitra.date_to")}</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-900">
              <tr>
                <th className="w-[15%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("mitra.date")}</th>
                <th className="w-[60%] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("mitra.program_allocation")}</th>
                <th className="w-[25%] px-6 py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("mitra.nominal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-6" colSpan={3}>
                        <div className="flex items-center gap-4">
                          <div className="h-4 w-full rounded bg-slate-100" />
                        </div>
                      </td>
                    </tr>
                 ))
              ) : allocations.length === 0 ? (
                <tr>
                   <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FontAwesomeIcon icon={faReceipt} className="text-2xl" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{t("mitra.no_allocation")}</h3>
                  </td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc.id} className="cursor-pointer border-l-4 border-l-transparent transition hover:bg-slate-50" onClick={() => navigate(`/mitra/allocations/${alloc.id}`)}>
                    <td className="px-6 py-5 text-sm font-bold tabular-nums text-slate-900">
                      {new Date(alloc.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-left">
                      <p className="font-bold text-slate-900 mb-2">{alloc.description}</p>
                      <span className="inline-flex items-center rounded-full bg-primary-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        {alloc.program?.title ?? t("mitra.general_program")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="inline-block px-2.5 py-1 font-bold text-white rounded-lg bg-brandGreen-600 tabular-nums text-[11px] lg:text-xs whitespace-nowrap shadow-sm">
                        {formatIDR(alloc.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
