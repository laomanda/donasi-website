import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconDefinition;
  color: "teal" | "violet" | "rose" | "sky";
  loading?: boolean;
}

function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  const themes = {
    teal: "from-emerald-600 to-teal-700",
    violet: "from-violet-600 to-indigo-700",
    rose: "from-rose-600 to-pink-700",
    sky: "from-sky-600 to-blue-700",
  };

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[32px] bg-gradient-to-br p-6 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] md:p-8",
        themes[color],
      ].join(" ")}
    >
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/5 blur-xl" />

      <div className="relative z-10 space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/30">
          <FontAwesomeIcon icon={icon} className="text-xl text-white shadow-sm" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/70">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-3/4 animate-pulse rounded-lg bg-white/20" />
          ) : (
            <p className="mt-1 text-2xl font-black text-white md:text-3xl">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface MitraStatCardsProps {
  stats: {
    total_donations: string | number;
    total_allocations: string | number;
    remaining_balance: string | number;
    donation_count: string | number;
  };
  icons: Record<string, IconDefinition>;
  t: (key: string, fallback?: string) => string;
  loading?: boolean;
}

export function MitraStatCards({ stats, icons, t, loading }: MitraStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
      <StatCard
        label={t("stats.total_donations", "Total Donasi")}
        value={stats.total_donations}
        icon={icons.faHeartPulse}
        color="teal"
        loading={loading}
      />
      <StatCard
        label={t("stats.total_allocations", "Total Alokasi")}
        value={stats.total_allocations}
        icon={icons.faHandshake}
        color="violet"
        loading={loading}
      />
      <StatCard
        label={t("stats.remaining_balance", "Sisa Saldo")}
        value={stats.remaining_balance}
        icon={icons.faCoins}
        color="rose"
        loading={loading}
      />
      <StatCard
        label={t("stats.donation_count", "Jumlah Donasi")}
        value={stats.donation_count}
        icon={icons.faFileContract}
        color="sky"
        loading={loading}
      />
    </div>
  );
}
