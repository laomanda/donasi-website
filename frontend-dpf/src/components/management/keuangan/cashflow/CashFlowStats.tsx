import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faHandHoldingDollar,
  faWallet,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import type { CashFlowSummary } from "@/types/cashflow";

type CashFlowStatsProps = {
  summary?: CashFlowSummary;
  loading: boolean;
  formatCurrency: (val: number) => string;
};

export function CashFlowStats({
  summary,
  loading,
  formatCurrency,
}: CashFlowStatsProps) {
  const stats = [
    {
      title: "Total Kas Masuk (Inflow)",
      value: summary ? formatCurrency(summary.total_inflow) : "Rp 0",
      subtext: `${summary?.total_inflow_count ?? 0} Transaksi Donasi Lunas`,
      icon: faArrowTrendUp,
      bg: "bg-brandGreen-600",
      iconBg: "bg-white/20",
    },
    {
      title: "Total Penyaluran (Outflow)",
      value: summary ? formatCurrency(summary.total_outflow) : "Rp 0",
      subtext: `${summary?.total_outflow_count ?? 0} Realisasi Penyaluran`,
      icon: faHandHoldingDollar,
      bg: "bg-rose-600",
      iconBg: "bg-white/20",
    },
    {
      title: "Net Arus Kas (Surplus)",
      value: summary ? formatCurrency(summary.net_cash_flow) : "Rp 0",
      subtext: (summary?.net_cash_flow ?? 0) >= 0 ? "Kondisi Kas Sehat" : "Penyaluran > Donasi",
      icon: faWallet,
      bg: "bg-slate-900",
      iconBg: "bg-white/20",
    },
    {
      title: "Rasio Penyaluran",
      value: summary ? `${summary.disbursement_ratio.toFixed(1)}%` : "0%",
      subtext: "Tingkat Serapan Dana",
      icon: faChartPie,
      bg: "bg-amber-500",
      iconBg: "bg-white/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item, idx) => {
        return (
          <div
            key={idx}
            className={`flex flex-col justify-between rounded-2xl p-4 sm:p-5 text-white shadow-xs transition hover:shadow-sm ${item.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                {item.title}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.iconBg} text-white`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-xs" />
              </div>
            </div>

            <div className="mt-3">
              {loading ? (
                <div className="h-6 w-28 animate-pulse rounded bg-white/20" />
              ) : (
                <p className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white">
                  {item.value}
                </p>
              )}
              <p className="mt-1 text-[11px] font-medium text-white/75">
                {item.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
