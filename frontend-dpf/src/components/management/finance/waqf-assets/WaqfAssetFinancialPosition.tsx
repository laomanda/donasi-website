import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faChartLine,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
import type { WaqfAssetItem } from "@/types/finance";

interface WaqfAssetFinancialPositionProps {
  asset: WaqfAssetItem;
}

const formatCurrency = (val?: number | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
};

export const WaqfAssetFinancialPosition: React.FC<WaqfAssetFinancialPositionProps> = ({
  asset,
}) => {
  const acqVal = asset.acquisition_value ?? asset.acquisition_cost ?? 0;
  const depVal = asset.accumulated_depreciation ?? 0;
  const bookVal = asset.book_value ?? 0;

  const cards = [
    {
      label: "Nilai Perolehan",
      value: formatCurrency(acqVal),
      subtext: "Biaya perolehan aset historis",
      icon: faCoins,
      accentBorder: "border-l-brandGreen-500",
      iconColor: "text-brandGreen-500",
    },
    {
      label: "Akumulasi Penyusutan",
      value: formatCurrency(depVal),
      subtext: "Total depresiasi diakui hingga periode ini",
      icon: faChartLine,
      accentBorder: "border-l-brandWarmOrange-500",
      iconColor: "text-brandWarmOrange-500",
    },
    {
      label: "Nilai Buku Saat Ini",
      value: formatCurrency(bookVal),
      subtext: "Nilai buku bersih aset wakaf",
      icon: faScaleBalanced,
      accentBorder: "border-l-brandPurple-500",
      iconColor: "text-brandPurple-500",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
          <FontAwesomeIcon icon={faScaleBalanced} className="text-xs" />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
            Posisi Nilai Finansial
          </h2>
          <p className="text-[11px] text-slate-500">
            Nilai perolehan historis, akumulasi penyusutan, dan posisi nilai buku bersih.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className={`flex items-start justify-between rounded-xl border border-slate-200 border-l-4 ${c.accentBorder} bg-slate-50/50 p-4`}
          >
            <div className="space-y-1 min-w-0 pr-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                {c.label}
              </span>
              <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-poppins truncate tabular-nums">
                {c.value}
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                {c.subtext}
              </span>
            </div>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs ${c.iconColor}`}
            >
              <FontAwesomeIcon icon={c.icon} className="text-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
