import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines } from "@fortawesome/free-solid-svg-icons";

interface FinancialNoteContentProps {
  title: string;
  content: string;
}

export const FinancialNoteContent: React.FC<FinancialNoteContentProps> = ({
  title,
  content,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
          <FontAwesomeIcon icon={faFileLines} className="text-xs" />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-poppins">
            Naskah Catatan Pengungkapan
          </h2>
          <p className="text-[11px] text-slate-500">
            Penjelasan naratif resmi terkait akun atau kebijakan keuangan.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-poppins">
          {title}
        </h3>
        <div className="rounded-xl bg-slate-50/60 p-4 sm:p-5 border border-slate-100 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-line print:bg-white print:border-none print:p-0">
          {content}
        </div>
      </div>
    </div>
  );
};
