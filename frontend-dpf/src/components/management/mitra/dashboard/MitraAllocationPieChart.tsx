import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatIDR } from "../shared/MitraUtils";

interface MitraAllocationPieChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
  t: (key: string, fallback?: string) => string;
}

export function MitraAllocationPieChart({ data, colors, t }: MitraAllocationPieChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-bold text-slate-900">
        {t("chart.distribution_title", "Alokasi Dana")}
      </h3>
      <p className="mb-6 text-xs font-semibold text-slate-500">
        {t("chart.distribution_subtitle", "Distribusi berdasarkan kategori")}
      </p>

      <div className="relative flex h-[240px] items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "none" }}
              formatter={(value: number) => [formatIDR(value), t("stats.amount", "Nominal")]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-slate-900">{total > 0 ? "100%" : "0%"}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("chart.total", "TOTAL")}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm font-bold text-slate-800">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
