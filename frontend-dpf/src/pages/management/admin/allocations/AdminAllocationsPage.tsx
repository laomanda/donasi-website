


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
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  Keuangan
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Alokasi Mitra
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Kelola dan pantau penggunaan dana dari Dompet Mitra.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-emerald-50">
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 ring-1 ring-white/10">
                  Total Transaksi: <span className="font-bold text-white">{total}</span>
                </span>
              </div>
            </div>

            <Link
              to="/admin/allocations/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-emerald-700 px-6 py-4 text-sm font-bold shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FontAwesomeIcon icon={faPlus} />
              Alokasi Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-4 sm:grid-cols-1">
            <label className="block">
              <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Pencarian</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari Mitra, Program, atau Keterangan..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Tanggal</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Mitra</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Program / Deskripsi</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Nominal</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-20 rounded bg-slate-100 ml-auto" /></td>
                    <td className="px-6 py-5"><div className="h-8 w-8 rounded bg-slate-100 mx-auto" /></td>
                  </tr>
                ))
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                    Belum ada data alokasi yang cocok.
                  </td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr 
                    key={alloc.id} 
                    className="transition hover:bg-slate-50 border-l-4 border-transparent hover:border-l-emerald-500"
                  >
                    <td className="px-6 py-5 text-sm font-semibold text-slate-500 tabular-nums">
                      {formatDate(alloc.created_at)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                          <FontAwesomeIcon icon={faCoins} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{alloc.user.name}</p>
                          <p className="text-xs text-slate-500">{alloc.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">{alloc.description}</p>
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                        {alloc.program?.title ?? "Program Umum"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-red-600">
                      -{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(alloc.amount)}
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-center gap-2">
                          {alloc.proof_path ? (
                            <a 
                              href={`http://localhost:8000/storage/${alloc.proof_path}`} 
                              target="_blank" 
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition"
                              title="Lihat Bukti"
                            >
                              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No Proof</span>
                          )}
                       </div>
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

