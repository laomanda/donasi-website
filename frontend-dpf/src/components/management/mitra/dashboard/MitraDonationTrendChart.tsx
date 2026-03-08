import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatIDR } from "../shared/MitraUtils";

interface MitraDonationTrendChartProps {
  data: Array<{ label: string; amount: number }>;
  filterType: "monthly" | "weekly";
  setFilterType: (type: "monthly" | "weekly") => void;
  t: (key: string, fallback?: string) => string;
}

export function MitraDonationTrendChart({
  data,
  filterType,
  setFilterType,
  t,
}: MitraDonationTrendChartProps) {
  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t("chart.trend_title", "Tren Donasi")}</h3>
          <p className="text-xs font-semibold text-slate-500">
            {filterType === "monthly"
              ? t("chart.trend_subtitle_monthly", "Statistik 6 bulan terakhir")
              : t("chart.trend_subtitle_weekly", "Statistik 4 minggu terakhir")}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-1">
          <button
            onClick={() => setFilterType("monthly")}
            className={[
              "rounded-md px-3 py-1 text-xs font-bold transition-all",
              filterType === "monthly"
                ? "bg-white text-brandGreen-600 shadow-sm ring-1 ring-slate-200"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
            ].join(" ")}
          >
            {t("chart.monthly", "Bulanan")}
          </button>
          <button
            onClick={() => setFilterType("weekly")}
            className={[
              "rounded-md px-3 py-1 text-xs font-bold transition-all",
              filterType === "weekly"
                ? "bg-white text-brandGreen-600 shadow-sm ring-1 ring-slate-200"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
            ].join(" ")}
          >
            {t("chart.weekly", "Mingguan")}
          </button>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
  );
}
