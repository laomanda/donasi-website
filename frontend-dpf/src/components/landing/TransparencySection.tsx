import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHandHoldingHeart,
    faReceipt,
    faVault,
    faChartLine,
    faListCheck,
    faArrowRight,
    faMagnifyingGlass,
    faArrowTrendUp,
    faArrowTrendDown,
    faBuildingColumns,
    faChevronLeft,
    faChevronRight,
    faCalendarAlt,
    faChevronDown,
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
    formatCurrency,
    pickLocale,
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
    stats?: HomeStats | null;
    locale?: "id" | "en";
    selectedYear?: string;
    availableYears?: number[];
    onYearChange?: (year: string) => void;
    t: (key: string, fallback?: string) => string;
}

export function TransparencySection({
    stats,
    locale = "id",
    selectedYear = "all",
    availableYears,
    onYearChange,
    t,
}: TransparencySectionProps) {
    const [activeTab, setActiveTab] = useState<"program" | "trends">("program");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
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

    const itemsPerPage = 6;

    const totalCollected = Number(stats?.amount_collected ?? 0);
    const totalAllocated = Number(stats?.amount_allocated ?? 0);
    const availableBalance = Math.max(0, totalCollected - totalAllocated);
    const distributionRatio =
        totalCollected > 0 ? (totalAllocated / totalCollected) * 100 : 0;

    const momCollected = calculateMoM(stats?.monthly_trends, stats?.collected_mom);

    const programAllocations = useMemo(
        () => stats?.program_allocations ?? [],
        [stats?.program_allocations],
    );
    const monthlyTrends = useMemo(
        () => stats?.monthly_trends ?? [],
        [stats?.monthly_trends],
    );

    // Extract unique categories
    const categories = useMemo(() => {
        const set = new Set<string>();
        programAllocations.forEach((item) => {
            const cat = pickLocale(item.category, item.category_en, locale);
            if (cat) set.add(cat);
        });
        return Array.from(set);
    }, [programAllocations, locale]);

    // Filter program allocations
    const filteredPrograms = useMemo(() => {
        return programAllocations.filter((item) => {
            const title = pickLocale(
                item.title,
                item.title_en,
                locale,
            ).toLowerCase();
            const cat = pickLocale(item.category, item.category_en, locale);
            const matchesSearch =
                !searchQuery.trim() ||
                title.includes(searchQuery.toLowerCase().trim());
            const matchesCat =
                categoryFilter === "all" || cat === categoryFilter;
            return matchesSearch && matchesCat;
        });
    }, [programAllocations, searchQuery, categoryFilter, locale]);

    const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
    const paginatedPrograms = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPrograms.slice(start, start + itemsPerPage);
    }, [filteredPrograms, currentPage, itemsPerPage]);

    const trendLabels = useMemo(() => {
        return monthlyTrends.map((m) => {
            return m.label ? m.label.split(" ")[0] : m.month_key;
        });
    }, [monthlyTrends]);

    const trendData = useMemo(() => {
        return {
            labels: trendLabels,
            datasets: [
                {
                    label:
                        locale === "en" ? "Funds Collected" : "Dana Dihimpun",
                    data: monthlyTrends.map((m) => Number(m.collected || 0)),
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
                    data: monthlyTrends.map((m) => Number(m.allocated || 0)),
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
    }, [monthlyTrends, trendLabels, locale]);

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
                            const month = monthlyTrends[idx];
                            return month?.label || items[0]?.label || "";
                        },
                        label: (item: TooltipItem<"line">) => {
                            const val = Number(item.raw ?? 0);
                            return ` ${item.dataset.label}: ${formatCurrency(val, locale)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#64748b",
                        font: { size: 12, weight: 600 },
                        padding: 8,
                    },
                    grid: {
                        display: false,
                    },
                    border: {
                        color: "#e2e8f0",
                    },
                },
                y: {
                    type: "linear" as const,
                    beginAtZero: true,
                    ticks: {
                        color: "#94a3b8",
                        font: { size: 11 },
                        callback: (value: string | number) => {
                            const num = Number(value);
                            if (num >= 1_000_000_000) {
                                return `Rp ${(num / 1_000_000_000).toLocaleString("id-ID")} M`;
                            }
                            if (num >= 1_000_000) {
                                return `Rp ${(num / 1_000_000).toLocaleString("id-ID")} Jt`;
                            }
                            if (num >= 1_000) {
                                return `Rp ${(num / 1_000).toLocaleString("id-ID")} rb`;
                            }
                            return `Rp ${num}`;
                        },
                        padding: 8,
                    },
                    grid: {
                        color: "#f1f5f9",
                        borderDash: [4, 4],
                    },
                    border: {
                        dash: [4, 4],
                        display: false,
                    },
                },
            },
        };
    }, [monthlyTrends, locale]);

    return (
        <section
            id="transparansi"
            className="relative bg-slate-50 py-16 sm:py-24"
        >
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Section Header & Year Filter Dropdown */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-slate-200/80 pb-6">
                    <div className="text-left space-y-2 max-w-2xl">
                        <h2 className="font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl leading-tight">
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

                {/* 3 Main KPI Summary Cards - Clean & Professional */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Card 1: Penghimpunan */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {locale === "en"
                                    ? "Waqf Funds Collected"
                                    : "Dana Wakaf Dihimpun"}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-700 border border-brandGreen-100">
                                <FontAwesomeIcon
                                    icon={faHandHoldingHeart}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            {/* Full-width number: scalable for millions, billions, and trillions */}
                            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                <AnimatedCounter
                                    value={totalCollected}
                                    formatter={(val) =>
                                        formatCurrency(val, locale)
                                    }
                                />
                            </p>

                            {/* Info row with growth badge & transaction count */}
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
                                        value={stats?.total_donations ?? 0}
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
                                    value={totalAllocated}
                                    formatter={(val) =>
                                        formatCurrency(val, locale)
                                    }
                                />
                            </p>
                            <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>
                                    <AnimatedCounter
                                        value={stats?.total_allocations ?? 0}
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

                    {/* Card 3: Saldo Tersedia & Rasio */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {locale === "en"
                                    ? "Available Balance for Distribution"
                                    : "Saldo Siap Disalurkan"}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60">
                                <FontAwesomeIcon
                                    icon={faVault}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                <AnimatedCounter
                                    value={availableBalance}
                                    formatter={(val) =>
                                        formatCurrency(val, locale)
                                    }
                                />
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <FontAwesomeIcon
                                    icon={faArrowTrendUp}
                                    className="text-[11px] text-brandGreen-600"
                                />
                                <span>
                                    {distributionRatio.toFixed(1)}%{" "}
                                    {locale === "en"
                                        ? "distribution ratio from collection"
                                        : "rasio dana tersalurkan dari terhimpun"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Selection Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 w-fit">
                        <button
                            type="button"
                            onClick={() => setActiveTab("program")}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                                activeTab === "program"
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faListCheck}
                                className="text-brandGreen-600"
                            />
                            <span>{t("landing.transparency.tabProgram")}</span>
                            <span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                                {programAllocations.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("trends")}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                                activeTab === "trends"
                                    ? "bg-white text-slate-900 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={faChartLine}
                                className="text-sky-600"
                            />
                            <span>{t("landing.transparency.tabTrends")}</span>
                        </button>
                    </div>

                    <p className="text-xs font-medium text-slate-500">
                        {locale === "en"
                            ? "Real-time sync with Nazhir DPF ledger"
                            : "Data terintegrasi langsung dengan pembukuan Nazhir DPF"}
                    </p>
                </div>

                {/* Tab 1: Program Distribution Breakdown */}
                {activeTab === "program" && (
                    <div className="space-y-6">
                        {/* Filter and Search Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                            <div className="relative flex-1">
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder={t(
                                        "landing.transparency.searchPlaceholder",
                                    )}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-brandGreen-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brandGreen-500/15"
                                />
                            </div>

                            {categories.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => {
                                            setCategoryFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full sm:w-56 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 focus:border-brandGreen-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brandGreen-500/15 cursor-pointer"
                                    >
                                        <option value="all">
                                            {t(
                                                "landing.transparency.allCategories",
                                            )}
                                        </option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Program Allocation List */}
                        {filteredPrograms.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
                                <p className="text-sm font-semibold text-slate-700">
                                    {locale === "en"
                                        ? "No program data found"
                                        : "Tidak ada data program yang cocok"}
                                </p>
                                {(searchQuery || categoryFilter !== "all") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setCategoryFilter("all");
                                            setCurrentPage(1);
                                        }}
                                        className="mt-3 text-xs font-semibold text-brandGreen-600 hover:text-brandGreen-700"
                                    >
                                        {locale === "en"
                                            ? "Reset filters"
                                            : "Reset filter pencarian"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {paginatedPrograms.map((prog, index) => {
                                        const title = pickLocale(
                                            prog.title,
                                            prog.title_en,
                                            locale,
                                        );
                                        const category = pickLocale(
                                            prog.category,
                                            prog.category_en,
                                            locale,
                                        );
                                        const collected = Number(
                                            prog.collected_amount || 0,
                                        );
                                        const allocated = Number(
                                            prog.allocated_amount || 0,
                                        );
                                        const progPercent =
                                            collected > 0
                                                ? Math.min(
                                                      100,
                                                      (allocated / collected) *
                                                          100,
                                                  )
                                                : 0;
                                        const remaining = Math.max(
                                            0,
                                            collected - allocated,
                                        );

                                        return (
                                            <div
                                                key={prog.id || `gen-${index}`}
                                                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                                            {category}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-slate-400">
                                                            {
                                                                prog.allocation_count
                                                            }{" "}
                                                            {locale === "en"
                                                                ? "disbursements"
                                                                : "penyaluran"}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h3
                                                            className="font-heading text-base font-bold text-slate-900 line-clamp-2"
                                                            title={title}
                                                        >
                                                            {title}
                                                        </h3>
                                                    </div>

                                                    {/* Progress Bar of Allocation */}
                                                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                                        <div className="flex items-center justify-between text-xs font-semibold">
                                                            <span className="text-slate-500">
                                                                {locale === "en"
                                                                    ? "Penyaluran"
                                                                    : "Tersalurkan"}{" "}
                                                                (
                                                                {progPercent.toFixed(
                                                                    0,
                                                                )}
                                                                %)
                                                            </span>
                                                            <span className="text-slate-900 font-bold">
                                                                {formatCurrency(
                                                                    allocated,
                                                                    locale,
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className="h-full rounded-full bg-brandGreen-600 transition-all duration-300"
                                                                style={{
                                                                    width: `${Math.max(progPercent > 0 ? 5 : 0, progPercent)}%`,
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                                            <span>
                                                                {locale === "en"
                                                                    ? "Total Dihimpun:"
                                                                    : "Dana Terhimpun:"}
                                                            </span>
                                                            <span className="font-semibold text-slate-800">
                                                                {formatCurrency(
                                                                    collected,
                                                                    locale,
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                            <span>
                                                                {locale === "en"
                                                                    ? "Saldo Siap Salur:"
                                                                    : "Saldo Belum Salur:"}
                                                            </span>
                                                            <span className="font-semibold text-brandGreen-700">
                                                                {formatCurrency(
                                                                    remaining,
                                                                    locale,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {prog.slug && (
                                                    <div className="mt-5 pt-3 border-t border-slate-100">
                                                        <Link
                                                            to={`/program/${prog.slug}`}
                                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition hover:bg-brandGreen-600 hover:text-white group"
                                                        >
                                                            <span>
                                                                {locale === "en"
                                                                    ? "Program View"
                                                                    : "Lihat Program"}
                                                            </span>
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faArrowRight
                                                                }
                                                                className="text-[10px] transition group-hover:translate-x-1"
                                                            />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <p className="text-xs text-slate-500">
                                            {locale === "en"
                                                ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredPrograms.length)} of ${filteredPrograms.length} programs`
                                                : `Menampilkan ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredPrograms.length)} dari total ${filteredPrograms.length} program`}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={currentPage === 1}
                                                onClick={() =>
                                                    setCurrentPage((p) =>
                                                        Math.max(1, p - 1),
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faChevronLeft}
                                                    className="text-[10px]"
                                                />
                                                <span>
                                                    {locale === "en"
                                                        ? "Prev"
                                                        : "Sebelumnya"}
                                                </span>
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {Array.from(
                                                    { length: totalPages },
                                                    (_, i) => i + 1,
                                                ).map((pg) => (
                                                    <button
                                                        key={pg}
                                                        type="button"
                                                        onClick={() =>
                                                            setCurrentPage(pg)
                                                        }
                                                        className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                                                            currentPage === pg
                                                                ? "bg-brandGreen-600 text-white shadow-sm"
                                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                        }`}
                                                    >
                                                        {pg}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                onClick={() =>
                                                    setCurrentPage((p) =>
                                                        Math.min(
                                                            totalPages,
                                                            p + 1,
                                                        ),
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <span>
                                                    {locale === "en"
                                                        ? "Next"
                                                        : "Berikutnya"}
                                                </span>
                                                <FontAwesomeIcon
                                                    icon={faChevronRight}
                                                    className="text-[10px]"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Monthly Trends Line Chart */}
                {activeTab === "trends" && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                                    {locale === "en"
                                        ? "Monthly Collection vs Distribution Trend (Last 6 Months)"
                                        : "Grafik Tren Penghimpunan vs Penyaluran (6 Bulan Terakhir)"}
                                </h3>
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
                                            ? "Penghimpunan"
                                            : "Dana Dihimpun"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center">
                                        <span className="h-0.5 w-4 bg-sky-500 rounded-full" />
                                        <span className="h-3 w-3 rounded-full bg-sky-500 border-2 border-white -ml-2.5 shadow-xs" />
                                    </span>
                                    <span className="text-slate-700">
                                        {locale === "en"
                                            ? "Penyaluran"
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
                )}
            </div>
        </section>
    );
}

export default TransparencySection;
