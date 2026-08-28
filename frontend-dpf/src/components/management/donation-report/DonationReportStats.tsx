import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faReceipt,
  faCoins,
  faHandHoldingDollar,
  faCreditCard,
  faCrown,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

type ReportSummary = {
  total_count?: number;
  total_amount?: number;
  manual_count?: number;
  manual_amount?: number;
  midtrans_count?: number;
  midtrans_amount?: number;
  top_donor?: {
    donor_name: string;
    total_amount: number;
    donation_count: number;
  } | null;
  top_program?: {
    program_title: string;
    total_amount: number;
    donation_count: number;
  } | null;
};

type DonationReportStatsProps = {
  summary: ReportSummary | null;
  loading: boolean;
  formatCurrency: (value: number | string | null | undefined) => string;
  formatCount: (value: number | undefined) => string;
};

type StatTheme = {
  accentBar: string;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
};

function ExecutiveStatCard({
  title,
  value,
  subValue,
  icon,
  theme,
  loading,
  isTextValue = false,
}: {
  title: string;
  value: string;
  subValue: string;
  icon: IconDefinition;
  theme: StatTheme;
  loading: boolean;
  isTextValue?: boolean;
}) {
  // Adaptive font size so numbers up to billions and long titles always fit neatly
  const getFontSize = (text: string, isText: boolean) => {
    if (isText) {
      if (text.length > 28) return "text-base sm:text-lg";
      return "text-lg sm:text-xl";
    }
    if (text.length > 18) return "text-xl sm:text-2xl";
    if (text.length > 13) return "text-2xl sm:text-[28px]";
    return "text-3xl sm:text-4xl";
  };

  const fontSizeClass = getFontSize(value, isTextValue);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Top subtle accent bar */}
      <div className={`absolute left-0 top-0 h-1 w-full ${theme.accentBar}`} />

      {/* Top Row: Title Label + Icon */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-transform duration-200 group-hover:scale-105 ${theme.iconBg} ${theme.iconColor} ${theme.iconBorder}`}
        >
          <FontAwesomeIcon icon={icon} className="text-base" />
        </div>
      </div>

      {/* Main Metric Value (Full Width available!) */}
      <div className="mt-3.5 min-w-0">
        {loading ? (
          <div className="h-9 w-3/4 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <p
            className={`font-heading font-extrabold tracking-tight text-slate-900 ${
              isTextValue ? "line-clamp-2 leading-snug" : "truncate tabular-nums"
            } ${fontSizeClass}`}
            title={value}
          >
            {value}
          </p>
        )}
      </div>

      {/* Bottom SubValue / Context Details */}
      <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
        {loading ? (
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="truncate text-xs font-medium text-slate-500">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

export function DonationReportStats({
  summary,
  loading,
  formatCurrency,
  formatCount,
}: DonationReportStatsProps) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <ExecutiveStatCard
        title="Total Transaksi"
        value={loading ? "-" : formatCount(summary?.total_count)}
        subValue="Semua donasi terverifikasi"
        icon={faReceipt}
        theme={{
          accentBar: "bg-emerald-500",
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-600",
          iconBorder: "border-emerald-100",
        }}
        loading={loading}
      />

      <ExecutiveStatCard
        title="Total Nominal"
        value={loading ? "-" : formatCurrency(summary?.total_amount ?? 0)}
        subValue="Akumulasi dana terkumpul"
        icon={faCoins}
        theme={{
          accentBar: "bg-teal-500",
          iconBg: "bg-teal-50",
          iconColor: "text-teal-600",
          iconBorder: "border-teal-100",
        }}
        loading={loading}
      />

      <ExecutiveStatCard
        title="Total Donasi Manual"
        value={loading ? "-" : formatCurrency(summary?.manual_amount ?? 0)}
        subValue={loading ? "-" : `${formatCount(summary?.manual_count)} transaksi manual`}
        icon={faHandHoldingDollar}
        theme={{
          accentBar: "bg-amber-500",
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
          iconBorder: "border-amber-100",
        }}
        loading={loading}
      />

      <ExecutiveStatCard
        title="Midtrans (Auto)"
        value={loading ? "-" : formatCurrency(summary?.midtrans_amount ?? 0)}
        subValue={loading ? "-" : `${formatCount(summary?.midtrans_count)} transaksi otomatis`}
        icon={faCreditCard}
        theme={{
          accentBar: "bg-indigo-500",
          iconBg: "bg-indigo-50",
          iconColor: "text-indigo-600",
          iconBorder: "border-indigo-100",
        }}
        loading={loading}
      />

      <ExecutiveStatCard
        title="Top Donatur"
        value={loading ? "-" : (summary?.top_donor?.donor_name || "-")}
        subValue={loading ? "-" : `Total: ${formatCurrency(summary?.top_donor?.total_amount)} (${formatCount(summary?.top_donor?.donation_count)}x donasi)`}
        icon={faCrown}
        theme={{
          accentBar: "bg-purple-500",
          iconBg: "bg-purple-50",
          iconColor: "text-purple-600",
          iconBorder: "border-purple-100",
        }}
        loading={loading}
        isTextValue={true}
      />

      <ExecutiveStatCard
        title="Program Unggulan"
        value={loading ? "-" : (summary?.top_program?.program_title || "-")}
        subValue={loading ? "-" : `Terkumpul: ${formatCurrency(summary?.top_program?.total_amount)} (${formatCount(summary?.top_program?.donation_count)}x donasi)`}
        icon={faStar}
        theme={{
          accentBar: "bg-rose-500",
          iconBg: "bg-rose-50",
          iconColor: "text-rose-600",
          iconBorder: "border-rose-100",
        }}
        loading={loading}
        isTextValue={true}
      />
    </section>
  );
}
