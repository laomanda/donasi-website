import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import type { JournalEntry } from "@/types/finance";
import { RecentJournalsDesktop } from "./RecentJournalsDesktop";
import { RecentJournalsMobile } from "./RecentJournalsMobile";

interface RecentJournalsPanelProps {
  journals: JournalEntry[];
  selectedPeriodId: number | null;
  error?: string;
  loading: boolean;
}

export const RecentJournalsPanel: React.FC<RecentJournalsPanelProps> = ({
  journals,
  selectedPeriodId,
  error,
  loading,
}) => {
  return (
    <section
      aria-labelledby="recent-journals-title"
      className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
        <div>
          <h2
            id="recent-journals-title"
            className="font-heading text-sm sm:text-base font-bold text-slate-900"
          >
            Aktivitas Jurnal Terbaru
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            5 transaksi jurnal terakhir yang tercatat pada periode ini.
          </p>
        </div>
        <Link
          to={
            selectedPeriodId
              ? `/finance/journals?period_id=${selectedPeriodId}`
              : "/finance/journals"
          }
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-brandGreen-600 hover:text-brandGreen-700 transition"
        >
          Lihat Semua Jurnal
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-[10px] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {error ? (
        <FinanceErrorState
          title="Daftar Jurnal Belum Dapat Dimuat"
          message={error}
        />
      ) : loading ? (
        <div className="space-y-2.5 py-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-11 w-full animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : journals.length === 0 ? (
        <FinanceEmptyState
          title="Belum Ada Transaksi Jurnal"
          description="Belum terdapat jurnal transaksi yang dicatat pada periode akuntansi ini."
          action={
            <Link
              to={
                selectedPeriodId
                  ? `/finance/journals?period_id=${selectedPeriodId}`
                  : "/finance/journals"
              }
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
              Catat Jurnal Baru
            </Link>
          }
        />
      ) : (
        <>
          <RecentJournalsDesktop journals={journals} />
          <RecentJournalsMobile journals={journals} />
        </>
      )}
    </section>
  );
};

export default RecentJournalsPanel;
