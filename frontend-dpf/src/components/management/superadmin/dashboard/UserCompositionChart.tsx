import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartCard } from "./ChartCard";

interface UserCompositionChartProps {
  stats: {
    usersActive: number;
    usersInactive: number;
  };
}

export function UserCompositionChart({ stats }: UserCompositionChartProps) {
  const usersChartData = useMemo(() => {
    return {
      labels: ["  Aktif", "  Nonaktif"],
      datasets: [
        {
          label: "Pengguna",
          data: [stats.usersActive, stats.usersInactive],
          backgroundColor: ["#10B981", "#EF4444"],
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

  return (
    <ChartCard
      title="Komposisi Pengguna"
      subtitle="Perbandingan pengguna aktif dan nonaktif."
    >
      <div className="flex items-center justify-center h-full">
        <Doughnut data={usersChartData} options={usersChartOptions} />
      </div>
    </ChartCard>
  );
}
