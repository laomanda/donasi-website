import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { FinancialNote } from "@/types/finance";

interface FinancialNoteDeleteDialogProps {
  note: FinancialNote | null;
  deleting: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export const FinancialNoteDeleteDialog: React.FC<FinancialNoteDeleteDialogProps> = ({
  note,
  deleting,
  onConfirm,
  onClose,
}) => {
  // Prevent background scroll while modal is open & listen for Escape key
  useEffect(() => {
    if (!note) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [note, deleting, onClose]);

  if (!note) return null;

  const dialogContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-base" />
          </div>
          <div className="space-y-1">
            <h2 id="delete-dialog-title" className="text-base font-bold text-slate-900 font-poppins">
              Hapus Catatan Keuangan?
            </h2>
            <p className="text-xs text-slate-500">
              Tindakan ini tidak dapat dibatalkan. Catatan pengungkapan ini akan dihapus permanen dari sistem.
            </p>
          </div>
        </div>

        {/* Note Details Box */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-1 text-xs">
          <p className="font-bold text-slate-900 line-clamp-1">{note.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-2">{note.content}</p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs text-slate-400" />
            <span>Batal</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
            <span>{deleting ? "Menghapus..." : "Hapus Catatan"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(dialogContent, document.body) : null;
};
