import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faChartLine,
  faCircleCheck,
  faCircleInfo,
  faClipboardCheck,
  faClock,
  faComments,
  faHandHoldingHeart,
  faReceipt,
  faRotateRight,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
              Dashboard Admin
            </span>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Ringkasan Operasional
              </h1>
              <p className="text-sm font-medium text-slate-600">
                Pantau donasi, layanan, dan tugas editor secara cepat dan terukur.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/donations")}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <FontAwesomeIcon icon={faReceipt} />
                Kelola Donasi
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/donation-confirmations")}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
              >
                <FontAwesomeIcon icon={faClipboardCheck} />
                Konfirmasi Donasi
              </button>
            </div>
          </div>
        </div>
      </section>

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

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] border border-slate-200 bg-brandGreen-100/50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaksi</p>
                <h2 className="font-heading text-xl font-semibold text-slate-900">Donasi Terbaru</h2>
                <p className="text-sm font-medium text-slate-600">10 transaksi terakhir yang masuk ke sistem.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/donations")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-emerald-600 hover:text-white"
              >
                Lihat semua
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
                    <div className="mt-4 h-6 w-32 rounded-full bg-slate-200" />
                  </div>
                ))
              ) : recentDonations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
                  Belum ada donasi terbaru.
                </div>
              ) : (
                recentDonations.map((item, idx) => {
                  const programTitle = String(item.program?.title ?? "").trim() || "Tanpa program";
                  const donor = String(item.donor_name ?? "").trim() || "Anonim";
                  const amount = normalizeNumber(item.amount);
                  const statusValue = String(item.status ?? "").trim() || "-";
                  const status = getDonationStatusStyles(statusValue);
                  const onClick = item.id ? () => navigate(`/admin/donations/${item.id}`) : () => navigate("/admin/donations");
                  return (
                    <button
                      key={String(item.id ?? idx)}
                      type="button"
                      onClick={onClick}
                      className={`flex w-full flex-col gap-3 rounded-2xl border border-slate-200 border-l-4 ${status.border} bg-white p-4 text-left shadow-sm transition hover:border-emerald-500`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{programTitle}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">Donatur: {donor}</p>
                        </div>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${status.badge}`}>
                          <FontAwesomeIcon icon={status.icon} className="text-[11px]" />
                          {getDonationStatusLabel(statusValue)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-slate-700">
                          Nominal: <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                        </span>
                        <span className="text-slate-500">Waktu: {formatDateTime(item.created_at)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Agenda Jemputan Widget */}
          <div className="rounded-[28px] border border-amber-100 bg-amber-50/50 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Logistik</p>
                <h2 className="font-heading text-lg font-bold text-slate-900">Agenda Jemputan</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <FontAwesomeIcon icon={faTruckFast} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-16 rounded-2xl bg-white/60 animate-pulse" />
                ))
              ) : (data?.upcoming_pickups ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-white/40 p-4 text-center text-sm font-medium text-amber-700">
                  Tidak ada jadwal jemputan baru.
                </div>
              ) : (
                (data?.upcoming_pickups ?? []).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate("/admin/pickup-requests")}
                    className="flex w-full items-start gap-3 rounded-2xl border border-amber-100 border-l-4 border-l-amber-500 bg-white p-3 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <span className="text-xs font-bold">{item.district ? item.district.substring(0, 2).toUpperCase() : "??"}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.donor_name}</p>
                      <p className="text-xs font-medium text-slate-500">
                        {item.district || "Area belum set"} • {item.preferred_time || "Waktu fleksibel"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/pickup-requests")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-amber-500 hover:text-white"
            >
              Lihat Semua
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
            </button>
          </div>

          {/* Antrean Konsultasi Widget */}
          <div className="rounded-[28px] border border-violet-100 bg-violet-50/50 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Layanan Umat</p>
                <h2 className="font-heading text-lg font-bold text-slate-900">Antrean Konsultasi</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <FontAwesomeIcon icon={faComments} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-16 rounded-2xl bg-white/60 animate-pulse" />
                ))
              ) : (data?.urgent_consultations ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-white/40 p-4 text-center text-sm font-medium text-violet-700">
                  Tidak ada pesan belum dibalas.
                </div>
              ) : (
                (data?.urgent_consultations ?? []).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/admin/consultations/${item.id}`)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-violet-100 border-l-4 border-l-violet-600 bg-white p-3 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md"
                  >
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-500 ring-2 ring-rose-100" title="Belum dibalas" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="line-clamp-1 text-xs text-slate-500">
                        Topik: {item.topic}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-violet-600">
                        {formatDateTime(item.created_at)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/consultations")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-violet-600 hover:text-white"
            >
              Lihat Semua
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
