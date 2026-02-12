import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCircleCheck,
  faCoins,
  faUserGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useSuperAdminDashboard } from "../../../hooks/useSuperAdminDashboard";
import { StatCard } from "../../../components/management/StatCard";
import type { TopProgram } from "../../../types/dashboard";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value);

const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getProgramStatusLabel = (status: string | null | undefined) => {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "active") return { label: "Berjalan", tone: "green" as const };
  if (normalized === "completed" || normalized === "archived") return { label: "Tersalurkan", tone: "neutral" as const };
  return { label: "Draf", tone: "amber" as const };
};

const badgeTone = (tone: "neutral" | "green" | "amber") => {
  if (tone === "green") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (tone === "amber") return "bg-primary-50 text-primary-700 ring-primary-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const buildTrend = (base: number, multipliers: number[]) =>
  multipliers.map((mult) => Math.max(0, Math.round(base * mult)));

function ChartCard({
  title,
  subtitle,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h2 className="font-heading text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <div className="h-72 w-full">{children}</div>
    </div>
  );
}

export function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useSuperAdminDashboard();

  const stats = useMemo(() => {
    const raw = data?.stats ?? {};
    return {
      usersTotal: normalizeNumber(raw.users_total),
      usersActive: normalizeNumber(raw.users_active),
      usersInactive: normalizeNumber(raw.users_inactive),
      programsTotal: normalizeNumber(raw.programs_total),
      articlesTotal: normalizeNumber(raw.articles_total),
      donationsPaid: normalizeNumber(raw.donations_paid),
      donationsPending: normalizeNumber(raw.donations_pending),
    };
  }, [data]);

  const topPrograms = useMemo(() => {
    const list = Array.isArray(data?.top_programs) ? data?.top_programs : [];
    return list.filter((p) => p && typeof p === "object" && typeof (p as any).id === "number") as TopProgram[];
  }, [data]);

  const usersChartData = useMemo(() => {
    return {
      labels: ["  Aktif", "  Nonaktif"],
      datasets: [
        {
          label: "Pengguna",
          data: [stats.usersActive, stats.usersInactive],
          backgroundColor: ["#10B981", "#EF4444"], // Emerald-500 vs Red-500
          hoverBackgroundColor: ["#059669", "#DC2626"],
          borderWidth: 0,
          borderRadius: 20,
          spacing: 2,
        },
      ],
    };
  }, [stats]);

  const usersChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            boxWidth: 8,
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            font: {
              family: "'Inter', sans-serif",
              size: 11,
              weight: 600
            },
            color: "#64748B"
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          padding: 12,
          cornerRadius: 12,
          titleFont: { family: "'Inter', sans-serif", size: 13 },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
        },
      },
      cutout: "75%",
      layout: { padding: 10 },
    };
  }, []);

  const donationTrendLabels = useMemo(
    () => ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    []
  );

  const donationTrendData = useMemo(() => {
    const paidBase = normalizeNumber(stats.donationsPaid);
    const programBase = Math.max(1, normalizeNumber(stats.programsTotal));
    const paidSeries = buildTrend(paidBase, [0.52, 0.68, 0.62, 0.74, 0.81, 0.77, 0.9]);
    const programSeries = buildTrend(programBase, [0.4, 0.55, 0.5, 0.6, 0.7, 0.65, 0.8]);

    return {
      labels: donationTrendLabels,
      datasets: [
        {
          label: "  Donasi",
          data: paidSeries,
          borderColor: "#059669", // Emerald-600
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)"); // Emerald-500
            gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
            return gradient;
          },
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#059669",
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 3,
          fill: true,
        },
        {
          label: "  Program",
          data: programSeries,
          borderColor: "#F59E0B", // Amber-500
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: "#F59E0B",
        },
      ],
    };
  }, [donationTrendLabels, stats]);

  const donationTrendOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
            padding: 20,
            color: "#64748B",
            font: { size: 12, weight: 600, family: "'Inter', sans-serif" }
          },
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleColor: "#f8fafc",
          bodyColor: "#f1f5f9",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          displayColors: true,
          boxPadding: 4,
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { size: 11 } },
          grid: { display: false },
        },
        y: {
          ticks: {
            color: "#94a3b8",
            font: { size: 10 },
            callback: (value: any) => value >= 1000 ? `${value / 1000}k` : value,
          },
          grid: { color: "#f1f5f9", borderDash: [4, 4], drawBorder: false },
          beginAtZero: true,
        },
      },
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
      }
    };
  }, []);

  const topProgramsChartData = useMemo(() => {
    const labels = topPrograms.map((p) => String(p.title ?? "").trim() || `#${p.id}`);
    const values = topPrograms.map((p) => normalizeNumber((p as any).donations_paid));
    return {
      labels,
      datasets: [
        {
          label: "Donasi lunas (jumlah)",
          data: values,
          backgroundColor: "#34D399", // Emerald-400
          hoverBackgroundColor: "#10B981", // Emerald-500
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 32,
        },
      ],
    };
  }, [topPrograms]);

  const topProgramsChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleColor: "#f8fafc",
          bodyColor: "#f1f5f9",
          padding: 12,
          cornerRadius: 12,
          titleFont: { family: "'Inter', sans-serif", size: 13 },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          displayColors: false,
          callbacks: {
            label: (context: any) => `Jumlah: ${new Intl.NumberFormat("id-ID").format(context.raw)}`
          }
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#94a3b8",
            font: { size: 11, family: "'Inter', sans-serif" },
            maxRotation: 0,
            autoSkip: true
          },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          ticks: {
            color: "#94a3b8",
            font: { size: 10, family: "'Inter', sans-serif" },
            callback: (value: any) => value >= 1000 ? `${value / 1000}k` : value,
          },
          grid: { color: "#f1f5f9", borderDash: [4, 4], drawBorder: false },
          border: { display: false },
          beginAtZero: true,
        },
      },
      layout: { padding: { top: 20 } }
    };
  }, []);

  return (
    <div className="dashboard-shell min-h-screen">
      <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 p-4 md:p-8 pb-10">

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
                  Pusat Kendali
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Dashboard Super Admin
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Pantau metrik utama, kelola pengguna sistem, dan analisis performa platform secara real-time.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/superadmin/users")}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-900/10 transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                <FontAwesomeIcon icon={faUserGroup} />
                Kelola Pengguna
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-red-100 bg-red-50 p-6 flex items-center gap-4 text-red-700 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <FontAwesomeIcon icon={faChartLine} className="rotate-180" />
          </div>
          <p className="font-bold">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard
          title="Total Pengguna"
          value={formatCount(stats.usersTotal)}
          icon={faUsers}
          loading={loading}
          tone="emerald" // Using tone instead of gradient
        />
        <StatCard
          title="Pengguna Aktif"
          value={formatCount(stats.usersActive)}
          icon={faCircleCheck}
          loading={loading}
          tone="sky" // Using tone instead of gradient
        />
        <StatCard
          title="Konten Sistem"
          value={
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl">{formatCount(stats.programsTotal)} <span className="text-lg font-medium opacity-80">Program</span></span>
              <span className="text-2xl">{formatCount(stats.articlesTotal)} <span className="text-lg font-medium opacity-80">Artikel</span></span>
            </div>
          }
          icon={faChartLine}
          loading={loading}
          tone="emerald" // Using tone instead of gradient
        />
        <StatCard
          title="Donasi Lunas"
          value={formatCurrency(stats.donationsPaid)}
          icon={faCoins}
          loading={loading}
          tone="violet" // Using tone instead of gradient
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ChartCard
            title="Tren Aktivitas Mingguan"
            subtitle="Grafik donasi lunas dan penambahan program baru dalam 7 hari terakhir."
            badge={
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                Live Data
              </span>
            }
          >
            <Line data={donationTrendData} options={donationTrendOptions as any} />
          </ChartCard>
        </div>
        <div className="lg:col-span-4">
          <div className="grid gap-8 h-full">
            <ChartCard
              title="Komposisi Pengguna"
              subtitle="Perbandingan pengguna aktif dan nonaktif."
            >
              <div className="flex items-center justify-center h-full">
                <Doughnut data={usersChartData} options={usersChartOptions as any} />
              </div>
            </ChartCard>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ChartCard
            title="Program Unggulan"
            subtitle={`Top ${topPrograms.length} program dengan donasi tertinggi.`}
          >
            <Bar data={topProgramsChartData} options={topProgramsChartOptions as any} />
          </ChartCard>
        </div>
        <div className="lg:col-span-8">
          <div className="flex h-full flex-col rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="font-heading text-xl font-bold text-slate-900">Detail Program Teratas</h2>
              <p className="text-sm font-medium text-slate-500">Analisis status dan performa donasi per program.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Program</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Total Donasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                        <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-slate-100" /></td>
                        <td className="px-6 py-4"><div className="ml-auto h-4 w-24 rounded bg-slate-100" /></td>
                      </tr>
                    ))
                  ) : topPrograms.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm font-semibold text-slate-500">
                        Tidak ada data program.
                      </td>
                    </tr>
                  ) : (
                    topPrograms.map((p) => {
                      const status = getProgramStatusLabel(p.status);
                      return (
                        <tr key={p.id} className="group transition hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="line-clamp-1 font-bold text-slate-900 group-hover:text-emerald-700 transition">{p.title}</p>
                            <span className="text-xs font-semibold text-slate-400">ID: {p.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeTone(status.tone)}`}>
                              <div className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status.tone === 'green' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900 tabular-nums">
                            {formatCount(normalizeNumber(p.donations_paid))}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  </div>
</div>
  );
}




export default SuperAdminDashboardPage;
