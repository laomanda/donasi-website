import { useState, useMemo, useEffect } from "react";
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
  faBuildingColumns,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  type HomeStats,
  formatCurrency,
  pickLocale,
  AnimatedCounter,
} from "./LandingUI";

interface TransparencySectionProps {
  stats?: HomeStats | null;
  locale?: "id" | "en";
  t: (key: string, fallback?: string) => string;
}

export function TransparencySection({ stats, locale = "id", t }: TransparencySectionProps) {
  const [activeTab, setActiveTab] = useState<"program" | "trends">("program");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalCollected = Number(stats?.amount_collected ?? 0);
  const totalAllocated = Number(stats?.amount_allocated ?? 0);
  const availableBalance = Math.max(0, totalCollected - totalAllocated);
  const distributionRatio = totalCollected > 0 ? (totalAllocated / totalCollected) * 100 : 0;

  const programAllocations = stats?.program_allocations ?? [];
  const monthlyTrends = stats?.monthly_trends ?? [];

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

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
      const title = pickLocale(item.title, item.title_en, locale).toLowerCase();
      const cat = pickLocale(item.category, item.category_en, locale);
      const matchesSearch = !searchQuery.trim() || title.includes(searchQuery.toLowerCase().trim());
      const matchesCat = categoryFilter === "all" || cat === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [programAllocations, searchQuery, categoryFilter, locale]);

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const paginatedPrograms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPrograms.slice(start, start + itemsPerPage);
  }, [filteredPrograms, currentPage, itemsPerPage]);

  // Find max value in monthly trends for chart scaling
  const maxTrendValue = useMemo(() => {
    if (!monthlyTrends.length) return 1000000;
    const maxVal = Math.max(
      ...monthlyTrends.map((m) => Math.max(Number(m.collected || 0), Number(m.allocated || 0)))
    );
    return maxVal > 0 ? maxVal * 1.15 : 1000000;
  }, [monthlyTrends]);

  return (
    <section id="transparansi" className="relative bg-slate-50 py-16 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            {t("landing.transparency.title")}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t("landing.transparency.subtitle")}
          </p>
        </div>

        {/* 3 Main KPI Summary Cards - Clean & Professional */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Penghimpunan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Waqf Funds Collected" : "Dana Wakaf Dihimpun"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-700 border border-brandGreen-100">
                <FontAwesomeIcon icon={faHandHoldingHeart} className="text-sm" />
              </div>
            </div>

            <div className="mt-5">
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                <AnimatedCounter
                  value={totalCollected}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                <AnimatedCounter value={stats?.total_donations ?? 0} /> {locale === "en" ? "verified donation transactions" : "transaksi donatur terverifikasi"}
              </p>
            </div>
          </div>

          {/* Card 2: Penyaluran */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Funds Distributed to Partners" : "Dana Disalurkan ke Program"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                <FontAwesomeIcon icon={faReceipt} className="text-sm" />
              </div>
            </div>

            <div className="mt-5">
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                <AnimatedCounter
                  value={totalAllocated}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                <AnimatedCounter value={stats?.total_allocations ?? 0} /> {locale === "en" ? "allocation disbursements executed" : "kali kegiatan penyaluran amanah"}
              </p>
            </div>
          </div>

          {/* Card 3: Saldo Tersedia & Rasio */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-slate-300 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Available Balance for Distribution" : "Saldo Siap Disalurkan"}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60">
                <FontAwesomeIcon icon={faVault} className="text-sm" />
              </div>
            </div>

            <div className="mt-5">
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                <AnimatedCounter
                  value={availableBalance}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <FontAwesomeIcon icon={faArrowTrendUp} className="text-[11px] text-brandGreen-600" />
                <span>
                  {distributionRatio.toFixed(1)}% {locale === "en" ? "distribution ratio from collection" : "rasio dana tersalurkan dari terhimpun"}
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
              <FontAwesomeIcon icon={faListCheck} className="text-brandGreen-600" />
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
              <FontAwesomeIcon icon={faChartLine} className="text-sky-600" />
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("landing.transparency.searchPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-brandGreen-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brandGreen-500/15"
                />
              </div>

              {categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-56 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 focus:border-brandGreen-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brandGreen-500/15 cursor-pointer"
                  >
                    <option value="all">{t("landing.transparency.allCategories")}</option>
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
                  {locale === "en" ? "No program data found" : "Tidak ada data program yang cocok"}
                </p>
                {(searchQuery || categoryFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                    className="mt-3 text-xs font-semibold text-brandGreen-600 hover:text-brandGreen-700"
                  >
                    {locale === "en" ? "Reset filters" : "Reset filter pencarian"}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedPrograms.map((prog, index) => {
                    const title = pickLocale(prog.title, prog.title_en, locale);
                    const category = pickLocale(prog.category, prog.category_en, locale);
                    const collected = Number(prog.collected_amount || 0);
                    const allocated = Number(prog.allocated_amount || 0);
                    const progPercent = collected > 0 ? Math.min(100, (allocated / collected) * 100) : 0;
                    const remaining = Math.max(0, collected - allocated);

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
                              {prog.allocation_count} {locale === "en" ? "disbursements" : "penyaluran"}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-heading text-base font-bold text-slate-900 line-clamp-2" title={title}>
                              {title}
                            </h3>
                          </div>

                          {/* Progress Bar of Allocation */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-500">
                                {locale === "en" ? "Penyaluran" : "Tersalurkan"} ({progPercent.toFixed(0)}%)
                              </span>
                              <span className="text-slate-900 font-bold">
                                {formatCurrency(allocated, locale)}
                              </span>
                            </div>

                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-brandGreen-600 transition-all duration-300"
                                style={{ width: `${Math.max(progPercent > 0 ? 5 : 0, progPercent)}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span>{locale === "en" ? "Total Dihimpun:" : "Dana Terhimpun:"}</span>
                              <span className="font-semibold text-slate-800">{formatCurrency(collected, locale)}</span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>{locale === "en" ? "Saldo Siap Salur:" : "Saldo Belum Salur:"}</span>
                              <span className="font-semibold text-brandGreen-700">{formatCurrency(remaining, locale)}</span>
                            </div>
                          </div>
                        </div>

                        {prog.slug && (
                          <div className="mt-5 pt-3 border-t border-slate-100">
                            <Link
                              to={`/program/${prog.slug}`}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition hover:bg-brandGreen-600 hover:text-white group"
                            >
                              <span>{locale === "en" ? "Program View" : "Lihat Program"}</span>
                              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition group-hover:translate-x-1" />
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
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                        <span>{locale === "en" ? "Prev" : "Sebelumnya"}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                          <button
                            key={pg}
                            type="button"
                            onClick={() => setCurrentPage(pg)}
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
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span>{locale === "en" ? "Next" : "Berikutnya"}</span>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Monthly Trends Bar Chart */}
        {activeTab === "trends" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                  {locale === "en" ? "Monthly Collection vs Distribution Trend (Last 6 Months)" : "Grafik Tren Penghimpunan vs Penyaluran (6 Bulan Terakhir)"}
                </h3>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-md bg-brandGreen-500" />
                  <span className="text-slate-700">{locale === "en" ? "Penghimpunan" : "Dana Dihimpun"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-md bg-sky-500" />
                  <span className="text-slate-700">{locale === "en" ? "Penyaluran" : "Dana Disalurkan"}</span>
                </div>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization */}
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-6 gap-2 sm:gap-6 items-end h-64 border-b border-slate-200 pb-4">
                {monthlyTrends.map((month) => {
                  const collectedHeight = Math.min(100, (month.collected / maxTrendValue) * 100);
                  const allocatedHeight = Math.min(100, (month.allocated / maxTrendValue) * 100);

                  return (
                    <div key={month.month_key} className="flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip on Hover */}
                      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 w-44 rounded-xl bg-slate-900 p-2.5 text-center text-white shadow-xl">
                        <p className="text-[11px] font-bold text-white">{month.label}</p>
                        <p className="text-[10px] text-slate-200">
                          Masuk: <span className="font-bold text-white">{formatCurrency(month.collected, locale)}</span>
                        </p>
                        <p className="text-[10px] text-slate-200">
                          Salur: <span className="font-bold text-white">{formatCurrency(month.allocated, locale)}</span>
                        </p>
                      </div>

                      {/* Side-by-side Bars */}
                      <div className="flex items-end gap-1 sm:gap-2 w-full justify-center h-full">
                        {/* Collected Bar */}
                        <div
                          className="w-3 sm:w-7 rounded-t-lg bg-brandGreen-500 hover:bg-brandGreen-400 transition-all duration-500 cursor-pointer"
                          style={{ height: `${Math.max(collectedHeight > 0 ? 6 : 2, collectedHeight)}%` }}
                          title={`Dihimpun: ${formatCurrency(month.collected, locale)}`}
                        />
                        {/* Allocated Bar */}
                        <div
                          className="w-3 sm:w-7 rounded-t-lg bg-sky-500 hover:bg-sky-400 transition-all duration-500 cursor-pointer"
                          style={{ height: `${Math.max(allocatedHeight > 0 ? 6 : 2, allocatedHeight)}%` }}
                          title={`Disalurkan: ${formatCurrency(month.allocated, locale)}`}
                        />
                      </div>

                      {/* Month Label */}
                      <span className="mt-3 text-[11px] sm:text-xs font-bold text-slate-600 truncate max-w-full">
                        {month.label.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
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
                    {locale === "en" ? "Transparent & Accountable Nazhir Guarantee" : "Jaminan Akuntabilitas Nazhir DPF"}
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
                <span>{locale === "en" ? "Salurkan Wakaf Sekarang" : "Salurkan Wakaf"}</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TransparencySection;
