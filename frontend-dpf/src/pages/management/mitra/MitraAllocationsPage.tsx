import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshake, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";

type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  created_at: string;
  program?: { name: string };
};

export function MitraAllocationsPage() {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  const fetchData = async () => {
    try {
      const res = await http.get("/mitra/dashboard"); // The dashboard endpoint returns recent ones, but we might need a dedicated index later.
      // For now, let's use the dashboard's data or assume a list endpoint exists.
      // Re-using dashboard controller logic for now as it contains recent ones.
      setAllocations(res.data.data.recent_allocations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-600 ring-1 ring-brandGreen-100">
          <FontAwesomeIcon icon={faHandshake} className="text-xl" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Transparansi Dana</h1>
          <p className="text-sm text-slate-500 font-medium">Riwayat penggunaan dana kontribusi Anda oleh DPF.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <th className="px-6 py-4">Tanggal Alokasi</th>
              <th className="px-6 py-4">Program / Tujuan</th>
              <th className="px-6 py-4 text-right">Nominal</th>
              <th className="px-6 py-4 text-center">Bukti Penyaluran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">
                  Belum ada riwayat alokasi dana.
                </td>
              </tr>
            ) : (
              allocations.map((alloc) => (
                <tr key={alloc.id} className="text-sm hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 text-slate-500 tabular-nums">
                    {new Date(alloc.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{alloc.description}</p>
                    <p className="text-xs text-slate-500 font-medium">{alloc.program?.name ?? "Program Umum"}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600 tabular-nums">
                    -{formatIDR(alloc.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {alloc.proof_path ? (
                      <a 
                        href={`http://localhost:8000/storage/${alloc.proof_path}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                        Lihat Bukti
                      </a>
                    ) : (
                      <span className="text-slate-300 italic text-xs">Menunggu Bukti</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
