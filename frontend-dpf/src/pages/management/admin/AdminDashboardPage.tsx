import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faBolt,
  faBuildingColumns,
  faChartLine,
  faCircleCheck,
  faCircleInfo,
  faClipboardCheck,
  faClock,
  faGear,
  faHandHoldingHeart,
  faHeadset,
  faListCheck,
  faReceipt,
  faRotateRight,
  faTruckRampBox,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";

type AdminDashboardStats = {
  donations_paid?: number;
  monthly_donations?: number;
  pickup_pending?: number;
  consultation_new?: number;
};

type AdminDonationItem = {
  id?: number;
  donor_name?: string | null;
  amount?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  program?: { title?: string | null } | null;
};

type AdminDashboardPayload = {
  stats?: AdminDashboardStats;
  recent_donations?: AdminDonationItem[];
};

type ToneKey = "emerald" | "primary" | "amber" | "violet" | "sky" | "rose" | "slate";

const TONE_STYLES: Record<
  ToneKey,
  {
    border: string;
    accent: string;
    iconBg: string;
    iconText: string;
    badge: string;
  }
> = {
  emerald: {
    border: "border-l-emerald-600",
    accent: "#059669",
    iconBg: "bg-emerald-600",
    iconText: "text-white",
    badge: "bg-emerald-600 text-white",
  },
  primary: {
    border: "border-l-primary-600",
    accent: "#f97316",
    iconBg: "bg-primary-600",
    iconText: "text-white",
    badge: "bg-primary-600 text-white",
  },
  amber: {
    border: "border-l-amber-500",
    accent: "#f59e0b",
    iconBg: "bg-amber-500",
    iconText: "text-white",
    badge: "bg-amber-500 text-white",
  },
  violet: {
    border: "border-l-violet-600",
    accent: "#7c3aed",
    iconBg: "bg-violet-600",
    iconText: "text-white",
    badge: "bg-violet-600 text-white",
  },
  sky: {
    border: "border-l-sky-600",
    accent: "#0284c7",
    iconBg: "bg-sky-600",
    iconText: "text-white",
    badge: "bg-sky-600 text-white",
  },
  rose: {
    border: "border-l-rose-600",
    accent: "#e11d48",
    iconBg: "bg-rose-600",
    iconText: "text-white",
    badge: "bg-rose-600 text-white",
  },
  slate: {
    border: "border-l-slate-700",
    accent: "#334155",
    iconBg: "bg-slate-700",
    iconText: "text-white",
    badge: "bg-slate-700 text-white",
  },
};

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

function StatCard({
  title,
  value,
  icon,
  tone,
  loading,
  helper,
}: {
  title: string;
  value: string;
  icon: any;
  tone: ToneKey;
  loading: boolean;
  helper?: string;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <div
      className="rounded-[24px] border border-slate-200 border-l-4 bg-white p-5 shadow-sm"
      style={{ borderLeftColor: styles.accent }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <p className={`mt-2 text-2xl font-bold ${loading ? "text-slate-300" : "text-slate-900"}`}>{value}</p>
          {helper ? <p className="mt-1 text-xs font-semibold text-slate-500">{helper}</p> : null}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}>
          <FontAwesomeIcon icon={icon} className={`text-lg ${styles.iconText}`} />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  tone,
  onClick,
}: {
  title: string;
  description: string;
  icon: any;
  tone: ToneKey;
  onClick: () => void;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 border-l-4 ${styles.border} bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300`}
    >
      <span className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${styles.iconBg}`}>
          <FontAwesomeIcon icon={icon} className={styles.iconText} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-900">{title}</span>
          <span className="mt-0.5 block text-xs font-semibold text-slate-500">{description}</span>
        </span>
      </span>
      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs text-slate-400 transition group-hover:text-slate-600" />
    </button>
  );
}

function FocusItem({
  title,
  value,
  description,
  tone,
  onClick,
}: {
  title: string;
  value: string;
  description: string;
  tone: ToneKey;
  onClick: () => void;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 border-l-4 ${styles.border} bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{description}</p>
      </div>
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${styles.badge}`}>{value}</span>
    </button>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const [data, setData] = useState<AdminDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get<AdminDashboardPayload>("/admin/dashboard");
      if (!isMounted.current) return;
      setData(res.data);
    } catch {
      if (!isMounted.current) return;
      setError("Gagal memuat data dashboard admin.");
    } finally {
      if (!isMounted.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    void load();
  }, []);

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
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Coba lagi
            </button>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaksi</p>
                <h2 className="font-heading text-xl font-semibold text-slate-900">Donasi Terbaru</h2>
                <p className="text-sm font-medium text-slate-600">10 transaksi terakhir yang masuk ke sistem.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/donations")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
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
                      className={`flex w-full flex-col gap-3 rounded-2xl border border-slate-200 border-l-4 ${status.border} bg-white p-4 text-left shadow-sm transition hover:border-slate-300`}
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
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Aksi</p>
                <h2 className="font-heading text-xl font-semibold text-slate-900">Aksi Cepat</h2>
                <p className="text-sm font-medium text-slate-600">Akses cepat menu yang sering dipakai.</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${TONE_STYLES.sky.iconBg}`}>
                <FontAwesomeIcon icon={faBolt} className={TONE_STYLES.sky.iconText} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <QuickActionCard
                title="Donasi"
                description="Kelola transaksi donatur"
                icon={faReceipt}
                tone="emerald"
                onClick={() => navigate("/admin/donations")}
              />
              <QuickActionCard
                title="Konfirmasi Donasi"
                description="Verifikasi transfer manual"
                icon={faClipboardCheck}
                tone="amber"
                onClick={() => navigate("/admin/donation-confirmations")}
              />
              <QuickActionCard
                title="Jemput Wakaf"
                description="Permintaan layanan jemput"
                icon={faTruckRampBox}
                tone="sky"
                onClick={() => navigate("/admin/pickup-requests")}
              />
              <QuickActionCard
                title="Konsultasi"
                description="Pertanyaan masuk"
                icon={faHeadset}
                tone="violet"
                onClick={() => navigate("/admin/consultations")}
              />
              <QuickActionCard
                title="Tugas Editor"
                description="Instruksi untuk editor"
                icon={faListCheck}
                tone="slate"
                onClick={() => navigate("/admin/editor-tasks")}
              />
              <QuickActionCard
                title="Rekening"
                description="Kelola rekening resmi"
                icon={faBuildingColumns}
                tone="primary"
                onClick={() => navigate("/admin/bank-accounts")}
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Fokus Hari Ini</p>
                <h2 className="font-heading text-xl font-semibold text-slate-900">Prioritas Operasional</h2>
                <p className="text-sm font-medium text-slate-600">Area yang butuh perhatian cepat.</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${TONE_STYLES.amber.iconBg}`}>
                <FontAwesomeIcon icon={faGear} className={TONE_STYLES.amber.iconText} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <FocusItem
                title="Jemput Wakaf Baru"
                value={loading ? "-" : formatCount(stats.pickupPending)}
                description="Jadwalkan petugas jemput."
                tone="amber"
                onClick={() => navigate("/admin/pickup-requests")}
              />
              <FocusItem
                title="Konsultasi Baru"
                value={loading ? "-" : formatCount(stats.consultationNew)}
                description="Balas pertanyaan masuk."
                tone="violet"
                onClick={() => navigate("/admin/consultations")}
              />
              <FocusItem
                title="Konfirmasi Donasi"
                value="Perlu cek"
                description="Verifikasi transfer manual."
                tone="emerald"
                onClick={() => navigate("/admin/donation-confirmations")}
              />
              <FocusItem
                title="Tugas Editor"
                value="Pantau"
                description="Pastikan progres tugas."
                tone="slate"
                onClick={() => navigate("/admin/editor-tasks")}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
