import React from "react";
import { Link } from "react-router-dom";
import type { JournalEntry } from "@/types/finance";
import { formatFinanceDateTime } from "@/utils/financeUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faClock,
  faCheck,
  faBan,
  faRotate,
  faFingerprint,
} from "@fortawesome/free-solid-svg-icons";

interface JournalAuditMetadataProps {
  journal: JournalEntry;
}

export const JournalAuditMetadata: React.FC<JournalAuditMetadataProps> = ({ journal }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <FontAwesomeIcon icon={faFingerprint} className="text-slate-400 text-sm" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Jejak Audit & Metadata
        </h3>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* ID Sistem */}
        <div className="flex items-center justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">ID Sistem</span>
          <span className="font-mono font-bold text-slate-800">#{journal.id}</span>
        </div>

        {/* Pembuat */}
        <div className="flex items-start justify-between py-1 border-b border-slate-50 gap-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <FontAwesomeIcon icon={faUser} className="text-[10px] text-slate-400" />
            <span>Dibuat Oleh</span>
          </div>
          <div className="text-right font-medium text-slate-800">
            {journal.creator?.name || (journal.created_by ? `User #${journal.created_by}` : "Sistem")}
          </div>
        </div>

        {/* Waktu Buat */}
        {journal.created_at && (
          <div className="flex items-start justify-between py-1 border-b border-slate-50 gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <FontAwesomeIcon icon={faClock} className="text-[10px] text-slate-400" />
              <span>Waktu Dibuat</span>
            </div>
            <div className="text-right font-mono text-slate-700">
              {formatFinanceDateTime(journal.created_at)}
            </div>
          </div>
        )}

        {/* Posting Info */}
        {journal.posted_at && (
          <div className="flex items-start justify-between py-1 border-b border-slate-50 gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <FontAwesomeIcon icon={faCheck} className="text-[10px] text-brandGreen-600" />
              <span>Waktu Diposting</span>
            </div>
            <div className="text-right font-mono text-slate-700">
              {formatFinanceDateTime(journal.posted_at)}
            </div>
          </div>
        )}

        {/* Void Info */}
        {journal.voided_at && (
          <div className="flex items-start justify-between py-1 border-b border-slate-50 gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <FontAwesomeIcon icon={faBan} className="text-[10px] text-red-600" />
              <span>Waktu Dibatalkan</span>
            </div>
            <div className="text-right font-mono text-slate-700">
              {formatFinanceDateTime(journal.voided_at)}
            </div>
          </div>
        )}

        {/* Reversal Linkage: Reversal Of */}
        {journal.reversal_of_id && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <FontAwesomeIcon icon={faRotate} className="text-brandWarmOrange-500" />
              <span>Pembalik Dari Jurnal</span>
            </div>
            <div>
              <Link
                to={`/finance/journals/${journal.reversal_of_id}`}
                className="font-mono font-bold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Jurnal Induk #{journal.reversal_of_id} &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Reversal Linkage: Reversed By */}
        {journal.reversed_by_id && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <FontAwesomeIcon icon={faRotate} className="text-brandWarmOrange-500" />
              <span>Dibalikkan Oleh Jurnal</span>
            </div>
            <div>
              <Link
                to={`/finance/journals/${journal.reversed_by_id}`}
                className="font-mono font-bold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Jurnal Pembalik #{journal.reversed_by_id} &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Terakhir Diperbarui */}
        {journal.updated_at && (
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span>Terakhir Diperbarui</span>
            <span className="font-mono">{formatFinanceDateTime(journal.updated_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
