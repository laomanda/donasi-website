import React from "react";
import { formatNoteStatusLabel } from "@/utils/finance/financialNotesDisplay";

interface FinancialNoteStatusBadgeProps {
  status?: string | null;
  className?: string;
}

export const FinancialNoteStatusBadge: React.FC<FinancialNoteStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const norm = (status || "").toLowerCase().trim();
  const label = formatNoteStatusLabel(status);

  let colorClass = "bg-slate-600 text-white";

  switch (norm) {
    case "published":
      colorClass = "bg-brandGreen-500 text-white";
      break;
    case "draft":
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
