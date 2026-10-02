import React from "react";
import {
  FinanceStatusBadge,
  CurrencyDisplay,
} from "@/components/management/finance/shared";
import { formatFinanceDate } from "@/utils/financeUtils";
import type { JournalEntry } from "@/types/finance";

interface RecentJournalsMobileProps {
  journals: JournalEntry[];
}

export const RecentJournalsMobile: React.FC<RecentJournalsMobileProps> = ({
  journals,
}) => {
  return (
    <div className="md:hidden divide-y divide-slate-200">
      {journals.map((journal) => {
        const displayTotal =
          journal.total_debit ?? journal.total_credit ?? 0;

        return (
          <div key={journal.id} className="py-3 first:pt-1 last:pb-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-slate-900">
                {journal.journal_number}
              </span>
              <FinanceStatusBadge status={journal.status} />
            </div>
            <p className="text-xs font-medium text-slate-700 line-clamp-2 my-1.5">
              {journal.description || "Tanpa keterangan"}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{formatFinanceDate(journal.date)}</span>
              <CurrencyDisplay
                amount={displayTotal}
                className="text-xs font-bold font-mono text-slate-900"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentJournalsMobile;
