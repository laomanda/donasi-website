import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faReceipt,
    faArrowRight,
    faArrowTrendUp,
    faArrowTrendDown,
    faBuildingColumns,
    faCalendarAlt,
    faChevronDown,
    faScaleBalanced,
    faVault,
    faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    Filler,
    type ScriptableContext,
    type TooltipItem,
    type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
    type HomeStats,
    type PublicFinancePayload,
    formatCurrency,
    AnimatedCounter,
    calculateMoM,
} from "./LandingUI";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartTooltip,
    ChartLegend,
    Filler,
);

interface TransparencySectionProps {
    finance?: PublicFinancePayload | null;
    stats?: HomeStats | null;
    locale?: "id" | "en";
    selectedYear?: string;
    availableYears?: number[];
    onYearChange?: (year: string) => void;
    t: (key: string, fallback?: string) => string;
}

const monthNamesId = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
const monthNamesEn = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const getShortMonthLabel = (m: number, locale: "id" | "en") => {
    const list = locale === "en" ? monthNamesEn : monthNamesId;
    return list[m - 1] ?? `M${m}`;
};

export function TransparencySection({
    finance,
    stats,
    locale = "id",
    selectedYear = "all",
    availableYears,
    onYearChange,
    t,
}: TransparencySectionProps) {
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const yearDropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node)) {
                setYearDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentYear = new Date().getFullYear();
    const yearsList = useMemo(() => {
        if (availableYears && availableYears.length > 0) {
            return availableYears;
        }
        const startYear = 2020;
        const endYear = Math.max(currentYear, 2026);
        const yrs: number[] = [];
        for (let y = endYear; y >= startYear; y--) {
            yrs.push(y);
        }
        return yrs;
    }, [availableYears, currentYear]);

    // Aggregate Verified Numeric Metrics (Presentation Only, No Synthetic Calculations)
    const totalWaqfCollected = Number(finance?.total_waqf_collected ?? 0);
    const totalDistributed = Number(finance?.total_distributed ?? stats?.total_distributed ?? Number(stats?.amount_allocated ?? 0));
    const verifiedDonations = Number(finance?.verified_donations ?? stats?.verified_donations ?? stats?.total_donations ?? 0);
    const programDistributions = Number(finance?.program_distributions ?? stats?.program_distributions ?? 0);
    const totalExpense = Number(finance?.total_expense ?? stats?.total_expense ?? 0);
    const availableBalance = finance?.available_balance !== undefined ? finance.available_balance : (stats?.available_balance ?? null);
    const ywdpRatio = finance?.ywdp_ratio !== undefined ? finance.ywdp_ratio : (finance?.rowa !== undefined ? finance.rowa : (stats?.ywdp_ratio ?? stats?.rowa ?? null));
    const ywdpRatioStatus = finance?.ywdp_ratio_status ?? stats?.ywdp_ratio_status ?? "expense_base_unavailable";

    const momCollected = calculateMoM(stats?.monthly_trends, stats?.collected_mom);

    // Monthly Trend Chart Data (Sourced from canonical finance monthly_realization, fallback to stats.monthly_trends)
    const trendItems = useMemo(() => {
        if (finance?.monthly_realization && finance.monthly_realization.length > 0) {
            return finance.monthly_realization.map((item) => ({
                label: getShortMonthLabel(item.month, locale),
                collected: Number(item.total_waqf_collected ?? item.waqf_collected ?? item.collected) || 0,
                distributed: Number(item.distributed) || 0,
            }));
        }

        if (stats?.monthly_trends && stats.monthly_trends.length > 0) {
            return stats.monthly_trends.map((item) => ({
                label: item.label ? item.label.split(" ")[0] : item.month_key,
                collected: Number(item.total_waqf_collected ?? item.waqf_collected ?? item.collected) || 0,
                distributed: Number(item.allocated) || 0,
            }));
        }

        return [];
    }, [finance, stats, locale]);

    const trendLabels = useMemo(() => trendItems.map((m) => m.label), [trendItems]);

    const trendData = useMemo(() => {
        return {
            labels: trendLabels,
            datasets: [
                {
                    label:
                        locale === "en" ? "Waqf Collected" : "Wakaf Terhimpun",
                    data: trendItems.map((m) => m.collected),
                    borderColor: "#059669",
                    backgroundColor: (context: ScriptableContext<"line">) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 320);
                        gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
                        gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
                        return gradient;
                    },
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#059669",
                    pointBorderWidth: 2.5,
                    pointHoverBorderWidth: 3,
                    pointHoverBackgroundColor: "#059669",
                    pointHoverBorderColor: "#ffffff",
                    fill: true,
                },
                {
                    label:
                        locale === "en"
                            ? "Funds Distributed"
                            : "Dana Disalurkan",
                    data: trendItems.map((m) => m.distributed),
                    borderColor: "#0284c7",
                    backgroundColor: (context: ScriptableContext<"line">) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 320);
                        gradient.addColorStop(0, "rgba(14, 165, 233, 0.2)");
                        gradient.addColorStop(1, "rgba(14, 165, 233, 0.0)");
                        return gradient;
                    },
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#0284c7",
                    pointBorderWidth: 2.5,
                    pointHoverBorderWidth: 3,
                    pointHoverBackgroundColor: "#0284c7",
                    pointHoverBorderColor: "#ffffff",
                    fill: true,
                },
            ],
        };
    }, [trendItems, trendLabels, locale]);

    const trendOptions: ChartOptions<"line"> = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index" as const,
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    titleColor: "#f8fafc",
                    titleFont: { size: 13, weight: 700 },
                    bodyColor: "#f1f5f9",
                    bodyFont: { size: 12, weight: 600 },
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 14,
                    displayColors: true,
                    boxWidth: 8,
                    boxHeight: 8,
                    usePointStyle: true,
                    callbacks: {
                        title: (items: TooltipItem<"line">[]) => {
                            const idx = items[0]?.dataIndex ?? 0;
                            return trendItems[idx]?.label ?? "";
                        },
                        label: (item: TooltipItem<"line">) => {
                            const val = Number(item.raw) || 0;
                            return ` ${item.dataset.label}: ${formatCurrency(val, locale)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: "#64748b",
                        font: { size: 11, weight: 600 },
                    },
                },
                y: {
                    grid: {
                        color: "rgba(226, 232, 240, 0.6)",
                    },
                    ticks: {
                        color: "#64748b",
                        font: { size: 11, weight: 500 },
                        callback: (value: string | number) => {
                            const n = Number(value);
                            if (n >= 1_000_000_000)
                                return `${(n / 1_000_000_000).toFixed(1)}M`;
                            if (n >= 1_000_000)
                                return `${(n / 1_000_000).toFixed(0)}jt`;
                            if (n >= 1_000)
                                return `${(n / 1_000).toFixed(0)}rb`;
                            return `${n}`;
                        },
                    },
                },
            },
        };
    }, [trendItems, locale]);

    return (
        <section
            id="transparansi"
            className="relative bg-slate-50 py-16 sm:py-24"
        >
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Section Header & Year Filter Dropdown */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-slate-200/80 pb-6">
                    <div className="text-left space-y-2 max-w-2xl">
                        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                            {t("landing.transparency.title")}
                        </h2>

                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                            {t("landing.transparency.subtitle")}
                        </p>
                    </div>

                    {/* Custom Styled Year Dropdown */}
                    {onYearChange && (
                        <div ref={yearDropdownRef} className="relative w-full sm:w-auto self-start md:self-end">
                            <button
                                type="button"
                                id="filter-transparency-year-btn"
                                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                                className="w-full sm:w-auto min-w-[210px] inline-flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 hover:border-slate-400 focus:outline-none transition cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-600 text-xs" />
                                    <span>
                                        {selectedYear === "all"
                                            ? (locale === "en" ? "All Years / Total" : "Semua Tahun / Total")
                                            : (locale === "en" ? `Year ${selectedYear}` : `Tahun ${selectedYear}`)}
                                    </span>
                                </div>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`text-xs text-slate-400 transition-transform duration-200 ${
                                        yearDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {yearDropdownOpen && (
                                <div className="absolute right-0 mt-1.5 w-full sm:w-56 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg z-30 space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onYearChange("all");
                                            setYearDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition text-left cursor-pointer ${
                                            selectedYear === "all"
                                                ? "bg-primary-50 text-primary-700"
                                                : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        <span>{locale === "en" ? "All Years (Total)" : "Semua Tahun (Total)"}</span>
                                    </button>

                                    {yearsList.map((yr) => (
                                        <button
                                            key={yr}
                                            type="button"
                                            onClick={() => {
                                                onYearChange(String(yr));
                                                setYearDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition text-left cursor-pointer ${
                                                selectedYear === String(yr)
                                                    ? "bg-primary-50 text-primary-700"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <span>{locale === "en" ? `Year ${yr}` : `Tahun ${yr}`}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mandatory Public KPI Summary Cards - 5 Verified Canonical Aggregate Metrics */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {/* Card 1: Total Wakaf Terhimpun */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {locale === "en"
                                    ? "Total Waqf Collected"
                                    : "Total Wakaf Terhimpun"}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <FontAwesomeIcon
                                    icon={faBuildingColumns}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                <AnimatedCounter
                                    value={totalWaqfCollected}
                                    formatter={(val) =>
                                        formatCurrency(val, locale)
                                    }
                                />
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {momCollected !== null && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0 ${
                                            momCollected >= 0
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-rose-50 text-rose-700 border border-rose-200"
                                        }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                momCollected >= 0
                                                    ? faArrowTrendUp
                                                    : faArrowTrendDown
                                            }
                                            className="text-[10px]"
                                        />
                                        <span>
                                            {momCollected >= 0 ? "+" : ""}
                                            {momCollected.toFixed(1)}%
                                        </span>
                                        <span className="text-[10px] font-semibold opacity-75">
                                            {locale === "en" ? "vs last month" : "dari bulan lalu"}
                                        </span>
                                    </span>
                                )}
                                <span className="text-xs font-medium text-slate-500">
                                    <AnimatedCounter
                                        value={verifiedDonations}
                                    />{" "}
                                    {locale === "en"
                                        ? "verified transactions"
                                        : "transaksi terverifikasi"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Penyaluran (Clickable Link to /penyaluran) */}
                    <Link
                        to="/penyaluran"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:border-sky-300 hover:shadow-md block text-left"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-sky-600 transition-colors">
                                {locale === "en"
                                    ? "Funds Distributed to Partners"
                                    : "Dana Disalurkan ke Program"}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100 group-hover:scale-105 group-hover:bg-sky-100 transition">
                                <FontAwesomeIcon
                                    icon={faReceipt}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                <AnimatedCounter
                                    value={totalDistributed}
                                    formatter={(val) =>
                                        formatCurrency(val, locale)
                                    }
                                />
                            </p>
                            <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>
                                    <AnimatedCounter
                                        value={programDistributions}
                                    />{" "}
                                    {locale === "en"
                                        ? "disbursements executed"
                                        : "kali penyaluran amanah"}
                                </span>
                                <span className="text-sky-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    {locale === "en" ? "View details" : "Lihat detail"} &rarr;
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Card 3: Biaya Pengeluaran (Beban Nazhir + Operasional) */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {locale === "en"
                                    ? "Operating & Nazhir Expense"
                                    : "Biaya Pengeluaran"}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                                <FontAwesomeIcon
                                    icon={faScaleBalanced}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                <AnimatedCounter
                                    value={totalExpense}
                                    formatter={(val) =>
                                        formatCurrency(val, locale)
                                    }
                                />
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <span>
                                    {locale === "en"
                                        ? "Beban Nazhir + Beban Operasional"
                                        : "Beban Nazhir + Beban Operasional"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Saldo Siap Disalurkan */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {locale === "en"
                                    ? "Available Distributable Balance"
                                    : "Saldo Siap Disalurkan"}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                                <FontAwesomeIcon
                                    icon={faVault}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {availableBalance !== null ? (
                                    <AnimatedCounter
                                        value={availableBalance}
                                        formatter={(val) =>
                                            formatCurrency(val, locale)
                                        }
                                    />
                                ) : (
                                    <span className="text-slate-400 text-lg">Belum tersedia</span>
                                )}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <span>
                                    {locale === "en"
                                        ? "Distributable revenue & program balances"
                                        : "Dana program & hasil wakaf siap salur"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 5: Rasio YWDP (RoWA) */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300">
                        <div className="flex items-center justify-between gap-4">
                            <span
                                className="text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-help"
                                title="Rasio internal YWDP: total wakaf terhimpun dibanding biaya pengeluaran."
                            >
                                {locale === "en"
                                    ? "YWDP Ratio (RoWA)"
                                    : "Rasio YWDP (RoWA)"}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                                <FontAwesomeIcon
                                    icon={faChartPie}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="flex items-baseline gap-2">
                                {ywdpRatio !== null && typeof ywdpRatio === "number" ? (
                                    <p className="font-heading text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight">
                                        {ywdpRatio.toFixed(2)}%
                                    </p>
                                ) : (
                                    <p className="font-heading text-base sm:text-lg font-bold text-slate-600 tracking-tight">
                                        {ywdpRatioStatus === "expense_base_unavailable"
                                            ? (locale === "en" ? "Expense base unavailable" : "Belum ada beban pengeluaran")
                                            : (locale === "en" ? "Not available" : "Belum tersedia")}
                                    </p>
                                )}
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <span title="Rasio internal YWDP: total wakaf terhimpun dibanding biaya pengeluaran.">
                                    {locale === "en"
                                        ? "Waqf collections to expenses ratio"
                                        : "Perbandingan wakaf terhadap biaya"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Trends Line Chart (Pure Aggregate Verified Metrics) */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                                {locale === "en"
                                    ? "Monthly Collection vs Distribution Trend"
                                    : "Grafik Tren Penghimpunan vs Penyaluran"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {locale === "en"
                                    ? "Real-time sync with Nazhir DPF ledger"
                                    : "Data terintegrasi langsung dengan pembukuan Nazhir DPF"}
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-5 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center">
                                    <span className="h-0.5 w-4 bg-brandGreen-500 rounded-full" />
                                    <span className="h-3 w-3 rounded-full bg-brandGreen-500 border-2 border-white -ml-2.5 shadow-xs" />
                                </span>
                                <span className="text-slate-700">
                                    {locale === "en"
                                        ? "Waqf Collected"
                                        : "Wakaf Terhimpun"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center">
                                    <span className="h-0.5 w-4 bg-sky-500 rounded-full" />
                                    <span className="h-3 w-3 rounded-full bg-sky-500 border-2 border-white -ml-2.5 shadow-xs" />
                                </span>
                                <span className="text-slate-700">
                                    {locale === "en"
                                        ? "Funds Distributed"
                                        : "Dana Disalurkan"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Line Chart Visualization */}
                    <div className="pt-2 pb-2">
                        <div className="h-72 sm:h-80 w-full">
                            <Line data={trendData} options={trendOptions} />
                        </div>
                    </div>

                    {/* Bottom Insight Footer */}
                    <div className="rounded-2xl bg-brandGreen-50/60 border border-brandGreen-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brandGreen-600 text-white">
                                <FontAwesomeIcon icon={faBuildingColumns} />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-bold text-slate-900">
                                    {locale === "en"
                                        ? "Transparent & Accountable Nazhir Guarantee"
                                        : "Jaminan Akuntabilitas Nazhir DPF"}
                                </p>
                                <p className="text-xs text-slate-600">
                                    {locale === "en"
                                        ? "Every rupiah of waqf is audited and channelled directly to verified beneficiary programs."
                                        : "Setiap rupiah amanah wakaf tercatat dan diaudit untuk disalurkan ke program-program produktif."}
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/donate"
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brandGreen-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
                        >
                            <span>
                                {locale === "en"
                                    ? "Salurkan Wakaf Sekarang"
                                    : "Salurkan Wakaf"}
                            </span>
                            <FontAwesomeIcon
                                icon={faArrowRight}
                                className="text-xs"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TransparencySection;
