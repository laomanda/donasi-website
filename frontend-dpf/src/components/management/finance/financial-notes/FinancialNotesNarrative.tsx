import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";
import type { FinancialNote } from "@/types/finance";
import type { FinancialNoteGroup } from "@/utils/finance/financialNotesDisplay";
import { FinancialNotesNarrativeSection } from "./FinancialNotesNarrativeSection";

interface FinancialNotesNarrativeProps {
  groups: FinancialNoteGroup[];
  totalNotes: number;
  periodId?: number | "";
  canManage: boolean;
  onDeleteClick: (note: FinancialNote) => void;
  onResetFilters: () => void;
}

export const FinancialNotesNarrative: React.FC<FinancialNotesNarrativeProps> = ({
  groups,
  totalNotes,
  periodId,
  canManage,
  onDeleteClick,
  onResetFilters,
}) => {
  if (totalNotes === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FontAwesomeIcon icon={faInbox} className="text-xl" />
        </div>
        <p className="text-sm font-semibold text-slate-700 font-poppins">
          Tidak Ada Catatan atas Laporan Keuangan Sesuai Kriteria
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
          Silakan sesuaikan pilihan periode, kategori, status, atau kata kunci pencarian Anda.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
        >
          Reset Filter
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <FinancialNotesNarrativeSection
          key={group.categoryKey}
          group={group}
          periodId={periodId}
          canManage={canManage}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};
