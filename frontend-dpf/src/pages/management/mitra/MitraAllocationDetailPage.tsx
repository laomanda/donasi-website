import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faBuildingColumns, 
  faCalendarAlt, 
  faFileInvoice, 
  faExternalLinkAlt,
  faCheckCircle,
  faReceipt
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

export function MitraAllocationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await http.get(`/mitra/allocations/${id}`);
        setAllocation(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return null;
  if (!allocation) return <div className="p-8 text-center text-red-500 font-bold">{t("mitra.data_not_found")}</div>;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };
  
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  };

  const StorageUrl = (path: string) => {
      const baseUrl = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";
      return `${baseUrl}/${path}`;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header Section - Solid & Clean */}
      <div className="relative overflow-hidden rounded-[28px] bg-emerald-600 p-8 md:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <button 
                onClick={() => navigate(-1)} 
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </button>
            <div className="min-w-0">
               <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/10">
                {t("mitra.allocation_unit")}
               </span>
               <h1 className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl">
                 ID: #{allocation.id}
               </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-8">
                
                {/* Amount & Program */}
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-8 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{t("mitra.allocation_nominal")}</p>
                        <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
                            {formatIDR(allocation.amount)}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 px-5 py-3 rounded-2xl">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600">
                             <FontAwesomeIcon icon={faBuildingColumns} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("mitra.allocation_program")}</p>
                            <p className="text-base font-bold text-emerald-600">{allocation.program?.title ?? t("mitra.general_program")}</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileInvoice} className="text-emerald-500" />
                        {t("mitra.purpose")}
                    </h3>
                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 text-slate-800 text-base leading-relaxed font-medium">
                        {allocation.description}
                    </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 transition hover:bg-emerald-50/20">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t("mitra.allocation_date")}</p>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </span>
                            <span className="whitespace-nowrap">{formatDate(allocation.created_at)}</span>
                        </p>
                     </div>
                     <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 transition hover:bg-emerald-50/20">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t("mitra.transaction_status")}</p>
                        <span className="inline-flex items-center gap-2 text-emerald-600 text-sm font-bold">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            {t("mitra.verified_success")}
                        </span>
                     </div>
                </div>
            </div>
        </div>

        {/* Proof Section */}
        <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col sm:p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                    <FontAwesomeIcon icon={faReceipt} className="text-emerald-500" />
                    {t("mitra.proof_usage")}
                </h3>
                
                {allocation.proof_path ? (
                    <div className="space-y-6 flex-1 flex flex-col">
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 flex-1">
                            <img 
                                src={StorageUrl(allocation.proof_path)} 
                                alt="Bukti Alokasi" 
                                className="h-full w-full object-cover" 
                            />
                        </div>
                        <a 
                            href={StorageUrl(allocation.proof_path)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold text-white hover:bg-slate-800 transition"
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                            {t("mitra.full_size")}
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                             <FontAwesomeIcon icon={faFileInvoice} className="text-2xl" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">{t("mitra.no_proof")}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
