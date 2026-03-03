import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandshake,
  faCoins,
  faFileContract,
  faChevronRight,
  faHeartPulse,
  faExternalLinkAlt,
  faHandHoldingHeart,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import http from "../../../lib/http";
import { resolveStorageBaseUrl } from "../../../lib/urls";
import { useLang } from "../../../lib/i18n";
import { mitraDict, translate } from "../../../i18n/mitra";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MitraStats {
  total_donations: number;
  total_allocations: number;
  remaining_balance: number;
  donation_count: number;
  allocation_count: number;
  recent_donations: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    donatur_name: string;
  }>;
  recent_allocations: Array<{
    id: string;
    amount: number;
    title: string;
    created_at: string;
    proof_path?: string;
  }>;
  monthly_donations?: Array<{
    label: string;
    amount: number;
  }>;
  weekly_donations?: Array<{
    label: string;
    amount: number;
  }>;
  allocation_distribution?: Array<{
    name: string;
    value: number;
  }>;
}



export function MitraDashboardPage() {
  const [data, setData] = useState<MitraStats | null>(null);
  const [filterType, setFilterType] = useState<"monthly" | "weekly">("monthly");
  const { locale } = useLang();
  
  const t = (key: string, fallback?: string) => translate(mitraDict, locale, key, fallback);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await http.get("/mitra/dashboard");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch mitra dashboard data", error);
      }
    };
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (filterType === "weekly") {
        return data?.weekly_donations || [];
    }
    return data?.monthly_donations || [
      { label: "Jan", amount: 4500000 },
      { label: "Feb", amount: 5200000 },
      { label: "Mar", amount: 4800000 },
      { label: "Apr", amount: 6100000 },
      { label: "May", amount: 5500000 },
      { label: "Jun", amount: 6700000 },
    ];
  }, [data, filterType]);

  const distributionData = useMemo(() => {
    return data?.allocation_distribution || [
      { name: t("chart.education", "Pendidikan"), value: 40 },
      { name: t("chart.health", "Kesehatan"), value: 30 },
      { name: t("chart.social", "Sosial"), value: 20 },
      { name: t("chart.other", "Lainnya"), value: 10 },
    ];
  }, [data, locale]);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1"];

  return (
    <div 
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">{t("dashboard.title", "Ringkasan Mitra")}</h1>
          <p className="mt-1 text-slate-500">{t("dashboard.subtitle", "Pantau donasi dan alokasi dana secara real-time.")}</p>
        </div>
        <Link
          to="/donate"
          className="inline-flex items-center gap-2 rounded-xl bg-brandGreen-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
        >
          <FontAwesomeIcon icon={faHandHoldingHeart} />
          {t("dashboard.donate_button", "Donasi Sekarang")}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        <StatCard
          label={t("stats.total_donations", "Total Donasi")}
          value={formatIDR(data?.total_donations || 0)}
          icon={faHeartPulse}
          color="teal"
          loading={!data}
        />
        <StatCard
          label={t("stats.total_allocations", "Total Alokasi")}
          value={formatIDR(data?.total_allocations || 0)}
          icon={faHandshake}
          color="violet"
          loading={!data}
        />
        <StatCard
          label={t("stats.remaining_balance", "Sisa Saldo")}
          value={formatIDR(data?.remaining_balance || 0)}
          icon={faCoins}
          color="rose"
          loading={!data}
        />
        <StatCard
          label={t("stats.donation_count", "Jumlah Donasi")}
          value={data?.donation_count || 0}
          icon={faFileContract}
          color="sky"
          loading={!data}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t("chart.trend_title", "Tren Donasi")}</h3>
                <p className="text-xs font-semibold text-slate-500">
                  {filterType === "monthly" 
                    ? t("chart.trend_subtitle_monthly", "Statistik 6 bulan terakhir")
                    : t("chart.trend_subtitle_weekly", "Statistik 4 minggu terakhir")
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-1">
                <button 
                    onClick={() => setFilterType("monthly")}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                        filterType === "monthly" 
                        ? "text-brandGreen-600 shadow-sm ring-1 ring-slate-200 bg-white" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    {t("chart.monthly", "Bulanan")}
                </button>
                <button 
                    onClick={() => setFilterType("weekly")}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                        filterType === "weekly" 
                        ? "text-brandGreen-600 shadow-sm ring-1 ring-slate-200 bg-white" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    {t("chart.weekly", "Mingguan")}
                </button>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label"  
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                    tickFormatter={(val: number) => {
                      if (val === 0) return "0";
                      if (val >= 1000000000) return `Rp${(val / 1000000000).toFixed(1)}M`;
                      if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)}Jt`;
                      if (val >= 1000) return `Rp${(val / 1000).toFixed(0)}rb`;
                      return `Rp${val}`;
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "none" }}
                    formatter={(value: number) => [formatIDR(value), t("stats.amount", "Nominal")]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{t("chart.distribution_title", "Alokasi Dana")}</h3>
            <p className="mb-6 text-xs font-semibold text-slate-500">{t("chart.distribution_subtitle", "Distribusi berdasarkan kategori")}</p>
            
            <div className="relative flex h-[240px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "none" }}
                    formatter={(value: number) => [formatIDR(value), t("stats.amount", "Nominal")]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                {(() => {
                   // Hitung total. Jika 0, berarti belum ada data alokasi.
                   const total = distributionData.reduce((acc, item) => acc + item.value, 0);
                   return (
                     <>
                        <span className="text-2xl font-bold text-slate-900">{total > 0 ? "100%" : "0%"}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("chart.total", "TOTAL")}</span>
                     </>
                   );
                })()}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {(() => {
                const total = distributionData.reduce((acc, item) => acc + item.value, 0);
                return distributionData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm font-bold text-slate-800">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                        {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">{t("table.recent_donations", "Donasi Terbaru")}</h3>
              <p className="text-xs font-semibold text-slate-500">{t("table.recent_donations_desc", "Data transaksi masuk terakhir")}</p>
            </div>
            <Link to="/mitra/donations" className="group text-sm font-bold text-brandGreen-600 hover:text-brandGreen-700 transition-colors">
              {t("common.view_all", "Lihat Semua")} <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("table.donatur", "Donatur")}</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("table.amount", "Nominal")}</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("table.status", "Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recent_donations || []).map((item) => (
                  <tr key={item.id} className="group transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-600 transition group-hover:bg-white group-hover:shadow-md group-hover:ring-1 group-hover:ring-slate-100">
                          {item.donatur_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.donatur_name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{formatDateShort(item.created_at, locale)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatIDR(item.amount)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {(data?.recent_donations || []).map((item) => (
              <div key={item.id} className="p-5 active:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-600">
                      {item.donatur_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.donatur_name}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{formatDateShort(item.created_at, locale)}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} t={t} />
                </div>
                <div className="flex items-center justify-between bg-slate-50/80 rounded-2xl p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Donasi</span>
                  <span className="font-heading text-lg font-black text-slate-900">{formatIDR(item.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">{t("table.recent_allocations", "Alokasi Pembiayaan")}</h3>
              <p className="text-xs font-semibold text-slate-500">{t("table.recent_allocations_desc", "Penyaluran dana terakhir")}</p>
            </div>
            <Link to="/mitra/allocations" className="group text-sm font-bold text-brandGreen-600 hover:text-brandGreen-700 transition-colors">
              {t("common.view_all", "Lihat Semua")} <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-[10px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("table.title", "Keperluan")}</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("table.amount", "Nominal")}</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("table.date", "Tanggal")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recent_allocations || []).map((item) => (
                  <tr key={item.id} className="group transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-brandGreen-700 transition-colors">{item.title}</p>
                        </div>
                        {item.proof_path && (
                          <a
                            href={StorageUrl(item.proof_path)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-brandGreen-600 hover:shadow-md hover:ring-1 hover:ring-brandGreen-100 transition-all"
                            title="Buka Bukti Penyaluran"
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-rose-600">-{formatIDR(item.amount)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{formatDateShort(item.created_at, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {(data?.recent_allocations || []).map((item) => (
              <div key={item.id} className="p-5 active:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Keperluan</p>
                    <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{item.title}</p>
                  </div>
                  {item.proof_path && (
                    <a
                      href={StorageUrl(item.proof_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-600 ring-1 ring-brandGreen-100 shadow-sm"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
                    </a>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">ID Transaksi</span>
                    <span className="text-slate-600">#{String(item.id).slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">Tanggal</span>
                    <span className="text-slate-600">{formatDateShort(item.created_at, locale)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-rose-50 rounded-2xl p-4 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Total Nominal</span>
                    <span className="font-heading text-lg font-black text-rose-600">-{formatIDR(item.amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, loading }: { label: string, value: string | number, icon: any, color: string, loading?: boolean }) {
  const themes: Record<string, string> = {
    teal: "from-emerald-600 to-teal-700",
    violet: "from-violet-600 to-indigo-700",
    rose: "from-rose-600 to-pink-700",
    sky: "from-sky-600 to-blue-700",
  };

  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${themes[color]} p-6 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] md:p-8`}>
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/5 blur-xl" />
      
      <div className="relative z-10 space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/30">
          <FontAwesomeIcon icon={icon} className="text-xl text-white shadow-sm" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/70">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-3/4 animate-pulse rounded-lg bg-white/20" />
          ) : (
            <p className="mt-1 text-2xl font-black text-white md:text-3xl">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, t }: { status: string, t: any }) {
  const styles: Record<string, string> = {
    paid: "bg-brandGreen-600 text-white ring-brandGreen-600",
    pending: "bg-amber-500 text-white ring-amber-500",
    failed: "bg-red-500 text-white ring-red-500",
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${styles[status] || "bg-slate-100 text-slate-500 ring-slate-200"}`}>
      {t(`status.${status}`, status)}
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

const formatDateShort = (dateStr: string, locale: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });
};

const StorageUrl = (path: string) => {
    const baseUrl = resolveStorageBaseUrl();
    return `${baseUrl}/${path}`;
};
