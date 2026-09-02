import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faHandHoldingHeart,
  faArrowRight,
  faCalendarAlt,
  faLayerGroup,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "@/layouts/LandingLayout";
import { useLang } from "@/lib/i18n";
import http from "@/lib/http";
import { motion } from "framer-motion";
import {
  type HomePayload,
  formatCurrency,
  AnimatedCounter,
} from "@/components/landing/LandingUI";
import proposalWakafImg from "@/assets/brand/proposal_wakaf.webp";

import {
  DistributionShowcase,
  type AllocationItem,
} from "@/components/ui/design-testimonial";

export function PenyaluranPage() {
  const { locale } = useLang();
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [loadingAllocations, setLoadingAllocations] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    http
      .get<HomePayload>("/home")
      .then((res) => {
        if (!isMounted) return;
        setData(res.data);
      })
      .catch((err) => console.error("Error loading distribution stats:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    http
      .get<{ success: boolean; data: AllocationItem[] }>("/allocations")
      .then((res) => {
        if (!isMounted) return;
        setAllocations(res.data.data || []);
      })
      .catch((err) => console.error("Error loading allocations:", err))
      .finally(() => {
        if (isMounted) setLoadingAllocations(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalAllocated = Number(data?.stats?.amount_allocated ?? 0);

  // Available Years: automatically generates from highest year (current year / 2027+ in DB) down to 2020
  const availableYears = useMemo(() => {
    const startYear = 2020;
    const currentYear = new Date().getFullYear();

    // Find highest year from data or current year
    let maxYearInData = currentYear;
    allocations.forEach((item) => {
      const dateStr = item.allocated_at || item.created_at;
      if (dateStr) {
        const y = new Date(dateStr).getFullYear();
        if (!isNaN(y) && y > maxYearInData) {
          maxYearInData = y;
        }
      }
    });

    const endYear = Math.max(currentYear, maxYearInData, 2026);
    const yrs: number[] = [];
    for (let y = endYear; y >= startYear; y--) {
      yrs.push(y);
    }
    return yrs;
  }, [allocations]);

  // Counts of allocations per year
  const yearCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allocations.length };
    allocations.forEach((item) => {
      const dateStr = item.allocated_at || item.created_at;
      if (dateStr) {
        const y = new Date(dateStr).getFullYear();
        if (!isNaN(y)) {
          counts[String(y)] = (counts[String(y)] || 0) + 1;
        }
      }
    });
    return counts;
  }, [allocations]);

  // Filtered allocations for showcase
  const filteredAllocations = useMemo(() => {
    if (selectedYear === "all") return allocations;
    const targetY = Number(selectedYear);
    return allocations.filter((item) => {
      const dateStr = item.allocated_at || item.created_at;
      if (!dateStr) return false;
      const y = new Date(dateStr).getFullYear();
      return y === targetY;
    });
  }, [allocations, selectedYear]);

  // Yearly summary metrics
  const yearStats = useMemo(() => {
    const totalAmount = filteredAllocations.reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );
    const totalCount = filteredAllocations.length;
    const uniquePrograms = new Set(
      filteredAllocations
        .map((a) => a.program_id || a.program?.id)
        .filter(Boolean)
    ).size;

    return {
      totalAmount,
      totalCount,
      uniquePrograms,
    };
  }, [filteredAllocations]);

  return (
    <LandingLayout whatsappPhone="6285195542022" footerWaveBgClassName="bg-white">
      {/* =========================================================================
          HERO SECTION: "Amanah & Human-Impact" (Split Hero with Live Metrik)
      ========================================================================= */}
      <header className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-28 pb-16 lg:pt-36 lg:pb-24">
        {/* Ambient Gradient Glows in Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-200/35 via-primary-100/30 to-sky-200/35 blur-3xl opacity-70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-40 -left-20 -z-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-60 -right-20 -z-10 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Grid Layout (Left: Text & Action, Right: Visual & Floating Badges) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">

              {/* Main Heading */}
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.25] sm:leading-[1.22]">
                {locale === "en" ? (
                  <>
                    Tangible Impact of Waqf:{" "}
                    <span className="relative inline-block text-primary-700 pb-2 sm:pb-2.5">
                      <span>Flowing as Blessings,</span>
                      <motion.svg
                        className="absolute bottom-0 -left-2 sm:-left-3 w-[calc(100%+16px)] sm:w-[calc(100%+24px)] h-2.5 sm:h-3 text-primary-500 overflow-visible pointer-events-none"
                        viewBox="0 0 280 12"
                        fill="none"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Soft permanent base line */}
                        <path
                          d="M2 3C75 10 205 10 278 4"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          className="opacity-25"
                        />
                        {/* Flowing animated stream line (infinite loop) */}
                        <motion.path
                          d="M2 3C75 10 205 10 278 4"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          animate={{
                            pathLength: [0, 1, 1, 0],
                            pathOffset: [0, 0, 0.4, 1],
                            opacity: [0.3, 1, 1, 0],
                          }}
                          transition={{
                            duration: 2.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 0.8,
                          }}
                        />
                      </motion.svg>
                    </span>{" "}
                    Empowering Lives.
                  </>
                ) : (
                  <>
                    Jejak Nyata Amanah Wakaf:{" "}
                    <span className="relative inline-block text-primary-700 pb-2 sm:pb-2.5">
                      <span>Mengalir Jadi Manfaat,</span>
                      <motion.svg
                        className="absolute bottom-0 -left-2 sm:-left-3 w-[calc(100%+16px)] sm:w-[calc(100%+24px)] h-2.5 sm:h-3 text-primary-500 overflow-visible pointer-events-none"
                        viewBox="0 0 280 12"
                        fill="none"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Soft permanent base line */}
                        <path
                          d="M2 3C75 10 205 10 278 4"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          className="opacity-25"
                        />
                        {/* Flowing animated stream line (infinite loop) */}
                        <motion.path
                          d="M2 3C75 10 205 10 278 4"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          animate={{
                            pathLength: [0, 1, 1, 0],
                            pathOffset: [0, 0, 0.4, 1],
                            opacity: [0.3, 1, 1, 0],
                          }}
                          transition={{
                            duration: 2.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 0.8,
                          }}
                        />
                      </motion.svg>
                    </span>{" "}
                    Tumbuh Berkelanjutan.
                  </>
                )}
              </h1>

              {/* Subheadline Description */}
              <p className="max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {locale === "en"
                  ? "Every rupiah of waqf and donation entrusted to DPF is distributed transparently and measurably to productive programs, education, healthcare, and community welfare."
                  : "Setiap rupiah donasi dan wakaf yang Anda amanahkan kepada DPF disalurkan dengan prinsip tepat sasaran, terukur, dan terdokumentasi rapi untuk menggerakkan kemandirian umat, pendidikan, sarana ibadah, dan bantuan sosial."}
              </p>
            </div>

            {/* Right Visual Column (Hero Image with Overlaid Floating Impact Cards) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Image Container - Full display without crop & without dark overlay */}
                <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl shadow-slate-900/10">
                  <img
                    src={proposalWakafImg}
                    alt={
                      locale === "en"
                        ? "Waqf fund distribution and beneficiary empowerment activities"
                        : "Kegiatan penyaluran dana wakaf dan pemberdayaan penerima manfaat DPF"
                    }
                    className="w-full h-auto block rounded-2xl transition-transform"
                  />
                </div>

                {/* Floating Card: Total Dana Disalurkan (Light Glassmorphic Background) */}
                <div className="absolute -bottom-5 -right-3 sm:-right-5 rounded-2xl bg-white/95 border border-slate-200/90 p-4 shadow-xl backdrop-blur-md text-left text-slate-900 max-w-[240px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                      <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {locale === "en" ? "Funds Distributed" : "Dana Tersalurkan"}
                    </span>
                  </div>
                  <p className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? "..." : (
                      <AnimatedCounter
                        value={totalAllocated}
                        formatter={(val) => formatCurrency(val, locale)}
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          DISTRIBUTION SHOWCASE (KINETIC SLIDER DENGAN REKAPAN TAHUNAN)
      ========================================================================= */}
      <main className="pt-2 pb-20 lg:pt-4 lg:pb-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-10">
            <div className="max-w-3xl text-left">
              {/* Main Headline */}
              <h2 className="font-heading text-2xl sm:text-4xl lg:text-[2.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.2]">
                {locale === "en" ? (
                  <>
                    Every Rupiah Realized into{" "}
                    <span className="text-primary-600">Tangible Impact.</span>
                  </>
                ) : (
                  <>
                    Setiap Rupiah Berbuah Menjadi{" "}
                    <span className="text-primary-600">Manfaat Nyata.</span>
                  </>
                )}
              </h2>

              {/* Subheadline description */}
              <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                {locale === "en"
                  ? "Explore real-time distribution records funded by donors with 100% transparency and measurable social empowerment."
                  : "Telusuri rincian kegiatan penyaluran yang telah direalisasikan secara amanah dari dana titipan para donatur dan wakif untuk kemandirian umat."}
              </p>
            </div>
          </div>

          {/* Filter Bar: Rekapan Per Tahun (Dropdown Responsive) */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700 shrink-0">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-bold text-slate-800">
                  {locale === "en" ? "Filter Distribution Year" : "Pilih Tahun Penyaluran"}
                </span>
                <span className="block text-[11px] text-slate-500 font-normal">
                  {locale === "en"
                    ? `Showing ${filteredAllocations.length} records in ${selectedYear === "all" ? "All Years" : `Year ${selectedYear}`}`
                    : `Menampilkan ${filteredAllocations.length} data pada ${selectedYear === "all" ? "Semua Tahun" : `Tahun ${selectedYear}`}`}
                </span>
              </div>
            </div>

            {/* Dropdown Select Container */}
            <div className="relative w-full sm:w-auto min-w-[200px]">
              <select
                id="filter-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                aria-label={locale === "en" ? "Filter by year" : "Filter berdasarkan tahun"}
                className="w-full sm:w-auto appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-3.5 pr-9 text-xs sm:text-sm font-semibold text-slate-800 hover:border-slate-400 focus:border-primary-500 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="all">
                  {locale === "en"
                    ? `All Years (${yearCounts["all"] || 0})`
                    : `Semua Tahun (${yearCounts["all"] || 0})`}
                </option>
                {availableYears.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {locale === "en" ? `Year ${yr}` : `Tahun ${yr}`} ({yearCounts[String(yr)] || 0})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
              </div>
            </div>
          </div>

          {/* Yearly Recap Stats Grid (3 Crisp Flat Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Card 1: Total Dana Disalurkan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <FontAwesomeIcon icon={faReceipt} className="text-sm" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {locale === "en" ? "Funds Distributed" : "Total Penyaluran"}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {selectedYear === "all"
                      ? (locale === "en" ? "All Period" : "Semua Periode")
                      : (locale === "en" ? `Year ${selectedYear}` : `Tahun ${selectedYear}`)}
                  </span>
                </div>
              </div>
              <p className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(yearStats.totalAmount, locale)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {locale === "en" ? "Verified realization funds" : "Realisasi dana tepat sasaran"}
              </p>
            </div>

            {/* Card 2: Jumlah Kegiatan Penyaluran */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <FontAwesomeIcon icon={faHandHoldingHeart} className="text-sm" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {locale === "en" ? "Activities & Distribution" : "Kegiatan Penyaluran"}
                  </span>
                  <span className="text-xs font-semibold text-sky-700">
                    {selectedYear === "all"
                      ? (locale === "en" ? "Total Logged" : "Total Tercatat")
                      : (locale === "en" ? `Year ${selectedYear}` : `Tahun ${selectedYear}`)}
                  </span>
                </div>
              </div>
              <p className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {yearStats.totalCount}{" "}
                <span className="text-sm font-semibold text-slate-500">
                  {locale === "en" ? "Activities" : "Kegiatan"}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {locale === "en" ? "Documented social impacts" : "Dokumentasi penyaluran amanah"}
              </p>
            </div>

            {/* Card 3: Program Terdampak */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-sm" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {locale === "en" ? "Target Programs" : "Program Terdampak"}
                  </span>
                  <span className="text-xs font-semibold text-amber-700">
                    {locale === "en" ? "Empowered Clusters" : "Klaster Penerima"}
                  </span>
                </div>
              </div>
              <p className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {yearStats.uniquePrograms}{" "}
                <span className="text-sm font-semibold text-slate-500">
                  {locale === "en" ? "Programs" : "Program"}
                </span>
              </p>
            </div>
          </div>

          {/* Interactive Distribution Showcase Slider */}
          <DistributionShowcase
            items={filteredAllocations}
            loading={loadingAllocations}
            selectedYear={selectedYear}
            onResetYear={() => setSelectedYear("all")}
          />
        </div>
      </main>

      {/* =========================================================================
          CALL TO ACTION (CTA) SECTION
      ========================================================================= */}
      <section className="pb-24 pt-4 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-amber-600 p-8 sm:p-12 lg:p-16 text-white shadow-2xl shadow-primary-900/15">
            {/* Ambient Background Decorative Glows */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-amber-400/20 blur-2xl"
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left Column: Heading & Description */}
              <div className="max-w-2xl text-left">
                <h3 className="font-heading text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-white leading-tight tracking-tight">
                  {locale === "en"
                    ? "Together, Let's Flow Endless Streams of Benefit."
                    : "Mari Bersama Alirkan Manfaat yang Tak Pernah Putus."}
                </h3>

                <p className="mt-3.5 text-sm sm:text-base text-primary-50 leading-relaxed max-w-xl font-normal">
                  {locale === "en"
                    ? "Your waqf empowers communities, educates youth, and builds lasting sustainable assets for generations."
                    : "Setiap rupiah wakaf yang Anda tunaikan akan terus berputar menghasilkan kemaslahatan produktif, pendidikan, dan kesejahteraan umat."}
                </p>
              </div>

              {/* Right Column: CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 lg:shrink-0">
                <Link
                  to="/donate"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-extrabold text-primary-800 shadow-xl hover:bg-amber-50 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition"
                >
                  <FontAwesomeIcon
                    icon={faHandHoldingHeart}
                    className="text-primary-600"
                  />
                  <span>
                    {locale === "en"
                      ? "Donate Waqf Now"
                      : "Tunaikan Wakaf Sekarang"}
                  </span>
                </Link>

                <Link
                  to="/program"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 border border-white/30 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/25 active:scale-95 transition"
                >
                  <span>
                    {locale === "en" ? "Explore Programs" : "Pilih Program"}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

export default PenyaluranPage;
