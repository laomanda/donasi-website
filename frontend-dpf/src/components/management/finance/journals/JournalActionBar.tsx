import React from "react";
import type { JournalEntry } from "@/types/finance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faBan,
  faRotate,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

interface JournalActionBarProps {
  journal: JournalEntry;
  canManage: boolean;
  onPost: () => void;
  onVoid: () => void;
  onReverse: () => void;
  isActionLoading?: boolean;
}

export const JournalActionBar: React.FC<JournalActionBarProps> = ({
  journal,
  canManage,
  onPost,
  onVoid,
  onReverse,
  isActionLoading = false,
}) => {
  if (!canManage) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs text-slate-500 flex items-center gap-2">
        <FontAwesomeIcon icon={faLock} className="text-slate-400" />
        <span>Mode Lihat Saja. Akses manajemen jurnal membutuhkan hak akses Keuangan atau Superadmin.</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
        Tindakan Jurnal
      </div>

      <div className="space-y-2">
        {/* DRAFT ACTIONS: Post & Void */}
        {journal.status === "draft" && (
          <>
            {/* Post Button: Solid brandGreen */}
            <button
              type="button"
              onClick={onPost}
              disabled={isActionLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brandGreen-600 hover:bg-brandGreen-700 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>Posting ke Buku Besar</span>
            </button>

            {/* Void Button: Solid Red */}
            <button
              type="button"
              onClick={onVoid}
              disabled={isActionLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white hover:bg-red-600 hover:text-white px-4 py-2.5 text-xs font-bold text-red-600 transition active:scale-95 shadow-xs disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faBan} className="text-xs" />
              <span>Batalkan Jurnal (Void)</span>
            </button>
          </>
        )}

        {/* POSTED ACTIONS: Reverse (Jurnal Pembalik) */}
        {journal.status === "posted" && (
          <button
            type="button"
            onClick={onReverse}
            disabled={isActionLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brandWarmOrange-500 hover:bg-brandWarmOrange-600 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faRotate} className="text-xs" />
            <span>Buat Jurnal Pembalik (Reverse)</span>
          </button>
        )}

        {/* VOID: Read-only info */}
        {journal.status === "void" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500 italic">
            Jurnal telah dibatalkan (Void). Tidak ada tindakan lebih lanjut yang tersedia.
          </div>
        )}
      </div>
    </div>
  );
};
