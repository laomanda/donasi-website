import React from "react";
import {
  FinanceStatusBadge,
  CurrencyDisplay,
} from "@/components/management/finance/shared";
import { formatFinanceDate } from "@/utils/financeUtils";
import type { JournalEntry } from "@/types/finance";

interface RecentJournalsDesktopProps {
  journals: JournalEntry[];
}

export const RecentJournalsDesktop: React.FC<RecentJournalsDesktopProps> = ({
  journals,
}) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-700">
        <thead className="border-b-2 border-slate-200 bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-800">
          <tr>
            <th className="px-4 py-2.5">Nomor Jurnal</th>
            <th className="px-4 py-2.5">Tanggal</th>
            <th className="px-4 py-2.5">Keterangan</th>
            <th className="px-4 py-2.5 text-center">Status</th>
            <th className="px-4 py-2.5 text-right">Nominal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {journals.map((journal) => {
            const displayTotal =
              journal.total_debit ?? journal.total_credit ?? 0;

            return (
              <tr key={journal.id} className="transition hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-bold text-slate-900">
                  {journal.journal_number}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                  {formatFinanceDate(journal.date)}
                </td>
                <td className="px-4 py-3 max-w-sm truncate font-medium text-slate-800">
                  {journal.description || "Tanpa keterangan"}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <FinanceStatusBadge status={journal.status} />
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                  <CurrencyDisplay amount={displayTotal} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentJournalsDesktop;
