import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faBuildingColumns, 
  faCalendarAlt, 
  faFileInvoice, 
  faExternalLinkAlt,
  faMoneyBillWave,
  faCheckCircle,
  faReceipt,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useLang } from "../../../lib/i18n";

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

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Memuat data...</div>;
  if (!allocation) return <div className="p-8 text-center text-red-500 font-bold">Data tidak ditemukan</div>;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
            onClick={() => navigate(-1)} 
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm ring-1 ring-slate-200 transition"
        >
            <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Detail Alokasi Dana</h1>
            <p className="text-sm text-slate-500 font-medium">#{allocation.id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                
                {/* Amount & Program */}
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nominal Alokasi</p>
                        <p className="font-heading text-3xl font-bold text-slate-900">{formatIDR(allocation.amount)}</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                             <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Sumber Dana</p>
                            <p className="text-sm font-bold text-slate-700">{allocation.program?.title ?? "Dana Umum"}</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileInvoice} className="text-slate-400" />
                        Keterangan / Tujuan
                    </h3>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 text-sm leading-relaxed">
                        {allocation.description}
                    </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 mb-1">Tanggal Alokasi</p>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-300" />
                            {formatDate(allocation.created_at)}
                        </p>
                     </div>
                     <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 mb-1">Status</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Berhasil / Selesai
                        </span>
                     </div>
                </div>
            </div>
        </div>

        {/* Proof Section */}
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faReceipt} className="text-slate-400" />
                    Bukti Penggunaan
                </h3>
                
                {allocation.proof_path ? (
                    <div className="space-y-4 flex-1">
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 group">
                            <img 
                                src={StorageUrl(allocation.proof_path)} 
                                alt="Bukti Alokasi" 
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                        </div>
                        <a 
                            href={StorageUrl(allocation.proof_path)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 transition shadow-sm"
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                            Buka Ukuran Penuh
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                             <FontAwesomeIcon icon={faFileInvoice} className="text-xl" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Tidak ada bukti foto dilampirkan.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
