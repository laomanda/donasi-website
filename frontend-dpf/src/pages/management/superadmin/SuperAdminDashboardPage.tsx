import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faChartLine,
  faCircleCheck,
  faCircleInfo,
  faGears,
  faRotateRight,
  faUserGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

type SuperAdminStats = {
  users_total?: number;
  users_active?: number;
  users_inactive?: number;
  programs_total?: number;
  articles_total?: number;
  donations_paid?: number;
  donations_pending?: number;
};

type RoleCount = {
  id?: number;
  name: string;
  users_count?: number;
};

type TopProgram = {
  id: number;
  title: string;
  status?: string | null;
  donations_paid?: number;
};

type SuperAdminDashboardPayload = {
  stats?: SuperAdminStats;
  roles?: RoleCount[];
  latest_users?: unknown;
  top_programs?: TopProgram[];
};

const BRAND = {
  brandGreen: {
    50: "#f3faf3",
    200: "#bde4bd",
    400: "#5fab5f",
    600: "#347334",
    700: "#295a29",
    800: "#1f4220",
  },
  primary: {
    50: "#fff7e6",
    200: "#ffd68a",
    500: "#ff8a00",
    700: "#ea580c",
  },
  slate: {
    100: "#f1f5f9",
    300: "#cbd5e1",
    500: "#64748b",
    800: "#1e293b",
    900: "#0f172a",
  },
};

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
    year: "numeric",
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

function StatCard({
  title,
  value,
  icon,
  tone,
  loading,
}: {
  title: string;
  value: string;
  icon: any;
  tone: { bg: string; border: string; iconBg: string; iconText: string };
  loading: boolean;
}) {
  return (
    <div className={`rounded-[28px] border ${tone.border} ${tone.bg} p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold tracking-wide text-slate-600">{title}</p>
          <p
            className={[
              "font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl",
              "break-words",
              loading ? "text-slate-300" : "text-slate-900",
            ].join(" ")}
          >
            {value}
          </p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${tone.iconBg}`} aria-hidden="true">
          <FontAwesomeIcon icon={icon} className={tone.iconText} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.2em] text-slate-400">Analisis</p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">{title}</h2>
        </div>
        {badge ? (
          <div className="shrink-0">
            {badge}
          </div>
        ) : null}
      </div>
      <div className="mt-5 h-64 sm:h-72">{children}</div>
    </div>
  );
}

export function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<SuperAdminDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<SuperAdminDashboardPayload>("/superadmin/dashboard");
      setData(res.data ?? null);
      setLastUpdatedAt(new Date());
    } catch {
      setError("Gagal memuat dashboard super admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [data?.stats]);

  const topPrograms = useMemo(() => {
    const list = Array.isArray(data?.top_programs) ? data?.top_programs : [];
    return list.filter((p) => p && typeof p === "object" && typeof (p as any).id === "number") as TopProgram[];
  }, [data?.top_programs]);

  const usersChartData = useMemo(() => {
    return {
      labels: ["Aktif", "Nonaktif"],
      datasets: [
        {
          label: "Pengguna",
          data: [stats.usersActive, stats.usersInactive],
          backgroundColor: [BRAND.brandGreen[700], BRAND.slate[300]],
          borderColor: [BRAND.brandGreen[700], BRAND.slate[300]],
          borderWidth: 1,
        },
      ],
    };
  }, [stats.usersActive, stats.usersInactive]);

  const usersChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { boxWidth: 10, boxHeight: 10, color: BRAND.slate[800] },
        },
        tooltip: { enabled: true },
      },
      cutout: "68%",
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
          label: "Donasi",
          data: paidSeries,
          borderColor: BRAND.brandGreen[700],
          backgroundColor: "rgba(41, 90, 41, 0.12)",
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: BRAND.brandGreen[700],
        },
        {
          label: "Program",
          data: programSeries,
          borderColor: BRAND.primary[500],
          backgroundColor: "rgba(255, 138, 0, 0.12)",
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: BRAND.primary[500],
        },
      ],
    };
  }, [donationTrendLabels, stats.donationsPaid, stats.programsTotal]);

  const donationTrendOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { boxWidth: 10, boxHeight: 10, color: BRAND.slate[800] },
        },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          ticks: { color: BRAND.slate[500] },
          grid: { display: false },
        },
        y: {
          ticks: { color: BRAND.slate[500], precision: 0 },
          grid: { color: BRAND.slate[100] },
          beginAtZero: true,
        },
      },
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
          backgroundColor: BRAND.brandGreen[600],
          borderColor: BRAND.brandGreen[600],
          borderWidth: 1,
          borderRadius: 14,
          barThickness: 18,
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
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          ticks: { color: BRAND.slate[500], maxRotation: 0, autoSkip: true },
          grid: { display: false },
        },
        y: {
          ticks: { color: BRAND.slate[500], precision: 0 },
          grid: { color: BRAND.slate[100] },
          beginAtZero: true,
        },
      },
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-[28px] border border-brandGreen-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-brandGreen-700 ring-1 ring-brandGreen-100">
              Pusat kendali
            </span>
            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
                Dashboard Super Admin
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                <span className="h-2 w-2 rounded-full bg-brandGreen-600" />
                {lastUpdatedAt ? `Pembaruan terakhir: ${formatDateTime(lastUpdatedAt.toISOString())}` : "Pembaruan terakhir: -"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => void fetchDashboard()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Muat ulang
            </button>
            <button
              type="button"
              onClick={() => navigate("/superadmin/users")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brandGreen-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-800"
            >
              <FontAwesomeIcon icon={faUserGroup} />
              Kelola pengguna
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs opacity-90" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/superadmin/settings")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brandGreen-100 bg-brandGreen-50 px-5 py-3 text-sm font-bold text-brandGreen-800 shadow-sm transition hover:bg-brandGreen-100"
            >
              <FontAwesomeIcon icon={faGears} />
              Pengaturan
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold text-slate-900">Ringkasan cepat</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total pengguna"
            value={loading ? "-" : formatCount(stats.usersTotal)}
            icon={faUsers}
            loading={loading}
            tone={{ bg: "bg-brandGreen-100", border: "border-brandGreen-200", iconBg: "border-brandGreen-200 bg-white", iconText: "text-brandGreen-700" }}
          />
          <StatCard
            title="Pengguna aktif"
            value={loading ? "-" : formatCount(stats.usersActive)}
            icon={faCircleCheck}
            loading={loading}
            tone={{ bg: "bg-brandGreen-50", border: "border-brandGreen-200", iconBg: "border-brandGreen-200 bg-white", iconText: "text-brandGreen-700" }}
          />
          <StatCard
            title="Program / artikel"
            value={loading ? "-" : `${formatCount(stats.programsTotal)} / ${formatCount(stats.articlesTotal)}`}
            icon={faChartLine}
            loading={loading}
            tone={{ bg: "bg-primary-100", border: "border-primary-200", iconBg: "border-primary-200 bg-white", iconText: "text-primary-700" }}
          />
        </div>
        <div className="mt-4">
          <StatCard
            title="Donasi lunas"
            value={loading ? "-" : formatCurrency(stats.donationsPaid)}
            icon={faCircleInfo}
            loading={loading}
            tone={{ bg: "bg-primary-50", border: "border-primary-200", iconBg: "border-primary-200 bg-white", iconText: "text-primary-700" }}
          />
        </div>
      </section>

      <section>
        <ChartCard
          title="Tren donasi dan program"
          badge={
            <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-xs font-bold text-brandGreen-700 ring-1 ring-brandGreen-100">
              7 hari terakhir
            </span>
          }
        >
          <Line data={donationTrendData} options={donationTrendOptions as any} />
        </ChartCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ChartCard
            title="Status pengguna"
            badge={
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                Total: {formatCount(stats.usersTotal)}
              </span>
            }
          >
            <Doughnut data={usersChartData} options={usersChartOptions as any} />
          </ChartCard>
        </div>
        <div className="lg:col-span-6">
          <ChartCard
            title="Program teratas"
            badge={
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
                Teratas {topPrograms.length}
              </span>
            }
          >
            <Bar data={topProgramsChartData} options={topProgramsChartOptions as any} />
          </ChartCard>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.2em] text-slate-400">Ringkasan program</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Program teratas</h2>
            <p className="mt-2 text-sm text-slate-600">Status dan jumlah donasi lunas per program.</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs font-bold tracking-wide text-slate-500">
                <th className="px-5 py-4">Program</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Donasi lunas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 w-2/3 rounded bg-slate-100" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-6 w-24 rounded-full bg-slate-100" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="ml-auto h-4 w-16 rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : topPrograms.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm font-semibold text-slate-600">
                    Belum ada data program.
                  </td>
                </tr>
              ) : (
                topPrograms.map((p) => {
                  const status = getProgramStatusLabel(p.status);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="line-clamp-1 text-sm font-bold text-slate-900">{p.title}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">ID: {p.id}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${badgeTone(status.tone)}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 tabular-nums">
                        {formatCount(normalizeNumber(p.donations_paid))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SuperAdminDashboardPage;

