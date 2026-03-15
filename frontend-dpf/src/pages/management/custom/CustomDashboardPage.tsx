import { useMemo } from "react";
import { getAuthUser } from "../../../lib/auth";
import type { StoredUser } from "../../../components/management/dashboard/DashboardUtils";
import { QUICK_ACTIONS, resolveUserPermissions } from "../../../components/management/dashboard/DashboardUtils";
import QuickActionCard from "../../../components/management/shared/QuickActionCard";
import { StatCard } from "../../../components/management/StatCard";
import { useAdminDashboard } from "../../../hooks/useAdminDashboard";
import { formatCurrency, formatCount, normalizeNumber } from "../../../components/management/superadmin/shared/SuperAdminUtils";
import { 
  faCoins, 
  faTruckRampBox, 
  faHeadset, 
  faHeart,
  faBookOpen,
  faUsers,
  faImage,
  faCommentDots,
  faBuildingColumns,
  faSitemap,
  faHandshake,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

export function CustomDashboardPage() {
  const user = getAuthUser() as StoredUser;
  const permissions = useMemo(() => resolveUserPermissions(user), [user]);
  const permissionSet = new Set(permissions);

  // Conditional Data Fetching
  const hasAdminPerms = permissionSet.has("manage donations") || 
                        permissionSet.has("manage pickup_requests") || 
                        permissionSet.has("manage consultations") ||
                        permissionSet.has("manage users") ||
                        permissionSet.has("manage roles") ||
                        permissionSet.has("manage articles") ||
                        permissionSet.has("manage programs");

  const adminDashboard = useAdminDashboard();

  const isLoading = hasAdminPerms && adminDashboard.loading;

  const stats = useMemo(() => {
    const aData = adminDashboard.data?.stats ?? {
      donations_paid: 0,
      donations_confirmed_count: 0,
      pickup_success: 0,
      consultation_replied: 0,
      programs: 0,
      articles_total: 0,
      banners_total: 0,
      suggestions_replied: 0,
      bank_accounts_total: 0,
      organization_total: 0,
      partners_total: 0,
      users_total: 0,
    };

    const baseStats = [
      {
        id: "donations",
        permission: "manage donations",
        title: "Total Donasi Lunas",
        value: formatCurrency(normalizeNumber(aData.donations_paid)),
        icon: faCoins,
      },
      {
        id: "donations_confirmed",
        permission: "manage donations",
        title: "Konfirmasi Lunas",
        value: formatCount(normalizeNumber(aData.donations_confirmed_count)),
        icon: faCheckCircle,
      },
      {
        id: "pickup",
        permission: "manage pickup_requests",
        title: "Jemput Wakaf Sukses",
        value: formatCount(normalizeNumber(aData.pickup_success)),
        icon: faTruckRampBox,
      },
      {
        id: "consultation",
        permission: "manage consultations",
        title: "Konsultasi Dibalas",
        value: formatCount(normalizeNumber(aData.consultation_replied)),
        icon: faHeadset,
      },
      {
        id: "programs",
        permission: "manage programs",
        title: "Total Program",
        value: formatCount(normalizeNumber(aData.programs)),
        icon: faHeart,
      },
      {
        id: "articles",
        permission: "manage articles",
        title: "Total Artikel",
        value: formatCount(normalizeNumber(aData.articles_total)),
        icon: faBookOpen,
      },
      {
        id: "banners",
        permission: "manage banners",
        title: "Total Banner",
        value: formatCount(normalizeNumber(aData.banners_total)),
        icon: faImage,
      },
      {
        id: "suggestions",
        permission: "manage suggestions",
        title: "Saran Dibalas",
        value: formatCount(normalizeNumber(aData.suggestions_replied)),
        icon: faCommentDots,
      },
      {
        id: "bank",
        permission: "manage bank_accounts",
        title: "Rekening Bank",
        value: formatCount(normalizeNumber(aData.bank_accounts_total)),
        icon: faBuildingColumns,
      },
      {
        id: "organization",
        permission: "manage organization",
        title: "Anggota Organisasi",
        value: formatCount(normalizeNumber(aData.organization_total)),
        icon: faSitemap,
      },
      {
        id: "partners",
        permission: "manage partners",
        title: "Total Mitra",
        value: formatCount(normalizeNumber(aData.partners_total)),
        icon: faHandshake,
      },
      {
        id: "users",
        permission: "manage users",
        title: "Total Pengguna",
        value: formatCount(normalizeNumber(aData.users_total)),
        icon: faUsers,
      },
    ];

    const DISTINCT_TONES_STATS: any[] = [
      "emerald", "violet", "orange", "sky", "fuchsia", "teal", "indigo", 
      "primary", "cyan", "rose", "blue", "lime", "pink", "slate", "amber", "purple"
    ];

    return baseStats
      .filter((s) => permissionSet.has(s.permission))
      .map((stat, idx) => ({ ...stat, tone: DISTINCT_TONES_STATS[idx % DISTINCT_TONES_STATS.length] }));
  }, [adminDashboard.data, permissionSet]);

  const availableActions = useMemo(() => {
    const DISTINCT_TONES_ACTIONS: any[] = [
      "primary", "violet", "emerald", "amber", "sky", "rose", "slate", 
      "fuchsia", "teal", "indigo", "orange", "pink", "cyan", "blue", "lime", "purple"
    ];

    return QUICK_ACTIONS.filter(
      (action) => action.permission && permissionSet.has(action.permission)
    ).map((action, idx) => ({
      ...action,
      tone: DISTINCT_TONES_ACTIONS[idx % DISTINCT_TONES_ACTIONS.length]
    }));
  }, [permissions, permissionSet]);

  return (
    <div className="animate-fade-in space-y-12 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-1 text-left">
        <h1 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
          Pusat Kendali Portal
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Ringkasan data dan akses cepat modul manajemen Anda.
        </p>
      </div>

      {/* Statistics Row */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              tone={stat.tone}
              loading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-heading text-xl font-bold text-slate-900">
            Modul Akses Cepat
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {availableActions.length} Akses Tersedia
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {availableActions.length > 0 ? (
            availableActions.map((action, idx) => (
              <QuickActionCard key={idx} action={action} tone={action.tone} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 p-20 text-center">
               <h3 className="text-xl font-bold text-slate-900">Belum Ada Akses</h3>
               <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
                 Hubungi Superadmin untuk mengaktifkan permission pada role Anda agar dapat menggunakan modul manajemen.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
