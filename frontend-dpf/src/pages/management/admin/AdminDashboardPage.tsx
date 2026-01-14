import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faArrowUpRightFromSquare,
  faBolt,
  faChartLine,
  faCircleCheck,
  faCircleInfo,
  faClock,
  faGear,
  faHandHoldingHeart,
  faHandshake,
  faHeartPulse,
  faLayerGroup,
  faReceipt,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";

type AdminDashboardStats = {
  programs?: number;
  active_programs?: number;
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
  highlight_programs?: unknown;
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

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

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
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      ring: "ring-emerald-200",
      icon: faCircleCheck,
    };
  }
  if (normalized === "pending") {
    return {
      bg: "bg-amber-100",
      text: "text-amber-700",
      ring: "ring-amber-200",
      icon: faClock,
    };
  }
  if (normalized === "failed" || normalized === "expire" || normalized === "expired") {
    return {
      bg: "bg-red-100",
      text: "text-red-700",
      ring: "ring-red-200",
      icon: faCircleInfo,
    };
  }
  return {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    icon: faCircleInfo,
  };
};

function StatCard({
  title,
  value,
  icon,
  tone,
  loading,
}: {
  title: string;
  value: string;
  icon: any;
  tone: { bg: string; border: string; iconBg: string; iconText: string };
  loading: boolean;
}) {
  return (
    <div className={`rounded-[28px] border ${tone.border} ${tone.bg} p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide text-slate-600">{title}</p>
          <p
            className={[
              "font-heading text-3xl font-bold tracking-tight",
              loading ? "text-slate-300" : "text-slate-900",
            ].join(" ")}
          >
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${tone.iconBg}`}
          aria-hidden="true"
        >
          <FontAwesomeIcon icon={icon} className={tone.iconText} />
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const stats = useMemo(() => {
    const raw = data?.stats ?? {};
    return {
      programs: normalizeNumber(raw.programs),
      activePrograms: normalizeNumber(raw.active_programs),
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

  const load = () => {
    setLoading(true);
    setError(null);
    http
      .get<AdminDashboardPayload>("/admin/dashboard")
      .then((res) => {
        setData(res.data);
        setLastUpdatedAt(new Date());
      })
      .catch(() => setError("Gagal memuat data dashboard admin."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    http
      .get<AdminDashboardPayload>("/admin/dashboard")
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setError(null);
        setLastUpdatedAt(new Date());
      })
      .catch(() => {
        if (!active) return;
        setError("Gagal memuat data dashboard admin.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              <span className="h-2 w-2 rounded-full bg-primary-600" />
              Panel admin
            </span>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Statistik Operasional
              </h1>
              <p className="text-sm font-medium text-slate-600">
                Ringkasan performa donasi, program, dan layanan terbaru hari ini.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                <span className="h-2 w-2 rounded-full bg-brandGreen-500" />
                {lastUpdatedAt ? `Terakhir diperbarui Jam ${formatTime(lastUpdatedAt)}` : "Terakhir diperbarui -"}
              </span>
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
              >
                <FontAwesomeIcon icon={faRotateRight} />
              Muat ulang
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/donations")}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
              >
                <FontAwesomeIcon icon={faReceipt} />
                Kelola donasi
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/programs")}
                className="inline-flex items-center gap-2 rounded-2xl border border-brandGreen-200 bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-brandGreen-500 hover:text-white"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                Kelola program
              </button>
            </div>
          </div>
        </header>
      </div>

      {error ? (
        <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 bg-red-100 text-red-700">
                <FontAwesomeIcon icon={faCircleInfo} />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-slate-900">Data belum bisa dimuat</p>
                <p className="text-sm font-medium text-slate-600">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Coba lagi
            </button>
          </div>
        </div>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold text-slate-900">Ringkasan Utama</h2>
            <p className="text-sm font-medium text-slate-600">
              Angka penting untuk memantau operasional dan layanan.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Donasi Lunas"
            value={loading ? "-" : formatCurrency(stats.donationsPaid)}
            icon={faChartLine}
            loading={loading}
            tone={{
              bg: "bg-emerald-50",
              border: "border-emerald-100",
              iconBg: "border-emerald-100 bg-white",
              iconText: "text-emerald-700",
            }}
          />
          <StatCard
            title="Donasi Bulan Ini"
            value={loading ? "-" : formatCurrency(stats.monthlyDonations)}
            icon={faBolt}
            loading={loading}
            tone={{
              bg: "bg-primary-50",
              border: "border-primary-100",
              iconBg: "border-primary-100 bg-white",
              iconText: "text-primary-700",
            }}
          />
          <StatCard
            title="Total Program"
            value={loading ? "-" : formatCount(stats.programs)}
            icon={faLayerGroup}
            loading={loading}
            tone={{
              bg: "bg-blue-50",
              border: "border-blue-100",
              iconBg: "border-blue-100 bg-white",
              iconText: "text-blue-700",
            }}
          />
          <StatCard
            title="Program Aktif"
            value={loading ? "-" : formatCount(stats.activePrograms)}
            icon={faHeartPulse}
            loading={loading}
            tone={{
              bg: "bg-brandGreen-50",
              border: "border-brandGreen-100",
              iconBg: "border-brandGreen-100 bg-white",
              iconText: "text-brandGreen-700",
            }}
          />
          <StatCard
            title="Jemput Wakaf Baru"
            value={loading ? "-" : formatCount(stats.pickupPending)}
            icon={faHandHoldingHeart}
            loading={loading}
            tone={{
              bg: "bg-amber-50",
              border: "border-amber-100",
              iconBg: "border-amber-100 bg-white",
              iconText: "text-amber-700",
            }}
          />
          <StatCard
            title="Konsultasi Baru"
            value={loading ? "-" : formatCount(stats.consultationNew)}
            icon={faClock}
            loading={loading}
            tone={{
              bg: "bg-violet-50",
              border: "border-violet-100",
              iconBg: "border-violet-100 bg-white",
              iconText: "text-violet-700",
            }}
          />
        </div>
      </section>

      <section className="grid gap-6">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-semibold text-slate-900">Donasi Terbaru</h2>
              <p className="text-sm font-medium text-slate-600">
                10 transaksi terakhir yang tercatat di sistem.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/donations")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
            >
              Lihat semua
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-3 text-xs font-semibold text-slate-700">Program</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-700">Donatur</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-slate-700">Nominal</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-700">Status</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-700">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="px-3 py-4">
                        <div className="h-4 w-44 rounded-full bg-slate-100" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-4 w-32 rounded-full bg-slate-100" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-4 w-28 rounded-full bg-slate-100" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-7 w-24 rounded-full bg-slate-100" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-4 w-28 rounded-full bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : recentDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-sm font-medium text-slate-600">
                      Belum ada donasi terbaru.
                    </td>
                  </tr>
                ) : (
                  recentDonations.map((item, idx) => {
                    const programTitle = String(item.program?.title ?? "").trim() || "Tanpa program";
                    const donor = String(item.donor_name ?? "").trim() || "Anonim";
                    const amount = normalizeNumber(item.amount);
                    const statusValue = String(item.status ?? "").trim() || "-";
                    const status = getDonationStatusStyles(statusValue);
                    return (
                      <tr key={String(item.id ?? idx)} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-4 text-sm font-semibold text-slate-900">
                          <span className="block max-w-[18rem] truncate">{programTitle}</span>
                          {item.id !== undefined ? (
                            <span className="mt-1 block text-xs font-semibold text-slate-500">ID: {item.id}</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-slate-700">
                          <span className="block max-w-[14rem] truncate">{donor}</span>
                        </td>
                        <td className="px-3 py-4 text-right text-sm font-semibold text-slate-900">
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-full ${status.bg} px-3 py-1 text-xs font-semibold ${status.text} ring-1 ${status.ring}`}>
                            <FontAwesomeIcon icon={status.icon} className="text-[12px]" />
                            {getDonationStatusLabel(statusValue)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-slate-600">
                          {formatDateTime(item.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

          <div className="grid gap-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-heading text-xl font-semibold text-slate-900">Aksi Cepat</h2>
                  <p className="text-sm font-medium text-slate-600">
                    Shortcut ke menu utama untuk mempercepat operasional.
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-700">
                  <FontAwesomeIcon icon={faBolt} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <button
                  type="button"
                  onClick={() => navigate("/admin/donations")}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brandGreen-200 hover:bg-brandGreen-100"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-700">
                      <FontAwesomeIcon icon={faReceipt} />
                    </span>
                    Donasi
                  </span>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/programs")}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brandGreen-200 hover:bg-brandGreen-100"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brandGreen-100 bg-brandGreen-50 text-brandGreen-700">
                      <FontAwesomeIcon icon={faHeartPulse} />
                    </span>
                    Program
                  </span>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/articles")}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brandGreen-200 hover:bg-brandGreen-100"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                      <FontAwesomeIcon icon={faBookOpen} />
                    </span>
                    Artikel
                  </span>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/partners")}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brandGreen-200 hover:bg-brandGreen-100"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700">
                      <FontAwesomeIcon icon={faHandshake} />
                    </span>
                    Mitra
                  </span>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/settings")}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brandGreen-200 hover:bg-brandGreen-100"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-700">
                      <FontAwesomeIcon icon={faGear} />
                    </span>
                    Pengaturan
                  </span>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;

