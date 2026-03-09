import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleInfo,
  faClock,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { TONE_STYLES } from "@/components/management/StatCard";

import AdminDashboardHeader from "@/components/management/admin/dashboard/AdminDashboardHeader";
import AdminDashboardStats from "@/components/management/admin/dashboard/AdminDashboardStats";
import AdminRecentDonations from "@/components/management/admin/dashboard/AdminRecentDonations";
import AdminUpcomingPickups from "@/components/management/admin/dashboard/AdminUpcomingPickups";
import AdminUrgentConsultations from "@/components/management/admin/dashboard/AdminUrgentConsultations";

// --- Utils & Helpers ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value);

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getDonationStatusLabel = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "paid" || normalized === "success") return "Lunas";
  if (normalized === "pending") return "Menunggu";
  if (normalized === "failed" || normalized === "expire" || normalized === "expired") return "Gagal";
  return status || "-";
};

const getDonationStatusStyles = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "paid" || normalized === "success") {
    return {
      badge: TONE_STYLES.emerald.badge,
      border: TONE_STYLES.emerald.border,
      icon: faCircleCheck,
    };
  }
  if (normalized === "pending") {
    return {
      badge: TONE_STYLES.amber.badge,
      border: TONE_STYLES.amber.border,
      icon: faClock,
    };
  }
  if (normalized === "failed" || normalized === "expire" || normalized === "expired") {
    return {
      badge: TONE_STYLES.rose.badge,
      border: TONE_STYLES.rose.border,
      icon: faCircleInfo,
    };
  }
  return {
    badge: TONE_STYLES.slate.badge,
    border: TONE_STYLES.slate.border,
    icon: faCircleInfo,
  };
};

export function AdminDashboardPage() {
  const { data, loading, error, reload } = useAdminDashboard();

  const stats = useMemo(() => {
    const raw = data?.stats ?? {};
    return {
      donationsPaid: normalizeNumber(raw.donations_paid),
      monthlyDonations: normalizeNumber(raw.monthly_donations),
      pickupPending: normalizeNumber(raw.pickup_pending),
      consultationNew: normalizeNumber(raw.consultation_new),
    };
  }, [data]);

  const recentDonations = useMemo(() => {
    const list = Array.isArray(data?.recent_donations) ? data?.recent_donations : [];
    return (list ?? []).slice(0, 10);
  }, [data]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AdminDashboardHeader />

      {error ? (
        <div className="rounded-[28px] border border-rose-500 bg-rose-600 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-600">
                <FontAwesomeIcon icon={faCircleInfo} />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold">Data belum bisa dimuat</p>
                <p className="text-sm font-medium text-white/80">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => reload()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Coba lagi
            </button>
          </div>
        </div>
      ) : null}

      <AdminDashboardStats 
        loading={loading}
        stats={stats}
        formatCurrency={formatCurrency}
        formatCount={formatCount}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <AdminRecentDonations 
            loading={loading}
            donations={recentDonations}
            getDonationStatusStyles={getDonationStatusStyles}
            getDonationStatusLabel={getDonationStatusLabel}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
            normalizeNumber={normalizeNumber}
          />
        </div>

        <div className="space-y-6">
          <AdminUpcomingPickups 
            loading={loading}
            pickups={data?.upcoming_pickups ?? []}
          />

          <AdminUrgentConsultations 
            loading={loading}
            consultations={data?.urgent_consultations ?? []}
            formatDateTime={formatDateTime}
          />
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
