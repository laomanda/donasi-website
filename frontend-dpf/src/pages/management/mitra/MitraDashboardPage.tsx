import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faWallet, 
  faHandHoldingHeart, 
  faLayerGroup, 
  faClock, 
  faArrowRight, 
  faFileInvoiceDollar,
  faCircleCheck,
  faPlus,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { Link } from "react-router-dom";

type MitraStats = {
  total_contribution: number;
  current_balance: number;
  pending_count: number;
  programs_count: number;
};

type Donation = {
  id: number;
  donation_code: string;
  amount: number;
  status: string;
  paid_at: string | null;
  program?: { name: string };
};

type Allocation = {
  id: number;
  amount: number;
  description: string;
  proof_path: string | null;
  created_at: string;
  program?: { name: string };
};

export function MitraDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MitraStats | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [recentAllocations, setRecentAllocations] = useState<Allocation[]>([]);

  const fetchData = async () => {
    try {
      const res = await http.get("/mitra/dashboard");
      setStats(res.data.data.stats);
      setRecentDonations(res.data.data.recent_donations);
      setRecentAllocations(res.data.data.recent_allocations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brandGreen-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Welcome */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Dashboard Mitra</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Pantau kontribusi dan transparansi penyaluran dana Anda.
          </p>
        </div>
        <Link 
          to="/donate" 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-md shadow-slate-200"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          Donasi Baru
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Saldo Tersedia" 
          value={formatIDR(stats?.current_balance ?? 0)} 
          icon={faWallet} 
          color="bg-brandGreen-50 text-brandGreen-600 ring-brandGreen-100"
          desc="Belum dialokasikan"
        />
        <StatCard 
          label="Total Kontribusi" 
          value={formatIDR(stats?.total_contribution ?? 0)} 
          icon={faHandHoldingHeart} 
          color="bg-blue-50 text-blue-600 ring-blue-100"
          desc="Dana yang sudah lunas"
        />
        <StatCard 
          label="Program Didukung" 
          value={stats?.programs_count ?? 0} 
          icon={faLayerGroup} 
          color="bg-purple-50 text-purple-600 ring-purple-100"
          desc="Variasi dampak sosial"
        />
        <StatCard 
          label="Donasi Pending" 
          value={stats?.pending_count ?? 0} 
          icon={faClock} 
          color="bg-amber-50 text-amber-600 ring-amber-100"
          desc="Menunggu pembayaran"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Allocation Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Transparansi Penyaluran Dana</h3>
              <Link to="/mitra/allocations" className="text-xs font-bold text-brandGreen-600 hover:underline px-3 py-1 bg-brandGreen-50 rounded-lg">
                Lihat Semua
              </Link>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Alokasi / Program</th>
                    <th className="px-4 py-4 text-right">Nominal</th>
                    <th className="px-6 py-4 text-center">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAllocations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">
                        Belum ada dana yang digunakan oleh Admin.
                      </td>
                    </tr>
                  ) : (
                    recentAllocations.map((alloc) => (
                      <tr key={alloc.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-semibold text-xs tabular-nums">
                          {formatDateShort(alloc.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 line-clamp-1">{alloc.description}</p>
                          <p className="text-xs text-slate-500 font-medium">{alloc.program?.name ?? "Program Umum"}</p>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-red-600 tabular-nums">
                          -{formatIDR(alloc.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {alloc.proof_path ? (
                            <a 
                              href={StorageUrl(alloc.proof_path)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            >
                              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                            </a>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Recent Donations */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5">
              <h3 className="font-bold text-slate-900">Donasi Terakhir</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {recentDonations.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-400 italic">
                  Belum ada riwayat donasi.
                </div>
              ) : (
                recentDonations.map((don) => (
                  <div key={don.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 tabular-nums">
                          {don.donation_code}
                        </p>
                        <p className="mt-1 font-bold text-slate-900 line-clamp-1">
                          {don.program?.name ?? "Donasi Umum"}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                           <StatusBadge status={don.status} />
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                             {formatDate(don.paid_at || don.id.toString())}
                           </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 tabular-nums">{formatIDR(don.amount)}</p>
                        {don.status === 'paid' && (
                           <button className="mt-2 text-[10px] font-bold text-brandGreen-600 hover:underline">
                              <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-1" />
                              Invoice
                           </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Tip Card */}
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-slate-800">
                <FontAwesomeIcon icon={faCircleCheck} className="text-brandGreen-400" />
             </div>
             <h4 className="mt-4 font-bold">Laporan Transparan</h4>
             <p className="mt-2 text-xs text-slate-400 font-medium leading-relaxed">
               Setiap dana yang digunakan oleh lembaga akan muncul di tabel alokasi sebelah kiri secara real-time.
             </p>
             <Link to="/layanan" className="mt-4 flex items-center text-xs font-bold text-brandGreen-400 hover:text-brandGreen-300 group">
                Pelajari Layanan Kami
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, desc }: { label: string, value: string | number, icon: any, color: string, desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${color}`}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
          <p className="mt-1 truncate font-heading text-xl font-extrabold text-slate-900 tabular-nums">{value}</p>
        </div>
      </div>
      <p className="mt-4 border-t border-slate-50 pt-3 text-[10px] font-bold text-slate-400 tracking-wider">
        {desc}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    pending: "bg-amber-50 text-amber-600 ring-amber-100",
    failed: "bg-rose-50 text-rose-600 ring-rose-100",
    expired: "bg-slate-100 text-slate-500 ring-slate-200",
  };
  
  const label: Record<string, string> = {
    paid: "Lunas",
    pending: "Menunggu",
    failed: "Gagal",
    expired: "Kadaluwarsa",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${styles[status] || styles.expired}`}>
      {label[status] || status}
    </span>
  );
}

const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const formatDateShort = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });
};

const StorageUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";
    return `${baseUrl}/${path}`;
};
