import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

function InternalStatCard({
  title,
  value,
  subValue,
  icon,
  bgColor,
  loading,
  iconBg,
}: {
  title: string;
  value: string;
  subValue: string;
  icon: any;
  bgColor: string;
  loading: boolean;
  iconBg?: string;
}) {
  const getFontSize = (text: string) => {
    if (text.length > 20) return "text-xl md:text-2xl"; 
    if (text.length > 13) return "text-2xl md:text-3xl";
    return "text-3xl md:text-4xl";
  };

  const fontSizeClass = getFontSize(value);

  return (
    <div className={`relative overflow-hidden rounded-[32px] ${bgColor} p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
      <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 rounded-full bg-black/5 blur-xl" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">{title}</p>
          <div className={`font-heading font-bold text-white shadow-sm ${fontSizeClass}`}>
            {loading ? <div className="h-8 w-24 animate-pulse rounded-lg bg-white/20" /> : value}
          </div>
          <p className="text-sm font-medium text-white/80">{subValue}</p>
        </div>
        
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white backdrop-blur-sm shadow-inner ring-1 ring-white/30 ${iconBg || "bg-white/20"}`}>
          <FontAwesomeIcon icon={icon} className="text-2xl" />
        </div>
      </div>
    </div>
  );
}

export function DonationReportStats({ summary, loading, formatCurrency, formatCount }: DonationReportStatsProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <InternalStatCard
        title="Total Transaksi"
        value={loading ? "-" : formatCount(summary?.total_count)}
        subValue="Semua donasi berhasil"
        icon={faReceipt}
        bgColor="bg-emerald-600"
        loading={loading}
      />

      <InternalStatCard
        title="Total Nominal"
        value={loading ? "-" : formatCurrency(summary?.total_amount ?? 0)}
        subValue="Akumulasi dana terkumpul"
        icon={faCoins}
        bgColor="bg-brandBlueTeal-500"
        loading={loading}
      />

      <InternalStatCard
        title="Total Donasi Manual"
        value={loading ? "-" : formatCurrency(summary?.manual_amount ?? 0)}
        subValue={loading ? "-" : `${formatCount(summary?.manual_count)} transaksi`}
        icon={faHandHoldingDollar}
        bgColor="bg-brandWarmOrange-500"
        loading={loading}
      />

      <InternalStatCard
        title="Midtrans (Auto)"
        value={loading ? "-" : formatCurrency(summary?.midtrans_amount ?? 0)}
        subValue={loading ? "-" : `${formatCount(summary?.midtrans_count)} transaksi`}
        icon={faCreditCard}
        bgColor="bg-indigo-600"
        loading={loading}
      />

      <InternalStatCard
        title="Top Donatur"
        value={loading ? "-" : (summary?.top_donor?.donor_name || "-")}
        subValue={loading ? "-" : `Total: ${formatCurrency(summary?.top_donor?.total_amount)}`}
        icon={faCrown}
        bgColor="bg-primary-600"
        loading={loading}
      />

      <InternalStatCard
        title="Program Unggulan"
        value={loading ? "-" : (summary?.top_program?.program_title || "-")}
        subValue={loading ? "-" : `Terkumpul: ${formatCurrency(summary?.top_program?.total_amount)}`}
        icon={faStar}
        bgColor="bg-rose-600"
        loading={loading}
      />
    </section>
  );
}
