import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBuildingColumns,
    faHandHoldingHeart,
    faReceipt,
    faHandshakeAngle,
    faArrowRight,
    faScaleBalanced,
    faArrowTrendUp,
    faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import http from "@/lib/http";
import { useLang } from "@/lib/i18n";
import { landingDict } from "@/components/landing/LandingI18n";
import { translate } from "@/lib/i18n-utils";
import { LandingLayout } from "@/layouts/LandingLayout";
import {
    type HomePayload,
    formatCurrency,
    AnimatedCounter,
    calculateMoM,
} from "@/components/landing/LandingUI";
import { TransparencySection } from "@/components/landing/TransparencySection";
import { MonthlyRowaSection } from "@/components/landing/MonthlyRowaSection";
import heroTransparantImg from "@/assets/brand/hero-transparant.webp";

export function TransparansiPage() {
    const [data, setData] = useState<HomePayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const { locale } = useLang();
    const t = (key: string, fallback?: string) =>
        translate(landingDict, locale, key, fallback);

    // Parallax Scroll Tracking
    const { scrollY } = useScroll();
    const yParallax = useTransform(scrollY, [0, 800], [0, 200]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        const url =
            selectedYear && selectedYear !== "all"
                ? `/home?year=${selectedYear}`
                : "/home";
        http.get<HomePayload>(url)
            .then((res) => {
                if (!mounted) return;
                setData(res.data);
            })
            .catch((err) => console.error(err))
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [selectedYear]);

    const totalWaqfCollected = Number(
        data?.finance?.total_waqf_collected ||
            data?.stats?.total_waqf_collected ||
            data?.stats?.amount_collected ||
            data?.stats?.total_collected ||
            0,
    );
    const totalDistributed = Number(
        data?.finance?.total_distributed ||
            data?.stats?.total_distributed ||
            data?.stats?.amount_allocated ||
            0,
    );
    const programDistributions = Number(
        data?.finance?.program_distributions ||
            data?.stats?.program_distributions ||
            data?.stats?.total_allocations ||
            0,
    );

    // MoM (Month-over-Month) Growth Percentage (strictly bounded between -100.0% and +100.0%)
    const rawMom = calculateMoM(
        data?.stats?.monthly_trends,
        data?.stats?.collected_mom,
    );
    const momCollected =
        rawMom !== null ? Math.min(100, Math.max(-100, rawMom)) : null;

    return (
        <LandingLayout
            whatsappPhone="6285195542022"
            footerWaveBgClassName="bg-slate-50"
        >
            {/* Full-Screen Hero Section with Parallax */}
            <section
                id="hero"
                className="relative -mt-24 h-screen min-h-screen flex flex-col justify-center overflow-hidden bg-slate-950 text-white"
            >
                {/* Parallax Background Photo & Clean Dark Overlay */}
                <motion.div
                    className="absolute inset-0 z-0 h-[125%] -top-[12%] w-full"
                    style={{ y: isMobile ? 0 : yParallax }}
                >
                    <img
                        src={heroTransparantImg}
                        alt="Transparansi Wakaf DPF"
                        className="h-full w-full object-cover object-center"
                    />
                    {/* Clean Flat Dark Overlay */}
                    <div className="absolute inset-0 bg-black/60" />
                </motion.div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 text-center pt-24 pb-8 my-auto">
                    {/* Heading */}
                    <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight drop-shadow-md">
                        {locale === "en"
                            ? "Waqf Collection & Distribution Transparency"
                            : "Transparansi Penghimpunan & Penyaluran Wakaf"}
                    </h1>

                    {/* Subtitle */}
                    <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-200 leading-relaxed font-normal drop-shadow-sm">
                        {locale === "en"
                            ? "Djalaludin Pane Foundation (DPF) is committed to real-time transparency, accountability, and productive waqf governance. Monitor all funds collected and distributed to programs."
                            : "Djalaludin Pane Foundation (DPF) berkomitmen mewujudkan keterbukaan dan tata kelola wakaf yang amanah, akuntabel, dan produktif. Pantau seluruh alur dana dari wakif hingga penyaluran ke program."}
                    </p>

                    {/* Harmonious Quick Metrics Strip: 3 Verified Public Metrics with Elegant Glassmorphism */}
                    <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 max-w-5xl mx-auto text-left w-full">
                        {/* Card 1: Total Wakaf Terhimpun */}
                        <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/15 p-4.5 sm:p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-slate-900/55 hover:border-emerald-400/30 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.3)]">
                            <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-xl" />

                            <div className="relative flex items-center gap-3.5 sm:gap-4">
                                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-brandGreen-500">
                                    <FontAwesomeIcon
                                        icon={faBuildingColumns}
                                        className="text-base sm:text-lg"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[11px] sm:text-xs font-medium text-slate-300/90 block truncate">
                                        {locale === "en"
                                            ? "Total Waqf Collected"
                                            : "Total Wakaf Terhimpun"}
                                    </span>
                                    <p className="font-heading text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight truncate mt-0.5">
                                        {loading ? (
                                            "..."
                                        ) : (
                                            <AnimatedCounter
                                                value={totalWaqfCollected}
                                                formatter={(val) =>
                                                    formatCurrency(val, locale)
                                                }
                                            />
                                        )}
                                    </p>
                                    {momCollected !== null && (
                                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs ${
                                                    momCollected > 0
                                                        ? "bg-brandGreen-500"
                                                        : momCollected < 0
                                                          ? "bg-red-500"
                                                          : "bg-red-500"
                                                }`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        momCollected > 0
                                                            ? faArrowTrendUp
                                                            : momCollected < 0
                                                              ? faArrowTrendDown
                                                              : faArrowTrendUp
                                                    }
                                                    className="text-[8px]"
                                                />
                                                <span>
                                                    {momCollected > 0
                                                        ? "+"
                                                        : ""}
                                                    {momCollected.toFixed(1)}%
                                                </span>
                                            </span>
                                            <span className="text-[10px] sm:text-[11px] text-slate-300/70 font-medium">
                                                {locale === "en"
                                                    ? "from last month"
                                                    : "dari bulan lalu"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Dana Disalurkan (Clickable to /penyaluran) */}
                        <Link
                            to="/penyaluran"
                            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/15 p-4.5 sm:p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-slate-900/55 hover:border-sky-400/30 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.3)] cursor-pointer block text-left"
                            title={
                                locale === "en"
                                    ? "Click to view distribution details"
                                    : "Klik untuk melihat detail penyaluran"
                            }
                        >
                            <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-28 rounded-full bg-sky-500/10 blur-xl" />

                            <div className="absolute top-3.5 right-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] border border-white/10 text-slate-300 group-hover:bg-sky-500/25 group-hover:text-sky-200 group-hover:border-sky-400/40 transition-all duration-300">
                                <FontAwesomeIcon
                                    icon={faArrowRight}
                                    className="text-[10px] -rotate-45 group-hover:rotate-0 transition-transform duration-300"
                                />
                            </div>

                            <div className="relative flex items-center gap-3.5 sm:gap-4 pr-4">
                                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600">
                                    <FontAwesomeIcon
                                        icon={faReceipt}
                                        className="text-base sm:text-lg"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[11px] sm:text-xs font-medium text-slate-300/90 block truncate group-hover:text-sky-200 transition-colors">
                                        {locale === "en"
                                            ? "Total Distributed"
                                            : "Dana Disalurkan"}
                                    </span>
                                    <p className="font-heading text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight truncate mt-0.5">
                                        {loading ? (
                                            "..."
                                        ) : (
                                            <AnimatedCounter
                                                value={totalDistributed}
                                                formatter={(val) =>
                                                    formatCurrency(val, locale)
                                                }
                                            />
                                        )}
                                    </p>
                                    <div className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-300/70 font-medium">
                                        <span>
                                            {locale === "en"
                                                ? "To all programs"
                                                : "Untuk program"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Card 3: Penyaluran Program */}
                        <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/15 p-4.5 sm:p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-slate-900/55 hover:border-indigo-400/30 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.3)]">
                            <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-xl" />

                            <div className="relative flex items-center gap-3.5 sm:gap-4">
                                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600">
                                    <FontAwesomeIcon
                                        icon={faHandshakeAngle}
                                        className="text-base sm:text-lg"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[11px] sm:text-xs font-medium text-slate-300/90 block truncate">
                                        {locale === "en"
                                            ? "Program Distributions"
                                            : "Penyaluran Program"}
                                    </span>
                                    <p className="font-heading text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight truncate mt-0.5">
                                        {loading ? (
                                            "..."
                                        ) : (
                                            <AnimatedCounter
                                                value={programDistributions}
                                            />
                                        )}
                                    </p>
                                    <div className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-300/70 font-medium">
                                        <span>
                                            {locale === "en"
                                                ? "Disbursement transactions"
                                                : "Transaksi penyaluran"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Interactive Transparency Section with Year Filter */}
            <TransparencySection
                finance={data?.finance}
                stats={data?.stats}
                locale={locale}
                selectedYear={selectedYear}
                availableYears={data?.available_years}
                onYearChange={setSelectedYear}
                t={t}
            />

            {/* Monthly Realization Section */}
            <MonthlyRowaSection
                finance={data?.finance}
                stats={data?.stats}
                locale={locale}
                selectedYear={selectedYear}
            />

            {/* Governance & Pillars Section */}
            <section className="bg-slate-50 pb-20 sm:pb-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
                            {locale === "en"
                                ? "Governance & Accountability Standards"
                                : "Standar Tata Kelola & Akuntabilitas"}
                        </h2>
                        <p className="text-base text-slate-600">
                            {locale === "en"
                                ? "Every rupiah is accounted for through strict nazhir principles, financial auditing, and transparent reporting."
                                : "Setiap amanah wakaf dikelola dengan prinsip tata kelola nazhir profesional yang transparan, akuntabel, dan berdampak."}
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-600 text-white">
                                <FontAwesomeIcon
                                    icon={faScaleBalanced}
                                    className="text-xl"
                                />
                            </div>
                            <h3 className="font-heading text-lg font-bold text-slate-900">
                                {locale === "en"
                                    ? "Sharia Compliant"
                                    : "Kepatuhan Syariah & Regulasi"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {locale === "en"
                                    ? "DPF operates under the guidance of Islamic waqf jurisprudence and official regulations of the Indonesian Waqf Board (BWI)."
                                    : "Pengelolaan wakaf diawasi langsung dan patuh pada pedoman Badan Wakaf Indonesia (BWI) dan Kementerian Agama RI."}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white">
                                <FontAwesomeIcon
                                    icon={faReceipt}
                                    className="text-xl"
                                />
                            </div>
                            <h3 className="font-heading text-lg font-bold text-slate-900">
                                {locale === "en"
                                    ? "Verified Field Proof"
                                    : "Dokumentasi & Bukti Riil"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {locale === "en"
                                    ? "Every allocation requires photo proof, recipient receipts, and documentation accessible to stakeholders."
                                    : "Setiap penyaluran dilengkapi foto dokumentasi lapangan, kwitansi, dan pertanggung jawaban yang terekam di sistem."}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-4 sm:col-span-2 lg:col-span-1">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                                <FontAwesomeIcon
                                    icon={faBuildingColumns}
                                    className="text-xl"
                                />
                            </div>
                            <h3 className="font-heading text-lg font-bold text-slate-900">
                                {locale === "en"
                                    ? "Productive Empowerment"
                                    : "Pemberdayaan Berkelanjutan"}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {locale === "en"
                                    ? "Focus on high-impact productive waqf models in education, MSME livestock, and community infrastructure."
                                    : "Fokus pada program wakaf produktif di bidang peternakan, pendidikan, air bersih, dan fasilitas ibadah di pelosok."}
                            </p>
                        </div>
                    </div>

                    {/* CTA Box */}
                    <div className="rounded-3xl bg-gradient-to-r from-brandGreen-800 to-brandGreen-700 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="font-heading text-2xl sm:text-3xl font-bold">
                                {locale === "en"
                                    ? "Ready to plant your eternal legacy?"
                                    : "Mari Salurkan Wakaf Terbaik Anda"}
                            </h3>
                            <p className="text-sm text-brandGreen-100 max-w-xl">
                                {locale === "en"
                                    ? "Choose from our verified productive waqf programs and receive automated transparent impact reports."
                                    : "Pilih program wakaf produktif pilihan Anda dan dapatkan laporan penyaluran yang transparan dan akuntabel."}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/donate"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-brandGreen-800 shadow-md transition hover:bg-slate-100 hover:shadow-lg active:scale-95"
                            >
                                <FontAwesomeIcon icon={faHandHoldingHeart} />
                                <span>
                                    {locale === "en"
                                        ? "Donate Waqf Now"
                                        : "Salurkan Wakaf"}
                                </span>
                            </Link>
                            <Link
                                to="/program"
                                className="inline-flex items-center gap-2 rounded-full bg-brandGreen-700/60 border border-brandGreen-400/40 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brandGreen-700 active:scale-95"
                            >
                                <span>
                                    {locale === "en"
                                        ? "View Programs"
                                        : "Lihat Program"}
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
        </LandingLayout>
    );
}

export default TransparansiPage;
