


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faExternalLinkAlt,
  faMagnifyingGlass,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../../lib/http";
import { useToast } from "../../../../components/ui/ToastProvider";

type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  created_at: string;
  user: { name: string; email: string };
  program?: { title: string };
};

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

export function AdminAllocationsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [q, setQ] = useState("");
  const [total, setTotal] = useState(0);

  const fetchData = async (search = "") => {
    setLoading(true);
    try {
      const { data } = await http.get("/admin/allocations", {
        params: { q: search, per_page: 50 },
      });
      setAllocations(data.data.data);
      setTotal(data.data.total);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data alokasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(q);
    }, 500);
    return () => clearTimeout(timer);
  }, [q]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 bg-brandGreen-600" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full" />

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-50 ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  Layanan Kemitraan
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Alokasi Mitra
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Monitoring penggunaan dana dompet mitra secara transparan.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-start md:items-end lg:flex-col">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-50 backdrop-blur-sm">
                Total Alokasi
                <span className="font-bold text-white">{new Intl.NumberFormat("id-ID").format(total)}</span>
              </span>

              <Link
                to="/admin/allocations/create"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <FontAwesomeIcon icon={faPlus} className="bg-emerald-100/50 p-1.5 rounded-full text-xs" />
                Buat Alokasi Baru
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="relative group max-w-2xl">
        <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 transition-colors group-focus-within:text-emerald-500">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari Mitra atau Program..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5"
        />
      </div>

      {/* Main Content */}
      <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Waktu & Tanggal</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Mitra Pelaksana</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Detail Penggunaan</th>
                <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Nominal</th>
                <th className="px-8 py-5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-8 py-6"><div className="h-10 w-40 rounded bg-slate-100" /></td>
                    <td className="px-8 py-6"><div className="h-10 w-48 rounded bg-slate-100" /></td>
                    <td className="px-8 py-6"><div className="h-6 w-24 rounded bg-slate-100 ml-auto" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-8 rounded bg-slate-100 mx-auto" /></td>
                  </tr>
                ))
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
                        <FontAwesomeIcon icon={faMagnifyingGlass} size="xl" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Tidak ada data ditemukan</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc.id} className="group transition hover:bg-slate-50/80">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700">{formatDate(alloc.created_at).split(',')[0]}</p>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{formatDate(alloc.created_at).split(',')[1]}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{alloc.user.name}</p>
                          <p className="text-xs font-semibold text-slate-500 truncate">{alloc.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="line-clamp-1 font-bold text-slate-900">{alloc.description}</p>
                      <span className="mt-1.5 inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100">
                        {alloc.program?.title ?? "Program Umum"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="font-heading text-lg font-bold text-rose-600">
                        -{formatCurrency(alloc.amount)}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        {alloc.proof_path ? (
                          <a
                            href={`http://localhost:8000/storage/${alloc.proof_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-md hover:ring-emerald-500"
                            title="Buka Bukti Transfer"
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold uppercase text-slate-300 italic tracking-widest">No File</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="p-6 space-y-4 animate-pulse">
                <div className="flex justify-between"><div className="h-4 w-24 rounded bg-slate-100" /><div className="h-4 w-20 rounded bg-slate-100" /></div>
                <div className="h-12 w-full rounded bg-slate-100" />
                <div className="h-6 w-32 rounded bg-slate-100" />
               </div>
             ))
          ) : allocations.length === 0 ? (
            <div className="p-12 text-center">
               <p className="text-sm font-bold text-slate-900">Tidak ada data ditemukan</p>
            </div>
          ) : (
            allocations.map((alloc) => (
              <div key={alloc.id} className="p-6 space-y-4 active:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Waktu Transaksi</p>
                      <p className="text-sm font-bold text-slate-700">{formatDate(alloc.created_at)}</p>
                   </div>
                   {alloc.proof_path && (
                      <a
                        href={`http://localhost:8000/storage/${alloc.proof_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 shadow-sm"
                      >
                         <FontAwesomeIcon icon={faExternalLinkAlt} />
                      </a>
                   )}
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <FontAwesomeIcon icon={faCoins} className="text-lg" />
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Mitra Pelaksana</p>
                      <p className="font-bold text-slate-900 truncate">{alloc.user.name}</p>
                      <p className="text-[11px] font-semibold text-slate-500 truncate">{alloc.user.email}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900 leading-snug">{alloc.description}</p>
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {alloc.program?.title ?? "Program Umum"}
                      </span>
                   </div>
                   <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Nominal</span>
                      <span className="font-heading text-xl font-black text-rose-600">-{formatCurrency(alloc.amount)}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

