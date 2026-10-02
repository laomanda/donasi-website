import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheck,
  faBan,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { JournalEntry } from "@/types/finance";

interface JournalRowActionsProps {
  journal: JournalEntry;
  canManage: boolean;
  onPost?: (journal: JournalEntry) => void;
  onVoid?: (journal: JournalEntry) => void;
  onReverse?: (journal: JournalEntry) => void;
  layout?: "horizontal" | "stacked";
}

export const JournalRowActions: React.FC<JournalRowActionsProps> = ({
  journal,
  canManage,
  onPost,
  onVoid,
  onReverse,
  layout = "horizontal",
}) => {
  const isDraft = journal.status === "draft";
  const isPosted = journal.status === "posted";

  if (layout === "stacked") {
    return (
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Link
          to={`/finance/journals/${journal.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-brandBlueTeal-500 hover:bg-brandBlueTeal-500 hover:text-white transition active:scale-95"
        >
          <FontAwesomeIcon icon={faEye} className="text-xs" />
          <span>Detail</span>
        </Link>

        {canManage && isDraft && onPost && (
          <button
            type="button"
            onClick={() => onPost(journal)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-brandGreen-500 bg-brandGreen-500 py-2 text-xs font-bold text-white shadow-2xs hover:bg-brandGreen-600 transition active:scale-95"
          >
            <FontAwesomeIcon icon={faCheck} className="text-xs" />
            <span>Posting</span>
          </button>
        )}

        {canManage && isDraft && onVoid && (
          <button
            type="button"
            onClick={() => onVoid(journal)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 shadow-2xs hover:border-rose-600 hover:bg-rose-600 hover:text-white transition active:scale-95"
            title="Batalkan Jurnal (Void)"
          >
            <FontAwesomeIcon icon={faBan} className="text-xs" />
          </button>
        )}

        {canManage && isPosted && onReverse && (
          <button
            type="button"
            onClick={() => onReverse(journal)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-brandWarmOrange-600 shadow-2xs hover:border-brandWarmOrange-500 hover:bg-brandWarmOrange-500 hover:text-white transition active:scale-95"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
            <span>Pembalik</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Detail Link */}
      <Link
        to={`/finance/journals/${journal.id}`}
        title="Lihat Detail Jurnal"
        aria-label={`Lihat rincian jurnal ${journal.journal_number}`}
        className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-brandBlueTeal-500 hover:text-white transition focus-visible:outline-hidden"
      >
        <FontAwesomeIcon icon={faEye} className="text-xs" />
      </Link>

      {/* Post Action */}
      {canManage && isDraft && onPost && (
        <button
          type="button"
          onClick={() => onPost(journal)}
          title="Posting Jurnal ke Buku Besar"
          aria-label={`Posting jurnal ${journal.journal_number}`}
          className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-brandGreen-500 hover:text-white transition focus-visible:outline-hidden"
        >
          <FontAwesomeIcon icon={faCheck} className="text-xs" />
        </button>
      )}

      {/* Void Action */}
      {canManage && isDraft && onVoid && (
        <button
          type="button"
          onClick={() => onVoid(journal)}
          title="Batalkan Jurnal (Void)"
          aria-label={`Batalkan jurnal ${journal.journal_number}`}
          className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-600 hover:text-white transition focus-visible:outline-hidden"
        >
          <FontAwesomeIcon icon={faBan} className="text-xs" />
        </button>
      )}

      {/* Reverse Action */}
      {canManage && isPosted && onReverse && (
        <button
          type="button"
          onClick={() => onReverse(journal)}
          title="Buat Jurnal Pembalik (Reverse)"
          aria-label={`Buat jurnal pembalik untuk ${journal.journal_number}`}
          className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-brandWarmOrange-500 hover:text-white transition focus-visible:outline-hidden"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
        </button>
      )}
    </div>
  );
};

export default JournalRowActions;
