import { 
  faChartLine, 
  faCircleCheck, 
  faCoins, 
  faUsers 
} from "@fortawesome/free-solid-svg-icons";
import { StatCard } from "../../../../components/management/StatCard";
import { formatCurrency, formatCount } from "../shared/SuperAdminUtils";

interface SuperAdminStatsProps {
  stats: {
    usersTotal: number;
    usersActive: number;
    programsTotal: number;
    articlesTotal: number;
    donationsPaid: number;
  };
  loading: boolean;
}

export function SuperAdminStats({ stats, loading }: SuperAdminStatsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
      <StatCard
        title="Total Pengguna"
        value={formatCount(stats.usersTotal)}
        icon={faUsers}
        loading={loading}
        tone="emerald"
      />
      <StatCard
        title="Pengguna Aktif"
        value={formatCount(stats.usersActive)}
        icon={faCircleCheck}
        loading={loading}
        tone="sky"
      />
      <StatCard
        title="Konten Sistem"
        value={
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl">{formatCount(stats.programsTotal)} <span className="text-lg font-medium opacity-80">Program</span></span>
            <span className="text-2xl">{formatCount(stats.articlesTotal)} <span className="text-lg font-medium opacity-80">Artikel</span></span>
          </div>
        }
        icon={faChartLine}
        loading={loading}
        tone="emerald"
      />
      <StatCard
        title="Donasi Lunas"
        value={formatCurrency(stats.donationsPaid)}
        icon={faCoins}
        loading={loading}
        tone="violet"
      />
    </div>
  );
}
