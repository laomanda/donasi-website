import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faLayerGroup,
  faCalendarAlt,
  faUser,
  faSortNumericDown,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import type { FinancialNote } from "@/types/finance";
import { formatCreatorLabel } from "@/utils/finance/financialNotesDisplay";
import { formatFinanceDateTime } from "@/utils/financeUtils";
import { FinancialNoteStatusBadge } from "./FinancialNoteStatusBadge";
import { FinancialNoteCategoryBadge } from "./FinancialNoteCategoryBadge";

interface FinancialNoteMetadataProps {
  note: FinancialNote;
}

export const FinancialNoteMetadata: React.FC<FinancialNoteMetadataProps> = ({ note }) => {
  const creator = formatCreatorLabel(note.creator_name);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
          <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
            Informasi Catatan
          </h2>
          <p className="text-[11px] text-slate-500">
            Metadata administrasi dan peruntukan pos pengungkapan.
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Status Publikasi */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Status Publikasi:</span>
          <FinancialNoteStatusBadge status={note.status} />
        </div>

        {/* Kategori Pos */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" />
            Kategori Pos
          </span>
          <div>
            <FinancialNoteCategoryBadge category={note.category} showSectionLetter />
          </div>
        </div>

        {/* Periode Akuntansi */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
            Periode Akuntansi
          </span>
          <p className="font-semibold text-slate-800">
            {note.period_name || (note.period_id ? `Periode #${note.period_id}` : "Semua Periode")}
          </p>
        </div>

        {/* Nomor Urut */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faSortNumericDown} className="text-[10px]" />
            Nomor Urut Tampilan
          </span>
          <p className="font-mono font-semibold text-slate-800">
            {note.sort_order ?? note.order ?? "-"}
          </p>
        </div>

        {/* Penyusun */}
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <FontAwesomeIcon icon={faUser} className="text-[10px]" />
            Penyusun
          </span>
          <p className="font-medium text-slate-800">{creator}</p>
        </div>

        {/* Tanggal Dibuat */}
        {note.created_at && (
          <div className="space-y-1 border-t border-slate-100 pt-2.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <FontAwesomeIcon icon={faClock} className="text-[10px]" />
              Dibuat
            </span>
            <p className="text-slate-600 text-[11px]">
              {formatFinanceDateTime(note.created_at)}
            </p>
          </div>
        )}

        {/* Terakhir Diperbarui */}
        {note.updated_at && (
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Terakhir Diperbarui
            </span>
            <p className="text-slate-600 text-[11px]">
              {formatFinanceDateTime(note.updated_at)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
