import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowTrendUp,
  faCheckCircle,
  faCircleCheck,
  faCircleInfo,
  faClock,
  faHandHoldingDollar,
  faHandshake,
  faReceipt,
  faRotateRight,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminDashboard } from "../../../hooks/useAdminDashboard";
import { StatCard, TONE_STYLES } from "../../../components/management/StatCard";

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

const getDonationStatusStyles = (status: string) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "paid" || normalized === "success") {
    return {
      badge: TONE_STYLES.emerald.badge,
      border: TONE_STYLES.emerald.border,
      icon: faCircleCheck,
      label: "Lunas",
    };
  }
  if (normalized === "pending") {
    return {
      badge: TONE_STYLES.amber.badge,
      border: TONE_STYLES.amber.border,
      icon: faClock,
      label: "Menunggu",
    };
  }
  return {
    badge: TONE_STYLES.rose.badge,
    border: TONE_STYLES.rose.border,
    icon: faCircleInfo,
    label: "Gagal",
  };
};

export function KeuanganDashboardPage() {
  const { data, loading, error, reload } = useAdminDashboard();

  const stats = useMemo(() => {
    const raw = data?.stats ?? {};
    return {
      donationsPaid: normalizeNumber(raw.donations_paid),
      donationsPaidCount: normalizeNumber(raw.donations_confirmed_count),
      monthlyDonations: normalizeNumber(raw.monthly_donations),
      allocationsTotal: normalizeNumber(raw.allocations_total),
      availableBalance: normalizeNumber(raw.available_balance),
      donationsPendingCount: normalizeNumber(raw.donations_pending_count),
      donationsPendingAmount: normalizeNumber(raw.donations_pending_amount),
      bankAccountsTotal: normalizeNumber(raw.bank_accounts_total),
    };
  }, [data]);

  const recentDonations = useMemo(() => {
    const list = Array.isArray(data?.recent_donations) ? data?.recent_donations : [];
    return (list ?? []).slice(0, 8);
  }, [data]);

  const recentAllocations = useMemo(() => {
    const list = Array.isArray(data?.recent_allocations) ? data?.recent_allocations : [];
    return (list ?? []).slice(0, 8);
  }, [data]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header Banner */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Dashboard Keuangan & Arus Kas
              </h1>
              <p className="text-sm font-medium text-slate-600">
                Pantau arus masuk donasi (Cash In), realisasi penyaluran (Cash Out), dan rekonsiliasi kas yayasan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/keuangan/donation-confirmations"
              className="inline-flex items-center gap-2 rounded-2xl bg-brandGreen-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brandGreen-600 active:scale-95"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              Konfirmasi Donasi
            </Link>
            <Link
              to="/keuangan/allocations/create"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
            >
              <FontAwesomeIcon icon={faHandshake} />
              Penyaluran Baru
            </Link>
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {error ? (
        <div className="rounded-[28px] border border-rose-500 bg-rose-600 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-600">
                <FontAwesomeIcon icon={faCircleInfo} />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold">Gagal memuat data keuangan</p>
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

      {/* 4 Financial Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Kas Masuk (Donasi Lunas)"
          value={formatCurrency(stats.donationsPaid)}
          helper={`${formatCount(stats.donationsPaidCount)} transaksi berhasil`}
          icon={faWallet}
          tone="emerald"
          loading={loading}
        />
        <StatCard
          title="Total Penyaluran (Cash Out)"
          value={formatCurrency(stats.allocationsTotal)}
          helper="Tersalurkan ke program & mitra"
          icon={faHandHoldingDollar}
          tone="blue"
          loading={loading}
        />
        <StatCard
          title="Sisa Saldo Kas Siap Salur"
          value={formatCurrency(stats.availableBalance)}
          helper="Selisih kas masuk - penyaluran"
          icon={faArrowTrendUp}
          tone="teal"
          loading={loading}
        />
        <StatCard
          title="Donasi Menunggu Konfirmasi"
          value={`${formatCount(stats.donationsPendingCount)} Menunggu`}
          helper={stats.donationsPendingAmount > 0 ? formatCurrency(stats.donationsPendingAmount) : "Tidak ada antrean"}
          icon={faClock}
          tone="amber"
          loading={loading}
        />
      </div>

      {/* Main Content Grid: Recent Inflows & Recent Outflows */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Donations (Cash In) */}
        <div className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-heading text-lg font-bold text-slate-900">Donasi Masuk Terakhir</h2>
              <p className="text-xs text-slate-500">Transaksi donasi publik & offline terbaru</p>
            </div>
            <Link
              to="/keuangan/donations"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brandGreen-200 bg-brandGreen-50 px-3 py-1.5 text-xs font-semibold text-brandGreen-700 transition-all duration-200 hover:bg-brandGreen-500 hover:text-white hover:border-brandGreen-500 hover:shadow-sm"
            >
              <span>Lihat Semua</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : recentDonations.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <FontAwesomeIcon icon={faReceipt} className="text-3xl text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum ada donasi masuk</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDonations.map((item: any) => {
                  const statusStyle = getDonationStatusStyles(item.status);
                  return (
                    <div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 pr-3">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {item.donor_name || "Hamba Allah"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.program?.title || "Donasi Umum"} &bull; {formatDateTime(item.created_at)}
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(normalizeNumber(item.amount))}
                        </p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle.badge}`}>
                          <FontAwesomeIcon icon={statusStyle.icon} className="text-[9px]" />
                          {statusStyle.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Allocations (Cash Out) */}
        <div className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-heading text-lg font-bold text-slate-900">Penyaluran Terakhir</h2>
              <p className="text-xs text-slate-500">Realisasi dana ke program / mustahik</p>
            </div>
            <Link
              to="/keuangan/allocations"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brandBlueTeal-500/20 bg-brandBlueTeal-100 px-3 py-1.5 text-xs font-semibold text-brandBlueTeal-500 transition-all duration-200 hover:bg-brandBlueTeal-500 hover:text-white hover:border-brandBlueTeal-500 hover:shadow-sm"
            >
              <span>Lihat Semua</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : recentAllocations.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <FontAwesomeIcon icon={faHandshake} className="text-3xl text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum ada penyaluran tercatat</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAllocations.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="min-w-0 pr-3">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.program?.title || item.description || "Penyaluran Program"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {item.user?.name ? `Mitra: ${item.user.name}` : (item.donation?.donor_name ? `Donatur: ${item.donation.donor_name}` : "Penyaluran Umum")} &bull; {formatDateTime(item.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-brandGreen-500">
                        {formatCurrency(normalizeNumber(item.amount))}
                      </p>
                      <span className="text-[11px] font-medium text-slate-500">Tersalurkan</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeuanganDashboardPage;
