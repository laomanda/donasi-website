import React from "react";
import { getCategoryConfig } from "@/config/finance/financialNoteCategories";

interface FinancialNoteCategoryBadgeProps {
  category?: string | null;
  showSectionLetter?: boolean;
  className?: string;
}

export const FinancialNoteCategoryBadge: React.FC<FinancialNoteCategoryBadgeProps> = ({
  category,
  showSectionLetter = false,
  className = "",
}) => {
  const config = getCategoryConfig(category);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-xs ${className}`}
    >
      {showSectionLetter && (
        <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-brandPurple-500 text-[10px] font-bold">
          {config.sectionLetter}
        </span>
      )}
      <span className="truncate">{config.label}</span>
    </span>
  );
};
