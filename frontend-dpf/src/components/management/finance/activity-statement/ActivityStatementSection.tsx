import React from "react";
import { formatRupiah } from "@/utils/financeUtils";
import type { ActivityStatementAccount } from "@/types/finance";
import { ActivityStatementTable } from "./ActivityStatementTable";
import { ActivityStatementMobileList } from "./ActivityStatementMobileList";

export type ActivityStatementSectionTone = "brandGreen" | "primary" | "brandWarmOrange";

interface ActivityStatementSectionProps {
  title: string;
  sectionNumber: string | number;
  items: ActivityStatementAccount[];
  subtotalLabel: string;
  subtotalAmount: number;
  tone: ActivityStatementSectionTone;
  emptyMessage?: string;
  periodId: number | "";
  startDate?: string;
  endDate?: string;
}

const toneStyles: Record<
  ActivityStatementSectionTone,
  {
    badgeBg: string;
    borderTop: string;
  }
> = {
  brandGreen: {
    badgeBg: "bg-brandGreen-500",
    borderTop: "border-t-brandGreen-500",
  },
  primary: {
    badgeBg: "bg-primary-600",
    borderTop: "border-t-primary-600",
  },
  brandWarmOrange: {
    badgeBg: "bg-brandWarmOrange-500",
    borderTop: "border-t-brandWarmOrange-500",
  },
};

export const ActivityStatementSection: React.FC<ActivityStatementSectionProps> = ({
  title,
  sectionNumber,
  items,
  subtotalLabel,
  subtotalAmount,
  tone,
  emptyMessage = "Tidak ada akun pada kategori ini",
  periodId,
  startDate,
  endDate,
}) => {
  const currentTone = toneStyles[tone];

  return (
    <section className={`rounded-2xl border border-slate-200 border-t-4 ${currentTone.borderTop} bg-white shadow-xs overflow-hidden print:border print:border-black print:rounded-none print:shadow-none mb-6`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/75 px-5 py-4 print:border-b-2 print:border-black print:bg-white">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${currentTone.badgeBg} text-xs font-bold text-white shadow-2xs print:border print:border-black print:bg-white print:text-black`}
          >
            {sectionNumber}
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
              {title}
            </h3>
            <span className="text-[11px] text-slate-500">
              {items.length} Akun terdaftar
            </span>
          </div>
        </div>

        {/* Quick Subtotal Preview */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-right">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Subtotal:
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-slate-900 tabular-nums">
            {formatRupiah(subtotalAmount)}
          </span>
        </div>
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block">
        <ActivityStatementTable
          items={items}
          emptyMessage={emptyMessage}
          subtotalLabel={subtotalLabel}
          subtotalAmount={subtotalAmount}
          periodId={periodId}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="block md:hidden">
        <ActivityStatementMobileList
          items={items}
          emptyMessage={emptyMessage}
          subtotalLabel={subtotalLabel}
          subtotalAmount={subtotalAmount}
          periodId={periodId}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </section>
  );
};

export default ActivityStatementSection;
