import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReceipt, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";

type Donation = {
  id: number;
  donation_code: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  program?: { name: string };
};

export function MitraDonationsPage() {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);

  const fetchData = async () => {
    try {
      const res = await http.get("/mitra/dashboard");
      setDonations(res.data.data.recent_donations);
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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <FontAwesomeIcon icon={faReceipt} className="text-xl" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Riwayat Donasi</h1>
          <p className="text-sm text-slate-500 font-medium">Lacak semua transaksi kontribusi yang pernah Anda lakukan.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <th className="px-6 py-4">Kode Transaksi</th>
              <th className="px-6 py-4">Program</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Nominal</th>
              <th className="px-6 py-4 text-center">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {donations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">
                  Belum ada riwayat donasi.
                </td>
              </tr>
            ) : (
              donations.map((don) => (
                <tr key={don.id} className="text-sm hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 tabular-nums">{don.donation_code}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        {new Date(don.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{don.program?.name ?? "Donasi Umum"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={don.status} />
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 tabular-nums">
                    {formatIDR(don.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {don.status === 'paid' ? (
                       <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition shadow-sm">
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
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    pending: "bg-amber-50 text-amber-600 ring-amber-100",
    failed: "bg-rose-50 text-rose-600 ring-rose-100",
  };
  
  const label: Record<string, string> = {
    paid: "Lunas",
    pending: "Menunggu",
    failed: "Gagal",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${styles[status] || "bg-slate-100 text-slate-500 ring-slate-200"}`}>
      {label[status] || status}
    </span>
  );
}
