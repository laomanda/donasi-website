import { useEffect, useState } from "react";

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
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  created_at: string;
  program: {
    id: number;
    title: string;
    title_en: string | null;
  } | null;
};

export function MitraAllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);

  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [q, setQ] = useState("");
  
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

  const StorageUrl = (path: string) => {
      const baseUrl = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";
      return `${baseUrl}/${path}`;
  };



  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header Section - Modern Gradient & Professional Typography */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-600 to-teal-700 p-8 shadow-xl shadow-emerald-100 md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/5 blur-2xl" />
        
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-heading text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("mitra.allocation_transparency")}
            </h1>
            <p className="mt-4 text-lg font-medium text-emerald-50/90 leading-relaxed">
              {t("mitra.dashboard_subtitle")}
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={loadingPdf}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-white/10 px-8 py-4 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur-md transition-all hover:bg-white/20 hover:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingPdf ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faFilePdf} className="transition-transform group-hover:scale-110" />
            )}
            {t("mitra.download_report")}
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
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t("mitra.search_label", "Cari Program atau Alokasi")}</label>
            <div className="relative group">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("mitra.search_placeholder")}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t("mitra.date_from")}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t("mitra.date_to")}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="w-[15%] px-8 py-6 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{t("mitra.date")}</th>
                <th className="w-[40%] px-8 py-6 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{t("mitra.program_allocation")}</th>
                <th className="w-[25%] px-8 py-6 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{t("mitra.nominal")}</th>
                <th className="w-[20%] px-8 py-6 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{t("mitra.proof_usage", "Bukti Penggunaan")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-8" colSpan={4}>
                        <div className="flex items-center gap-6">
                          <div className="h-5 w-32 rounded-lg bg-slate-100" />
                          <div className="h-5 flex-1 rounded-lg bg-slate-100" />
                          <div className="h-8 w-40 rounded-xl bg-slate-100" />
                        </div>
                      </td>
                    </tr>
                 ))
              ) : allocations.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                      <FontAwesomeIcon icon={faReceipt} className="text-3xl" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-slate-900">{t("mitra.no_allocation")}</h3>
                    <p className="mt-2 text-slate-500">Coba ubah kata kunci atau periode filter Anda.</p>
                  </td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc.id} className="group transition-all hover:bg-slate-50/80">
                    <td className="px-8 py-7 text-sm font-bold tabular-nums text-slate-600 group-hover:text-slate-900 transition-colors">
                      {new Date(alloc.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-7">
                      <p className="font-bold text-slate-900 mb-3 line-clamp-2 leading-relaxed group-hover:text-brandGreen-700 transition-colors">{alloc.description}</p>
                      <span className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-primary-600 shadow-sm">
                        {locale === "en" && alloc.program?.title_en 
                          ? alloc.program.title_en 
                          : (alloc.program?.title ?? t("mitra.general_program"))}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <span className="inline-block px-5 py-2 font-heading text-sm font-black text-white rounded-2xl bg-red-600 tabular-nums shadow-sm ring-1 ring-red-600">
                        -{formatIDR(alloc.amount)}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-center">
                        {alloc.proof_path ? (
                            <a 
                                href={StorageUrl(alloc.proof_path)} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 rounded-xl bg-brandGreen-600 px-4 py-2 text-xs font-bold text-white shadow-sm ring-1 ring-brandGreen-600 hover:bg-brandGreen-700 transition-colors"
                            >
                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                                Lihat
                            </a>
                        ) : (
                            <span className="text-xs font-bold text-slate-400 italic">Tidak ada</span>
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
           ) : allocations.length === 0 ? (
              <div className="px-6 py-24 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                  <FontAwesomeIcon icon={faReceipt} className="text-3xl" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{t("mitra.no_allocation")}</h3>
              </div>
           ) : (
              allocations.map((alloc) => (
                <div 
                  key={alloc.id} 
                  className="p-6 transition-colors space-y-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Periode</p>
                      <p className="text-sm font-bold text-slate-900">
                         {new Date(alloc.created_at).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-100">
                       {alloc.program?.title ? "Program" : "Umum"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Keperluan</p>
                    <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{alloc.description}</p>
                    {alloc.program && (
                      <p className="text-[11px] font-semibold text-emerald-600 line-clamp-1">
                        {locale === "en" && alloc.program.title_en 
                          ? alloc.program.title_en 
                          : alloc.program.title}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-[20px] bg-rose-50/70 p-4 ring-1 ring-rose-100">
                    <div className="flex items-center gap-2 text-rose-500">
                       <FontAwesomeIcon icon={faReceipt} className="text-[10px]" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Nominal Alokasi</span>
                    </div>
                    <span className="font-heading text-lg font-black text-rose-600">-{formatIDR(alloc.amount).replace('Rp', 'Rp ')}</span>
                  </div>

                  {/* Proof Download Mobile Button */}
                  <div className="pt-2">
                    {alloc.proof_path ? (
                        <a 
                            href={StorageUrl(alloc.proof_path)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-primary-700 active:scale-95"
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                            Buka Bukti Penggunaan
                        </a>
                    ) : (
                        <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-black uppercase tracking-widest text-slate-400">
                            Tidak ada bukti
                        </div>
                    )}
                  </div>
                </div>
              ))
           )}
        </div>
      </div>
    </div>
  );
}
