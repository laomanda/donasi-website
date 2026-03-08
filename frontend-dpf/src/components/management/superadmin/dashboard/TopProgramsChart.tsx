import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { ChartCard } from "./ChartCard";
import type { TopProgram } from "../../../../types/dashboard";
import { normalizeNumber } from "../shared/SuperAdminUtils";

interface TopProgramsChartProps {
  topPrograms: TopProgram[];
}

export function TopProgramsChart({ topPrograms }: TopProgramsChartProps) {
  const topProgramsChartData = useMemo(() => {
    const labels = topPrograms.map((p) => String(p.title ?? "").trim() || `#${p.id}`);
    const values = topPrograms.map((p) => normalizeNumber((p as any).donations_paid));
    return {
      labels,
      datasets: [
        {
          label: "Donasi lunas (jumlah)",
          data: values,
          backgroundColor: "#34D399",
          hoverBackgroundColor: "#10B981",
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
          mode: "index" as const,
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
    <ChartCard
      title="Program Unggulan"
      subtitle={`Top ${topPrograms.length} program dengan donasi tertinggi.`}
    >
      <Bar data={topProgramsChartData} options={topProgramsChartOptions} />
    </ChartCard>
  );
}
