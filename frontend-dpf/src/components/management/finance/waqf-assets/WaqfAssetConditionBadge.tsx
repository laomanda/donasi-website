import React from "react";
import { formatConditionLabel } from "@/utils/finance/waqfAssetDisplay";

interface WaqfAssetConditionBadgeProps {
  condition?: string | null;
  className?: string;
}

export const WaqfAssetConditionBadge: React.FC<WaqfAssetConditionBadgeProps> = ({
  condition,
  className = "",
}) => {
  const norm = (condition || "").toLowerCase().trim();
  const label = formatConditionLabel(condition);

  let colorClass = "bg-slate-600 text-white";

  switch (norm) {
    case "excellent":
    case "sangat baik":
      colorClass = "bg-brandGreen-500 text-white";
      break;
    case "good":
    case "baik":
      colorClass = "bg-brandBlueTeal-500 text-white";
      break;
    case "under_maintenance":
    case "under_repair":
    case "pemeliharaan":
      colorClass = "bg-brandWarmOrange-500 text-white";
      break;
    case "damaged":
    case "rusak":
      colorClass = "bg-red-600 text-white";
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
