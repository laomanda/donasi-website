import React from "react";
import { formatEconomicUseLabel } from "@/utils/finance/waqfAssetDisplay";

interface WaqfAssetEconomicUseBadgeProps {
  economicUse?: "productive" | "social" | "mixed" | string | null;
  percentage?: number | null;
  className?: string;
}

export const WaqfAssetEconomicUseBadge: React.FC<WaqfAssetEconomicUseBadgeProps> = ({
  economicUse,
  percentage,
  className = "",
}) => {
  const norm = (economicUse || "").toLowerCase().trim();
  const label = formatEconomicUseLabel(economicUse, percentage);

  let colorClass = "bg-slate-600 text-white";

  switch (norm) {
    case "productive":
      colorClass = "bg-brandGreen-500 text-white";
      break;
    case "social":
      colorClass = "bg-brandBlueTeal-500 text-white";
      break;
    case "mixed":
      colorClass = "bg-brandWarmOrange-500 text-white";
      break;
    default:
      colorClass = "bg-slate-600 text-white";
      break;
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-xs ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
};
