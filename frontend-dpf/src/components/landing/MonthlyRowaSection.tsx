import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingHeart,
  faReceipt,
  faCoins,
  faScaleBalanced,
  faCircleCheck,
  faArrowTrendUp,
  faChevronLeft,
  faChevronRight,
  faFilter,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  type HomeStats,
  formatCurrency,
  AnimatedCounter,
} from "./LandingUI";

interface MonthlyRowaSectionProps {
  stats?: HomeStats | null;
  locale?: "id" | "en";
  selectedYear?: string;
}

export function MonthlyRowaSection({
  stats,
  locale = "id",
  selectedYear = "all",
}: MonthlyRowaSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const itemsPerPage = 6;

  const rawTrends = useMemo(() => stats?.monthly_trends ?? [], [stats?.monthly_trends]);

  // Reset page when year or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, filterActiveOnly]);

  // Sort reverse chronological (newest first)
  const sortedTrends = useMemo(() => {
    const reversed = [...rawTrends].reverse();
    if (filterActiveOnly) {
      return reversed.filter(
        (m) => (Number(m.collected) || 0) > 0 || (Number(m.allocated) || 0) > 0
      );
    }
    return reversed;
  }, [rawTrends, filterActiveOnly]);

  // Totals
  const totalCollected = useMemo(() => {
    return rawTrends.reduce((sum, m) => sum + (Number(m.collected) || 0), 0);
  }, [rawTrends]);

  const totalAllocated = useMemo(() => {
    return rawTrends.reduce((sum, m) => sum + (Number(m.allocated) || 0), 0);
  }, [rawTrends]);

  const totalExpense = useMemo(() => {
    return rawTrends.reduce((sum, m) => sum + (Number(m.expense) || 0), 0);
  }, [rawTrends]);

  const overallRowa = useMemo(() => {
    if (totalExpense > 0 && totalAllocated > 0) {
      return Number((totalAllocated / totalExpense).toFixed(2));
    }
    return 0;
  }, [totalAllocated, totalExpense]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedTrends.length / itemsPerPage));
  const paginatedTrends = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTrends.slice(start, start + itemsPerPage);
  }, [sortedTrends, currentPage, itemsPerPage]);

  return (
    <section className="bg-slate-50/70 border-t border-slate-200/80 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 lg:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-brandGreen-500/10 border border-brandGreen-500/20 px-3.5 py-1.5 text-xs font-bold text-brandGreen-800">
              <FontAwesomeIcon icon={faScaleBalanced} className="text-brandGreen-700" />
              <span>
                {locale === "en" ? "Waqf Asset Productivity Ratio" : "Rasio Produktivitas Aset Wakaf"}
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {locale === "en"
                ? "Monthly Realization & RoWA Index"
                : "Realisasi Bulanan & Indeks RoWA"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {locale === "en"
                ? "Transparent monthly ledger recording waqf collections, distributions to beneficiaries, operational costs, and the RoWA efficiency multiplier."
                : "Transparansi bulanan penerimaan wakaf, penyaluran kepada penerima manfaat, biaya pengeluaran operasional, serta indeks efisiensi RoWA (Return on Waqf Asset)."}
            </p>
          </div>

          {/* Quick Filter: All Months vs Active Only */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs w-fit shrink-0">
            <button
              type="button"
              onClick={() => setFilterActiveOnly(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                !filterActiveOnly
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {locale === "en" ? "All Months" : "Semua Bulan"} ({rawTrends.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterActiveOnly(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterActiveOnly
                  ? "bg-brandGreen-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
              <span>{locale === "en" ? "Active Only" : "Bulan Ada Transaksi"}</span>
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Card 1: Penerimaan */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs hover:border-brandGreen-300 transition space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Waqf Collected" : "Dana Dihimpun"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-700 border border-brandGreen-100">
                <FontAwesomeIcon icon={faHandHoldingHeart} className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <p className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                <AnimatedCounter
                  value={totalCollected}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {locale === "en" ? "Verified donations" : "Penerimaan wakaf"}
              </p>
            </div>
          </div>

          {/* Card 2: Penyaluran (Penerima) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs hover:border-sky-300 transition space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Distributed" : "Dana Disalurkan"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                <FontAwesomeIcon icon={faReceipt} className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <p className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                <AnimatedCounter
                  value={totalAllocated}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {locale === "en" ? "To beneficiaries" : "Untuk penerima manfaat"}
              </p>
            </div>
          </div>

          {/* Card 3: Biaya Pengeluaran */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs hover:border-amber-300 transition space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Expenses" : "Biaya Pengeluaran"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                <FontAwesomeIcon icon={faCoins} className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <p className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                <AnimatedCounter
                  value={totalExpense}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {locale === "en" ? "Operations & nazhir" : "Operasional & hak amil"}
              </p>
            </div>
          </div>

          {/* Card 4: Indeks RoWA */}
          <div className="rounded-3xl border border-brandGreen-800 bg-gradient-to-br from-brandGreen-800 via-brandGreen-900 to-slate-950 text-white p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-brandGreen-200">
                {locale === "en" ? "RoWA Ratio" : "Rasio RoWA"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
                <FontAwesomeIcon icon={faArrowTrendUp} className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <p className="font-heading text-lg sm:text-2xl font-black tracking-tight text-white">
                {overallRowa > 0 ? `${overallRowa}x` : "-"}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-brandGreen-200">
                <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-xs" />
                <span className="truncate">
                  {overallRowa >= 5
                    ? locale === "en" ? "Highly Productive" : "Sangat Produktif"
                    : overallRowa > 0
                    ? locale === "en" ? "Optimal" : "Optimal"
                    : locale === "en" ? "Preparing" : "Masa Penghimpunan"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Monthly Data Container */}
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {/* Top Bar with Pagination count and Year indicator */}
          <div className="border-b border-slate-200/80 px-6 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                {locale === "en"
                  ? "Monthly Inflow, Outflow & RoWA Table"
                  : "Tabel Penerimaan, Penyaluran & RoWA Bulanan"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {locale === "en"
                  ? `Displaying ${paginatedTrends.length} of ${sortedTrends.length} records`
                  : `Menampilkan ${paginatedTrends.length} dari ${sortedTrends.length} data bulan`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                {selectedYear && selectedYear !== "all" ? `Tahun ${selectedYear}` : "Semua Tahun"}
              </span>
            </div>
          </div>

          {/* Desktop & Tablet Table View (hidden on very small phones) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-5 px-4 sm:px-6 w-[12%]">
                    {locale === "en" ? "Month" : "Bulan"}
                  </th>
                  <th className="py-5 px-4 sm:px-6 w-[20%] text-right">
                    {locale === "en" ? "Waqf Collected" : "Dana Dihimpun"}
                  </th>
                  <th className="py-5 px-4 sm:px-6 w-[20%] text-right">
                    {locale === "en" ? "Distributed" : "Dana Disalurkan"}
                  </th>
                  <th className="py-5 px-4 sm:px-6 w-[18%] text-right">
                    {locale === "en" ? "Expenses" : "Biaya Pengeluaran"}
                  </th>
                  <th className="py-5 px-4 sm:px-6 w-[12%] text-center">
                    {locale === "en" ? "RoWA" : "Rasio RoWA"}
                  </th>
                  <th className="py-5 px-4 sm:px-6 w-[18%] text-center">
                    {locale === "en" ? "Status" : "Keterangan"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTrends.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                      {locale === "en"
                        ? "No financial records found for this period."
                        : "Tidak ada catatan transaksi untuk filter ini."}
                    </td>
                  </tr>
                ) : (
                  paginatedTrends.map((item, idx) => {
                    const coll = Number(item.collected) || 0;
                    const alloc = Number(item.allocated) || 0;
                    const exp = Number(item.expense) || 0;
                    const rowaVal = item.rowa ?? (exp > 0 && alloc > 0 ? Number((alloc / exp).toFixed(2)) : 0);

                    return (
                      <tr
                        key={item.month_key || idx}
                        className="transition-colors hover:bg-slate-50/80 group"
                      >
                        {/* Bulan */}
                        <td className="py-5 px-4 sm:px-6 font-semibold text-slate-900 whitespace-nowrap">
                          {item.label || item.month_name}
                        </td>

                        {/* Penerimaan */}
                        <td className="py-5 px-4 sm:px-6 text-right font-medium whitespace-nowrap font-mono tabular-nums">
                          {coll > 0 ? (
                            <span className="text-emerald-700 font-bold">
                              {formatCurrency(coll, locale)}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal">-</span>
                          )}
                        </td>

                        {/* Penyaluran */}
                        <td className="py-5 px-4 sm:px-6 text-right font-medium whitespace-nowrap font-mono tabular-nums">
                          {alloc > 0 ? (
                            <span className="text-sky-700 font-bold">
                              {formatCurrency(alloc, locale)}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal">-</span>
                          )}
                        </td>

                        {/* Biaya Pengeluaran */}
                        <td className="py-5 px-4 sm:px-6 text-right font-medium whitespace-nowrap font-mono tabular-nums">
                          {exp > 0 ? (
                            <span className="text-amber-700 font-bold">
                              {formatCurrency(exp, locale)}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal">-</span>
                          )}
                        </td>

                        {/* RoWA */}
                        <td className="py-5 px-4 sm:px-6 text-center whitespace-nowrap">
                          {alloc > 0 && exp > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brandGreen-50 border border-brandGreen-200/80 px-2.5 py-0.5 text-xs font-extrabold text-brandGreen-800 font-heading">
                              <FontAwesomeIcon icon={faArrowTrendUp} className="text-[9px]" />
                              <span>{rowaVal}x</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono text-sm">-</span>
                          )}
                        </td>

                        {/* Status (Consistently Styled Pills) */}
                        <td className="py-5 px-4 sm:px-6 text-center whitespace-nowrap">
                          {alloc > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-2.5 py-0.5 text-[11px] font-semibold">
                              <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                              <span>{locale === "en" ? "Distributed" : "Tersalurkan Optimal"}</span>
                            </span>
                          ) : coll > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/70 px-2.5 py-0.5 text-[11px] font-semibold">
                              <FontAwesomeIcon icon={faHandHoldingHeart} className="text-[10px]" />
                              <span>{locale === "en" ? "Collecting" : "Penghimpunan"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200/60 px-2.5 py-0.5 text-[11px] font-medium">
                              <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                              <span>{locale === "en" ? "No Activity" : "Belum Ada Realisasi"}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Table Footer */}
              {rawTrends.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-xs sm:text-sm text-slate-900">
                    <td className="py-5 px-4 sm:px-6 uppercase tracking-wider font-semibold text-slate-600">
                      {locale === "en" ? "Total Overall" : "Total Akumulasi"}
                    </td>
                    <td className="py-5 px-4 sm:px-6 text-right text-emerald-800 font-extrabold font-mono tabular-nums">
                      {formatCurrency(totalCollected, locale)}
                    </td>
                    <td className="py-5 px-4 sm:px-6 text-right text-sky-800 font-extrabold font-mono tabular-nums">
                      {formatCurrency(totalAllocated, locale)}
                    </td>
                    <td className="py-5 px-4 sm:px-6 text-right text-amber-800 font-extrabold font-mono tabular-nums">
                      {formatCurrency(totalExpense, locale)}
                    </td>
                    <td className="py-5 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brandGreen-800 text-white px-3 py-1 font-heading text-xs font-black shadow-2xs">
                        {overallRowa > 0 ? `${overallRowa}x` : "-"}
                      </span>
                    </td>
                    <td className="py-5 px-4 sm:px-6 text-center text-xs font-medium text-slate-500">
                      {locale === "en" ? "Audited" : "Data Terverifikasi"}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Mobile Card List View (Optimized for Small Screens) */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedTrends.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {locale === "en"
                  ? "No financial records found for this period."
                  : "Tidak ada catatan transaksi untuk filter ini."}
              </div>
            ) : (
              paginatedTrends.map((item, idx) => {
                const coll = Number(item.collected) || 0;
                const alloc = Number(item.allocated) || 0;
                const exp = Number(item.expense) || 0;
                const rowaVal = item.rowa ?? (exp > 0 && alloc > 0 ? Number((alloc / exp).toFixed(2)) : 0);

                return (
                  <div key={item.month_key || idx} className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-bold text-slate-900">
                        {item.label || item.month_name}
                      </span>
                      {alloc > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-2 py-0.5 text-[10px] font-semibold">
                          <FontAwesomeIcon icon={faCircleCheck} className="text-[9px]" />
                          <span>{locale === "en" ? "Distributed" : "Tersalurkan"}</span>
                        </span>
                      ) : coll > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/70 px-2 py-0.5 text-[10px] font-semibold">
                          <FontAwesomeIcon icon={faHandHoldingHeart} className="text-[9px]" />
                          <span>{locale === "en" ? "Collecting" : "Penghimpunan"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium">
                          <span>{locale === "en" ? "Idle" : "Belum Ada"}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Dihimpun</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {coll > 0 ? formatCurrency(coll, locale) : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Disalurkan</span>
                        <span className="font-mono font-bold text-sky-700">
                          {alloc > 0 ? formatCurrency(alloc, locale) : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Biaya Pengeluaran</span>
                        <span className="font-mono font-medium text-amber-700">
                          {exp > 0 ? formatCurrency(exp, locale) : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Rasio RoWA</span>
                        <span className="font-heading font-extrabold text-brandGreen-800">
                          {alloc > 0 && exp > 0 ? `${rowaVal}x` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Mobile Total Card */}
            {rawTrends.length > 0 && (
              <div className="p-5 sm:p-6 bg-slate-100/80 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>TOTAL KESELURUHAN</span>
                  <span className="rounded-full bg-brandGreen-800 text-white px-2 py-0.5 text-[11px] font-bold">
                    RoWA: {overallRowa > 0 ? `${overallRowa}x` : "-"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Dihimpun</span>
                    <span className="font-mono font-bold text-emerald-800">{formatCurrency(totalCollected, locale)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Disalurkan</span>
                    <span className="font-mono font-bold text-sky-800">{formatCurrency(totalAllocated, locale)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200/80 px-6 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <p className="text-xs text-slate-500 font-medium">
                {locale === "en"
                  ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, sortedTrends.length)} of ${sortedTrends.length} months`
                  : `Menampilkan ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, sortedTrends.length)} dari total ${sortedTrends.length} bulan`}
              </p>

              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-[9px]" />
                  <span>{locale === "en" ? "Prev" : "Sebelumnya"}</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentPage === pg
                          ? "bg-brandGreen-700 text-white shadow-2xs"
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
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{locale === "en" ? "Next" : "Berikutnya"}</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default MonthlyRowaSection;
