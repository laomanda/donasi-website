import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faBuildingColumns,
  faShareNodes,
  faCircleCheck,
  faChevronLeft,
  faChevronRight,
  faFilter,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
import {
  type HomeStats,
  type PublicFinancePayload,
  formatCurrency,
  AnimatedCounter,
} from "./LandingUI";

interface MonthlyRowaSectionProps {
  stats?: HomeStats | null;
  finance?: PublicFinancePayload | null;
  locale?: "id" | "en";
  selectedYear?: string;
}

type RealizationRow = {
  key: string | number;
  label: string;
  waqf_collected: number;
  collected: number;
  distributed: number;
  expense: number;
  ywdp_ratio?: number | null;
  ywdp_ratio_status?: string | null;
  rowa?: number | null;
  rowa_status?: string | null;
};

const monthNamesId = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const monthNamesEn = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getMonthLabel = (m: number, locale: "id" | "en", explicitName?: string) => {
  if (explicitName) return explicitName;
  const list = locale === "en" ? monthNamesEn : monthNamesId;
  return list[m - 1] ?? `Bulan ${m}`;
};

export function MonthlyRowaSection({
  stats,
  finance,
  locale = "id",
  selectedYear = "all",
}: MonthlyRowaSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const itemsPerPage = 6;

  // Normalized monthly realization rows from canonical finance payload, fallback to stats.monthly_trends
  const monthlyList: RealizationRow[] = useMemo(() => {
    if (finance?.monthly_realization && finance.monthly_realization.length > 0) {
      return finance.monthly_realization.map((item) => ({
        key: item.month,
        label: getMonthLabel(item.month, locale, item.month_name),
        waqf_collected: Number(item.total_waqf_collected ?? item.waqf_collected) || 0,
        collected: Number(item.collected) || 0,
        distributed: Number(item.distributed) || 0,
        expense: Number(item.total_expense ?? item.expense) || 0,
        ywdp_ratio: item.ywdp_ratio !== undefined ? item.ywdp_ratio : (item.rowa ?? null),
        ywdp_ratio_status: item.ywdp_ratio_status ?? item.rowa_status ?? "expense_base_unavailable",
        rowa: item.rowa ?? null,
        rowa_status: item.rowa_status ?? "monthly_asset_basis_unavailable",
      }));
    }

    if (stats?.monthly_trends && stats.monthly_trends.length > 0) {
      return stats.monthly_trends.map((item) => ({
        key: item.month_key || item.month_name,
        label: item.label || item.month_name,
        waqf_collected: Number(item.total_waqf_collected ?? item.waqf_collected ?? item.collected) || 0,
        collected: Number(item.collected) || 0,
        distributed: Number(item.allocated) || 0,
        expense: Number(item.total_expense ?? item.expense) || 0,
        ywdp_ratio: item.ywdp_ratio !== undefined ? item.ywdp_ratio : (item.rowa ?? null),
        ywdp_ratio_status: item.ywdp_ratio_status ?? "expense_base_unavailable",
        rowa: null,
        rowa_status: "monthly_asset_basis_unavailable",
      }));
    }

    return [];
  }, [finance, stats, locale]);

  // Reset page when year or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, filterActiveOnly]);

  // Sort reverse chronological (newest first)
  const sortedTrends = useMemo(() => {
    const reversed = [...monthlyList].reverse();
    if (filterActiveOnly) {
      return reversed.filter(
        (m) => m.waqf_collected > 0 || m.distributed > 0 || m.expense > 0
      );
    }
    return reversed;
  }, [monthlyList, filterActiveOnly]);

  // Verified canonical totals from finance payload (presentation only, no frontend reduce)
  const totalWaqfCollected = Number(finance?.total_waqf_collected ?? 0);
  const totalDistributed = Number(finance?.total_distributed ?? stats?.total_distributed ?? Number(stats?.amount_allocated ?? 0));
  const totalExpense = Number(finance?.total_expense ?? stats?.total_expense ?? 0);
  const programDistributions = Number(finance?.program_distributions ?? stats?.program_distributions ?? 0);
  const ywdpRatio = finance?.ywdp_ratio !== undefined ? finance.ywdp_ratio : (finance?.rowa !== undefined ? finance.rowa : (stats?.ywdp_ratio ?? stats?.rowa ?? null));

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
              <FontAwesomeIcon icon={faCircleCheck} className="text-brandGreen-700" />
              <span>
                {locale === "en" ? "Verified Financial Realization" : "Realisasi Keuangan Terverifikasi"}
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {locale === "en"
                ? "Monthly Realization Table"
                : "Tabel Realisasi Bulanan"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {locale === "en"
                ? "Transparent monthly record of waqf collections and program distributions based on posted journal transactions."
                : "Transparansi bulanan penerimaan dana wakaf dan realisasi penyaluran kepada penerima manfaat berbasis transaksi jurnal terposting."}
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
              {locale === "en" ? "All Months" : "Semua Bulan"} ({monthlyList.length})
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

        {/* 4 Executive KPI Cards (Verified Canonical Metrics Only) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Card 1: Total Wakaf Terhimpun */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs hover:border-emerald-300 transition space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Total Waqf Collected" : "Total Wakaf Terhimpun"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <FontAwesomeIcon icon={faBuildingColumns} className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <p className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                <AnimatedCounter
                  value={totalWaqfCollected}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {locale === "en" ? "Official waqf collections (4100 series)" : "Penerimaan wakaf resmi (Akun 4100)"}
              </p>
            </div>
          </div>

          {/* Card 2: Penyaluran (Dana Disalurkan) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs hover:border-sky-300 transition space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Funds Distributed" : "Dana Disalurkan"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                <FontAwesomeIcon icon={faReceipt} className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <p className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                <AnimatedCounter
                  value={totalDistributed}
                  formatter={(val) => formatCurrency(val, locale)}
                />
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {locale === "en" ? "Disbursed to beneficiaries" : "Penyaluran manfaat program"}
              </p>
            </div>
          </div>

          {/* Card 3: Biaya Pengeluaran (Beban Nazhir + Operasional) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs hover:border-amber-300 transition space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Operating & Nazhir Expense" : "Biaya Pengeluaran"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                <FontAwesomeIcon icon={faScaleBalanced} className="text-xs sm:text-sm" />
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
                {locale === "en" ? "Beban Nazhir + Operasional" : "Beban Nazhir + Operasional"}
              </p>
            </div>
          </div>

          {/* Card 4: Penyaluran Program (Disbursement Transactions Count) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs hover:border-indigo-300 transition space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Disbursements" : "Penyaluran Program"}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <FontAwesomeIcon icon={faShareNodes} className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <p className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                <AnimatedCounter
                  value={programDistributions}
                />
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {locale === "en" ? "Disbursement transactions" : "Transaksi penyaluran"}
              </p>
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
                  ? "Monthly Inflow & Distribution Table"
                  : "Tabel Penerimaan & Penyaluran Bulanan"}
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

          {/* Desktop & Tablet Table View (Bulan | Wakaf Terhimpun | Penyaluran | Biaya Pengeluaran | Rasio YWDP) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-5 px-6 sm:px-8 w-[20%]">
                    {locale === "en" ? "Month" : "Bulan"}
                  </th>
                  <th className="py-5 px-6 sm:px-8 w-[20%] text-right">
                    {locale === "en" ? "Waqf Collected" : "Wakaf Terhimpun"}
                  </th>
                  <th className="py-5 px-6 sm:px-8 w-[20%] text-right">
                    {locale === "en" ? "Distributed" : "Penyaluran"}
                  </th>
                  <th className="py-5 px-6 sm:px-8 w-[20%] text-right">
                    {locale === "en" ? "Expenses" : "Biaya Pengeluaran"}
                  </th>
                  <th className="py-5 px-6 sm:px-8 w-[20%] text-right">
                    <span
                      className="cursor-help inline-flex items-center gap-1"
                      title="Rasio internal YWDP: total wakaf terhimpun dibanding biaya pengeluaran."
                    >
                      {locale === "en" ? "YWDP Ratio (RoWA)" : "Rasio YWDP (RoWA)"}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTrends.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                      {locale === "en"
                        ? "No financial records found for this period."
                        : "Tidak ada catatan transaksi untuk filter ini."}
                    </td>
                  </tr>
                ) : (
                  paginatedTrends.map((item, idx) => {
                    const waqf = item.waqf_collected;
                    const alloc = item.distributed;
                    const exp = item.expense;

                    return (
                      <tr
                        key={item.key || idx}
                        className="transition-colors hover:bg-slate-50/80 group"
                      >
                        {/* Bulan */}
                        <td className="py-5 px-6 sm:px-8 font-semibold text-slate-900 whitespace-nowrap">
                          {item.label}
                        </td>

                        {/* Wakaf Terhimpun */}
                        <td className="py-5 px-6 sm:px-8 text-right font-medium whitespace-nowrap font-mono tabular-nums">
                          {waqf > 0 ? (
                            <span className="text-emerald-700 font-bold">
                              {formatCurrency(waqf, locale)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">
                              {formatCurrency(0, locale)}
                            </span>
                          )}
                        </td>

                        {/* Penyaluran */}
                        <td className="py-5 px-6 sm:px-8 text-right font-medium whitespace-nowrap font-mono tabular-nums">
                          {alloc > 0 ? (
                            <span className="text-sky-700 font-bold">
                              {formatCurrency(alloc, locale)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">
                              {formatCurrency(0, locale)}
                            </span>
                          )}
                        </td>

                        {/* Biaya Pengeluaran */}
                        <td className="py-5 px-6 sm:px-8 text-right font-medium whitespace-nowrap font-mono tabular-nums">
                          {exp > 0 ? (
                            <span className="text-amber-700 font-bold">
                              {formatCurrency(exp, locale)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">
                              {formatCurrency(0, locale)}
                            </span>
                          )}
                        </td>

                        {/* Rasio YWDP (RoWA) */}
                        <td className="py-5 px-6 sm:px-8 text-right font-medium whitespace-nowrap font-mono tabular-nums">
                          {item.ywdp_ratio !== null && item.ywdp_ratio !== undefined ? (
                            <span className="text-purple-700 font-bold">
                              {item.ywdp_ratio.toFixed(2)}%
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-slate-400 text-xs italic cursor-help"
                              title="Belum ada beban pengeluaran pada bulan ini."
                            >
                              {locale === "en" ? "Unavailable" : "Belum tersedia"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Table Footer with Canonical Totals */}
              {monthlyList.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-xs sm:text-sm text-slate-900">
                    <td className="py-5 px-6 sm:px-8 uppercase tracking-wider font-semibold text-slate-600">
                      {locale === "en" ? "Total Overall" : "Total Akumulasi"}
                    </td>
                    <td className="py-5 px-6 sm:px-8 text-right text-emerald-800 font-extrabold font-mono tabular-nums">
                      {formatCurrency(totalWaqfCollected, locale)}
                    </td>
                    <td className="py-5 px-6 sm:px-8 text-right text-sky-800 font-extrabold font-mono tabular-nums">
                      {formatCurrency(totalDistributed, locale)}
                    </td>
                    <td className="py-5 px-6 sm:px-8 text-right text-amber-800 font-extrabold font-mono tabular-nums">
                      {formatCurrency(totalExpense, locale)}
                    </td>
                    <td className="py-5 px-6 sm:px-8 text-right text-purple-800 font-extrabold font-mono tabular-nums">
                      {ywdpRatio !== null && ywdpRatio !== undefined ? (
                        `${ywdpRatio.toFixed(2)}%`
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Mobile Card List View (Bulan | Wakaf Terhimpun | Penyaluran | Biaya | Rasio) */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedTrends.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {locale === "en"
                  ? "No financial records found for this period."
                  : "Tidak ada catatan transaksi untuk filter ini."}
              </div>
            ) : (
              paginatedTrends.map((item, idx) => {
                const waqf = item.waqf_collected;
                const alloc = item.distributed;
                const exp = item.expense;

                return (
                  <div key={item.key || idx} className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-bold text-slate-900">
                        {item.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Wakaf Terhimpun</span>
                        <span className="font-mono font-bold text-emerald-800">
                          {formatCurrency(waqf, locale)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Penyaluran</span>
                        <span className="font-mono font-bold text-sky-700">
                          {formatCurrency(alloc, locale)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Biaya Pengeluaran</span>
                        <span className="font-mono font-bold text-amber-700">
                          {formatCurrency(exp, locale)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Rasio YWDP</span>
                        {item.ywdp_ratio !== null && item.ywdp_ratio !== undefined ? (
                          <span className="font-mono font-bold text-purple-700">
                            {item.ywdp_ratio.toFixed(2)}%
                          </span>
                        ) : (
                          <span
                            className="text-[11px] text-slate-400 italic block cursor-help"
                            title="Belum ada beban pengeluaran pada bulan ini."
                          >
                            {locale === "en" ? "Unavailable" : "Belum tersedia"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Mobile Total Card */}
            {monthlyList.length > 0 && (
              <div className="p-5 sm:p-6 bg-slate-100/80 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>TOTAL KESELURUHAN</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Wakaf Terhimpun</span>
                    <span className="font-mono font-bold text-emerald-800">{formatCurrency(totalWaqfCollected, locale)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Disalurkan</span>
                    <span className="font-mono font-bold text-sky-800">{formatCurrency(totalDistributed, locale)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Biaya Pengeluaran</span>
                    <span className="font-mono font-bold text-amber-800">{formatCurrency(totalExpense, locale)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Rasio YWDP (RoWA)</span>
                    <span className="font-mono font-bold text-purple-800">
                      {ywdpRatio !== null && ywdpRatio !== undefined ? `${ywdpRatio.toFixed(2)}%` : "—"}
                    </span>
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
