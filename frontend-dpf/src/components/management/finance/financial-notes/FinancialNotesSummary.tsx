import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faCheckCircle,
  faClock,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import type { FinancialNoteSummary } from "@/types/finance";
import { FINANCIAL_NOTE_CATEGORIES } from "@/config/finance/financialNoteCategories";

interface FinancialNotesSummaryProps {
  summary: FinancialNoteSummary | null;
  loading?: boolean;
}

export const FinancialNotesSummary: React.FC<FinancialNotesSummaryProps> = ({
  summary,
  loading = false,
}) => {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-xs h-24"
          />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  // Presentation calculation of filled categories from authoritative summary array
  const filledCategoriesCount = Array.isArray(summary.by_category)
    ? summary.by_category.filter((c) => c.count > 0).length
    : 0;

  const totalPossibleCategories = FINANCIAL_NOTE_CATEGORIES.length;

  const cards = [
    {
      label: "Total Catatan",
      value: `${summary.total_notes} Catatan`,
      subtext: "Pengungkapan terdaftar",
      icon: faFileLines,
      accentBorder: "border-l-brandPurple-500",
      iconColor: "text-brandPurple-500",
    },
    {
      label: "Dipublikasikan",
      value: `${summary.by_status?.published ?? 0} Catatan`,
      subtext: "Tampil di laporan resmi",
      icon: faCheckCircle,
      accentBorder: "border-l-brandGreen-500",
      iconColor: "text-brandGreen-500",
    },
    {
      label: "Draft",
      value: `${summary.by_status?.draft ?? 0} Catatan`,
      subtext: "Belum dipublikasikan",
      icon: faClock,
      accentBorder: "border-l-brandWarmOrange-500",
      iconColor: "text-brandWarmOrange-500",
    },
    {
      label: "Kategori Terisi",
      value: `${filledCategoriesCount} dari ${totalPossibleCategories}`,
      subtext: "Cakupan pos pengungkapan",
      icon: faLayerGroup,
      accentBorder: "border-l-brandBlueTeal-500",
      iconColor: "text-brandBlueTeal-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
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
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 ${c.iconColor}`}
          >
            <FontAwesomeIcon icon={c.icon} className="text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
};
