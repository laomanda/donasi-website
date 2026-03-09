import { faChartLine, faClock, faHandHoldingHeart, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { StatCard } from "@/components/management/StatCard";

interface AdminDashboardStatsProps {
  loading: boolean;
  stats: {
    donationsPaid: number;
    monthlyDonations: number;
    pickupPending: number;
    consultationNew: number;
  };
  formatCurrency: (value: number) => string;
  formatCount: (value: number) => string;
}

export function AdminDashboardStats({ loading, stats, formatCurrency, formatCount }: AdminDashboardStatsProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
      <StatCard
        title="Donasi Lunas"
        value={loading ? "-" : formatCurrency(stats.donationsPaid)}
        icon={faChartLine}
        tone="emerald"
        loading={loading}
        helper="Total pembayaran berhasil"
      />
      <StatCard
        title="Donasi Bulan Ini"
        value={loading ? "-" : formatCurrency(stats.monthlyDonations)}
        icon={faReceipt}
        tone="primary"
        loading={loading}
        helper="Akumulasi periode berjalan"
      />
      <StatCard
        title="Jemput Wakaf Baru"
        value={loading ? "-" : formatCount(stats.pickupPending)}
        icon={faHandHoldingHeart}
        tone="amber"
        loading={loading}
        helper="Butuh penjadwalan"
      />
      <StatCard
        title="Konsultasi Baru"
        value={loading ? "-" : formatCount(stats.consultationNew)}
        icon={faClock}
        tone="violet"
        loading={loading}
        helper="Menunggu balasan"
      />
    </section>
  );
}

export default AdminDashboardStats;
