import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faCoins,
  faGlobe,
  faReceipt,
  faRotateRight,
  faTruckFast,
  faUsers,
  faComments,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import { usePelihatDashboard } from "../../../hooks/usePelihatDashboard";
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

// --- Utility Functions ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value);

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};


const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#f43f5e"];
const CHART_GRADIENT_ID = "colorTrendLuxury";

const formatTrend = (value: number) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}%`;
};

export function PelihatDashboardPage() {
  const { data, loading, error, reload, chartRange, changeRange } = usePelihatDashboard();

  // --- Data Processing (all from real API) ---
  const stats = useMemo(() => {
    const raw = data?.stats ?? {};
    return {
      totalRevenue: normalizeNumber(raw.total_revenue),
      activeDonors: normalizeNumber(raw.active_donors),
      todayDonations: normalizeNumber(raw.today_donations),
      successRate: normalizeNumber(raw.success_rate),
    };
  }, [data]);

  const trends = useMemo(() => {
    const raw = data?.trends ?? {};
    return {
      totalRevenue: normalizeNumber(raw.total_revenue),
      activeDonors: normalizeNumber(raw.active_donors),
      todayDonations: normalizeNumber(raw.today_donations),
      successRate: normalizeNumber(raw.success_rate),
    };
  }, [data]);

  const recentDonations = useMemo(() => {
    return (data?.recent_donations ?? []).slice(0, 5);
  }, [data]);

  const trendData = useMemo(() => data?.chart_data ?? [], [data]);

  const distributionData = useMemo(() => {
    const raw = data?.distribution ?? [];
    return [...raw].sort((a, b) => b.value - a.value).slice(0, 5);
  }, [data]);


  // --- Error State ---
  if (error) {
    return (
      <div className="flex min-h-[80vh] w-full items-center justify-center bg-slate-50/50 p-8">
        <div className="max-w-md rounded-[40px] border border-rose-100 bg-white p-12 text-center shadow-[0_20px_50px_rgba(225,29,72,0.1)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 ring-4 ring-rose-50">
            <FontAwesomeIcon icon={faCircleInfo} size="2x" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Gagal Memuat Data</h2>
          <p className="mt-3 text-slate-500 leading-relaxed">Terjadi kesalahan saat menghubungi server transparansi. Silakan coba sesaat lagi.</p>
          <button
            onClick={() => reload()}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-transform hover:scale-105 active:scale-95"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen w-full text-slate-800 pb-20">
      <div className="mx-auto max-w-[1920px] px-6 md:px-10 lg:px-14 pt-10">
        
        {/* 1. Header Section: Spacious & Clean */}
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Pusat <span className="text-emerald-600">Transparansi</span>
            </h1>
            <p className="mt-2 text-lg text-slate-400 font-medium max-w-2xl">
              Monitoring real-time aliran dana wakaf dan operasional yayasan secara terbuka.
            </p>
          </div>
        </header>



        {/* 2. Key Metrics Row: Floating Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatCard 
            title="Total Wakaf Terhimpun" 
            value={loading ? "..." : formatCurrency(stats.totalRevenue)} 
            icon={faReceipt} 
            trend={formatTrend(trends.totalRevenue)} 
            color="emerald"
            subtext="30 hari terakhir"
          />
          <StatCard 
            title="Donatur Terverifikasi" 
            value={loading ? "..." : formatCount(stats.activeDonors)} 
            icon={faUsers} 
            trend={formatTrend(trends.activeDonors)} 
            color="blue"
            subtext="Unik berdasarkan telepon"
          />
          <StatCard 
            title="Arus Kas Harian" 
            value={loading ? "..." : formatCurrency(stats.todayDonations)} 
            icon={faCoins} 
            trend={formatTrend(trends.todayDonations)} 
            color="amber"
            subtext="Hari ini vs kemarin"
          />
          <StatCard 
            title="Tingkat Kesuksesan" 
            value={loading ? "..." : `${stats.successRate}%`} 
            icon={faGlobe} 
            trend={formatTrend(trends.successRate)} 
            color="violet"
            subtext="Transaksi berhasil"
          />
        </div>

        {/* 3. Main Content Layout: Asymmetrical Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (Charts) - Spans 8 Columns */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            
            {/* Primary Chart Area */}
            <div className="group relative overflow-hidden rounded-[40px] bg-white p-8 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] border border-slate-100 transition-all hover:shadow-[0_8px_40px_-12px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Tren Pertumbuhan Wakaf</h3>
                  <p className="text-sm text-slate-400 font-medium">
                    {chartRange === '1W' ? 'Analisis 7 hari terakhir' : chartRange === '1M' ? 'Analisis 30 hari terakhir' : 'Analisis 12 bulan terakhir'}
                  </p>
                </div>
                <div className="flex gap-2">
                   {['1W', '1M', '1Y'].map(range => (
                     <button 
                       key={range} 
                       onClick={() => changeRange(range)}
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === chartRange ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                     >
                       {range}
                     </button>
                   ))}
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={CHART_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      fill={`url(#${CHART_GRADIENT_ID})`} 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 gap-8">
              
              {/* Pie Chart Card */}
              <div className="rounded-[40px] bg-white p-8 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Distribusi Program</h3>
                <div className="flex flex-col items-center gap-6">
                  <div className="h-[220px] w-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={distributionData} 
                          innerRadius={70} 
                          outerRadius={90} 
                          paddingAngle={5} 
                          dataKey="value"
                          cornerRadius={6}
                        >
                          {distributionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-3xl font-black text-slate-900">{distributionData.length}</span>
                       <span className="text-[10px] uppercase font-bold text-slate-400">Sektor</span>
                    </div>
                  </div>
                  
                  <div className="w-full grid grid-cols-1 gap-2">
                    {distributionData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                          <span className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* RIGHT COLUMN (Activity Feed & Widgets) - Spans 4 Columns */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            
            {/* Dark Activity Feed Card - The "Premium Contrast" Element */}
            <div className="rounded-[40px] bg-white p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col">

              <div className="relative z-10 mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">5 Donasi Terbaru</h3>
                </div>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] scrollbar-hide">
                 {loading ? (
                    [1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
                 ) : recentDonations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <FontAwesomeIcon icon={faComments} size="2x" className="mb-2 opacity-20" />
                      <p>Tidak ada aktivitas baru</p>
                    </div>
                 ) : (
                    recentDonations.map((item, idx) => (
                      <div key={idx} className="group flex items-start gap-4 rounded-2xl p-4 transition-all hover:bg-white/5 border border-transparent hover:border-white/5">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white font-bold text-xs uppercase">
                           {item.donor_name ? item.donor_name.charAt(0) : "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-baseline mb-1">
                              <p className="text-sm font-bold text-slate-900 truncate">{item.donor_name || "Hamba Allah"}</p>
                              <span className="text-[10px] font-medium text-slate-500">{formatDateTime(item.created_at).split(',')[0]}</span>
                           </div>
                           <p className="text-xs text-slate-400 truncate mb-2">{item.program?.title || "Donasi Umum"}</p>
                           <div className="flex items-center justify-between">
                              <span className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold text-brandGreen-600 uppercase tracking-wide">
                                {item.status}
                              </span>
                              <span className="text-xs rounded-lg font-bold bg-brandGreen-600 text-white p-1">{formatCurrency(normalizeNumber(item.amount))}</span>
                           </div>
                        </div>
                      </div>
                    ))
                 )}
              </div>

              <div className="relative z-10 mt-4 pt-4 text-center">
                 <button className="text-xs font-bold text-white bg-brandGreen-500 rounded-lg p-3 hover:bg-brandGreen-600 transition-colors tracking-wide uppercase">
                    Lihat Lebih Lengkap
                 </button>
              </div>
            </div>

            {/* Operational Status Cards */}
            <div className="grid grid-cols-2 gap-4">
               <WidgetSmall 
                 icon={faTruckFast} 
                 label="Jemput Wakaf" 
                 value={data?.pickup_pending ?? 0} 
                 unit="Antrean" 
                 color="indigo"
               />
               <WidgetSmall 
                 icon={faComments} 
                 label="Konsultasi" 
                 value={data?.consultation_new ?? 0} 
                 unit="Baru"
                 color="rose"
               />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components for Clean Code ---

// 1. Luxury Stat Card
const StatCard = ({ title, value, icon, trend, color, subtext }: { title: string, value: string, icon: any, trend: string, color: 'emerald'|'blue'|'amber'|'violet', subtext: string }) => {
  const cardBg = {
    emerald: "bg-emerald-600",
    blue: "bg-blue-600",
    amber: "bg-amber-500",
    violet: "bg-violet-600",
  };
  const iconStyles = {
    emerald: "text-emerald-600 bg-white/90",
    blue: "text-blue-600 bg-white/90",
    amber: "text-amber-600 bg-white/90",
    violet: "text-violet-600 bg-white/90",
  };

  return (
    <div className={`relative overflow-hidden rounded-[32px] ${cardBg[color]} p-6 shadow-lg`}>
       <div className="flex justify-between items-start mb-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg shadow-sm ${iconStyles[color]}`}>
             <FontAwesomeIcon icon={icon} />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white">
             <FontAwesomeIcon icon={faArrowTrendUp} className="text-[9px]" />
             {trend}
          </div>
       </div>
       <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-1">{value}</h3>
          <p className="text-xs font-medium text-white/60">{subtext}</p>
       </div>
    </div>
  );
};

const WidgetSmall = ({ icon, label, value, unit, color }: { icon: any, label: string, value: number, unit: string, color: 'indigo' | 'rose' }) => {
  const bg = { indigo: 'bg-indigo-600', rose: 'bg-rose-600' };
  const iconStyle = { indigo: 'text-indigo-600 bg-white/90', rose: 'text-rose-600 bg-white/90' };

  return (
    <div className={`relative overflow-hidden rounded-[32px] ${bg[color]} p-5 shadow-lg`}>
      <div className="mb-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-sm ${iconStyle[color]}`}>
           <FontAwesomeIcon icon={icon} />
        </div>
      </div>
      <div>
         <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1.5">{label}</p>
         <div className="flex items-baseline gap-1.5">
           <span className="text-3xl font-black text-white leading-none">{value}</span>
           <span className="text-sm font-bold text-white/60">{unit}</span>
         </div>
      </div>
    </div>
  );
};

// 3. Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl bg-slate-900 p-4 shadow-xl border border-slate-800">
        <p className="mb-2 text-xs font-bold text-slate-400">{label}</p>
        <p className="text-lg font-black text-white">
          {payload[0].value.toLocaleString('id-ID')}
        </p>
      </div>
    );
  }
  return null;
};

export default PelihatDashboardPage;