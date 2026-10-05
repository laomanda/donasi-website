import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faCoins,
  faChartLine,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetReportSummary } from "@/types/finance";

interface WaqfAssetsSummaryProps {
  summary: WaqfAssetReportSummary;
  loading?: boolean;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export const WaqfAssetsSummary: React.FC<WaqfAssetsSummaryProps> = ({
  summary,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-xs h-28"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Aset Wakaf",
      value: `${summary.total_assets} Unit`,
      subtext: "Aset terdaftar di sistem",
      icon: faBuildingColumns,
      accentBorder: "border-l-brandBlueTeal-500",
      iconColor: "text-brandBlueTeal-500",
      iconBg: "bg-slate-100",
    },
    {
      label: "Total Nilai Perolehan",
      value: formatCurrency(summary.total_acquisition_value),
      subtext: "Biaya perolehan historis",
      icon: faCoins,
      accentBorder: "border-l-brandGreen-500",
      iconColor: "text-brandGreen-500",
      iconBg: "bg-slate-100",
    },
    {
      label: "Akumulasi Penyusutan",
      value: formatCurrency(summary.total_accumulated_depreciation),
      subtext: "Total depresiasi diakui",
      icon: faChartLine,
      accentBorder: "border-l-brandWarmOrange-500",
      iconColor: "text-brandWarmOrange-500",
      iconBg: "bg-slate-100",
    },
    {
      label: "Total Nilai Buku",
      value: formatCurrency(summary.total_book_value),
      subtext: "Posisi aset bersih akhir",
      icon: faScaleBalanced,
      accentBorder: "border-l-brandPurple-500",
      iconColor: "text-brandPurple-500",
      iconBg: "bg-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className={`flex items-start justify-between rounded-2xl border border-slate-200 border-l-4 ${c.accentBorder} bg-white p-4 sm:p-5 shadow-xs`}
        >
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block truncate">
              {c.label}
            </span>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-poppins truncate">
              {c.value}
            </div>
            <span className="text-[11px] text-slate-400 block truncate">
              {c.subtext}
            </span>
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.iconBg} ${c.iconColor}`}
          >
            <FontAwesomeIcon icon={c.icon} className="text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
};
