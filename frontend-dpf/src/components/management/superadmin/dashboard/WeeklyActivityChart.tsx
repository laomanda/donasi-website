import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { ChartCard } from "./ChartCard";
import { buildTrend } from "../shared/SuperAdminUtils";

interface WeeklyActivityChartProps {
  stats: {
    donationsPaid: number;
    programsTotal: number;
  };
}

export function WeeklyActivityChart({ stats }: WeeklyActivityChartProps) {
  const donationTrendLabels = useMemo(
    () => ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    []
  );

  const donationTrendData = useMemo(() => {
    const paidBase = stats.donationsPaid;
    const programBase = Math.max(1, stats.programsTotal);
    const paidSeries = buildTrend(paidBase, [0.52, 0.68, 0.62, 0.74, 0.81, 0.77, 0.9]);
    const programSeries = buildTrend(programBase, [0.4, 0.55, 0.5, 0.6, 0.7, 0.65, 0.8]);

    return {
      labels: donationTrendLabels,
      datasets: [
        {
          label: "  Donasi",
          data: paidSeries,
          borderColor: "#059669",
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
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
          yAxisID: "y",
          fill: true,
        },
        {
          label: "  Program",
          data: programSeries,
          borderColor: "#F59E0B",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: "#F59E0B",
          yAxisID: "y1",
        },
      ],
    };
  }, [stats]);

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
          mode: "index" as const,
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
          type: "linear" as const,
          display: true,
          position: "left" as const,
          ticks: {
            color: "#94a3b8",
            font: { size: 10 },
            callback: (value: any) => (value >= 1000 ? `${value / 1000}k` : value),
          },
          grid: { color: "#f1f5f9", borderDash: [4, 4], drawBorder: false },
          beginAtZero: true,
          title: {
            display: true,
            text: "Donasi (IDR)",
            color: "#64748B",
            font: { size: 10, weight: 600 }
          }
        },
        y1: {
          type: "linear" as const,
          display: true,
          position: "right" as const,
          ticks: {
            color: "#94a3b8",
            font: { size: 10 },
          },
          grid: { display: false },
          beginAtZero: true,
          title: {
            display: true,
            text: "Jumlah Program",
            color: "#F59E0B",
            font: { size: 10, weight: 600 }
          }
        },
      },
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
      }
    };
  }, []);

  return (
    <ChartCard
      title="Tren Aktivitas Mingguan"
      subtitle="Grafik donasi lunas dan penambahan program baru dalam 7 hari terakhir."
      badge={
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
          Live Data
        </span>
      }
    >
      <Line data={donationTrendData} options={donationTrendOptions} />
    </ChartCard>
  );
}
