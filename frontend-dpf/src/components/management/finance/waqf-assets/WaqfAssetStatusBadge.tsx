import React from "react";
import { formatStatusLabel } from "@/utils/finance/waqfAssetDisplay";

interface WaqfAssetStatusBadgeProps {
  status?: string | null;
  className?: string;
}

export const WaqfAssetStatusBadge: React.FC<WaqfAssetStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const norm = (status || "").toLowerCase().trim();
  const label = formatStatusLabel(status);

  let colorClass = "bg-slate-600 text-white";

  switch (norm) {
    case "active":
      colorClass = "bg-brandGreen-500 text-white";
      break;
    case "disposed":
      colorClass = "bg-slate-700 text-white";
      break;
    case "transferred":
      colorClass = "bg-brandPurple-500 text-white";
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
