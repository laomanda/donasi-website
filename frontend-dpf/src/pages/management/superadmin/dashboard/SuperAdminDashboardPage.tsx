import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { useSuperAdminDashboard } from "../../../../hooks/useSuperAdminDashboard";
import type { TopProgram } from "../../../../types/dashboard";

// Shared Utils & Components
import { normalizeNumber } from "../../../../components/management/superadmin/shared/SuperAdminUtils";

// SuperAdmin Dashboard Components
import { SuperAdminHeader } from "../../../../components/management/superadmin/dashboard/SuperAdminHeader";
import { SuperAdminStats } from "../../../../components/management/superadmin/dashboard/SuperAdminStats";
import { WeeklyActivityChart } from "../../../../components/management/superadmin/dashboard/WeeklyActivityChart";
import { UserCompositionChart } from "../../../../components/management/superadmin/dashboard/UserCompositionChart";
import { TopProgramsChart } from "../../../../components/management/superadmin/dashboard/TopProgramsChart";
import { TopProgramsTable } from "../../../../components/management/superadmin/dashboard/TopProgramsTable";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

export function SuperAdminDashboardPage() {
  const { data, loading, error } = useSuperAdminDashboard();

  const stats = useMemo(() => {
    const raw = data?.stats ?? {};
    return {
      usersTotal: normalizeNumber(raw.users_total),
      usersActive: normalizeNumber(raw.users_active),
      usersInactive: normalizeNumber(raw.users_inactive),
      programsTotal: normalizeNumber(raw.programs_total),
      articlesTotal: normalizeNumber(raw.articles_total),
      donationsPaid: normalizeNumber(raw.donations_paid),
      donationsPending: normalizeNumber(raw.donations_pending),
    };
  }, [data]);

  const topPrograms = useMemo(() => {
    const list = Array.isArray(data?.top_programs) ? data?.top_programs : [];
    return list.filter((p) => p && typeof p === "object" && typeof (p as any).id === "number") as TopProgram[];
  }, [data]);

  return (
    <div className="dashboard-shell min-h-screen">
      <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 p-4 md:p-8 pb-10">
        
        {/* Header Section */}
        <SuperAdminHeader />

        {/* Error State */}
        {error ? (
          <div className="rounded-[24px] border border-red-100 bg-red-50 p-6 flex items-center gap-4 text-red-700 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <FontAwesomeIcon icon={faChartLine} className="rotate-180" />
            </div>
            <p className="font-bold">{error}</p>
          </div>
        ) : null}

        {/* Core Stats Cards */}
        <SuperAdminStats stats={stats} loading={loading} />

        {/* Activity & Composition Charts */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <WeeklyActivityChart stats={stats} />
          </div>
          <div className="lg:col-span-4">
            <UserCompositionChart stats={stats} />
          </div>
        </div>

        {/* Programs Analysis Chart & Table */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <TopProgramsChart topPrograms={topPrograms} />
          </div>
          <div className="lg:col-span-8">
            <TopProgramsTable topPrograms={topPrograms} loading={loading} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default SuperAdminDashboardPage;
