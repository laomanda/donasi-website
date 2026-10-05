import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faCalendarDays,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import type { AccountingPeriod } from "@/types/finance";
import {
  formatAccountingPeriodName,
  formatAccountingPeriodDateRange,
} from "./periodHelpers";

interface AccountingPeriodsOverviewProps {
  periods: AccountingPeriod[];
  loading?: boolean;
}

export const AccountingPeriodsOverview: React.FC<AccountingPeriodsOverviewProps> = ({
  periods,
  loading = false,
}) => {
  if (loading && periods.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs animate-pulse">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:divide-x sm:divide-slate-100">
          <div className="space-y-2 px-3">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="h-3 w-40 rounded bg-slate-100" />
          </div>
          <div className="space-y-2 px-3 sm:pl-6">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-6 w-16 rounded bg-slate-200" />
            <div className="h-3 w-32 rounded bg-slate-100" />
          </div>
          <div className="space-y-2 px-3 sm:pl-6">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-6 w-16 rounded bg-slate-200" />
            <div className="h-3 w-32 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  // Authoritative calculations from the full period collection
  const totalCount = periods.length;
  const openPeriods = periods.filter(
    (p) =>
      (p.status || "").toLowerCase().trim() === "open" ||
      (p.status || "").toLowerCase().trim() === "aktif"
  );
  const closedPeriods = periods.filter(
    (p) =>
      (p.status || "").toLowerCase().trim() === "closed" ||
      (p.status || "").toLowerCase().trim() === "ditutup"
  );

  const activePeriod = openPeriods.length === 1 ? openPeriods[0] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
        {/* 1. Periode Aktif */}
        <div className="flex items-center gap-3.5 px-1 sm:px-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brandGreen-500 text-white shadow-xs">
            <FontAwesomeIcon icon={faCalendarCheck} className="text-base" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Periode Aktif
            </span>
            <div className="mt-0.5">
              {activePeriod ? (
                <>
                  <p className="text-lg font-bold text-slate-900 font-poppins truncate">
                    {formatAccountingPeriodName(activePeriod)}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {formatAccountingPeriodDateRange(
                      activePeriod.start_date,
                      activePeriod.end_date
                    )}
                  </p>
                </>
              ) : openPeriods.length > 1 ? (
                <>
                  <p className="text-lg font-bold text-slate-900 font-poppins">
                    {openPeriods.length} Periode Aktif
                  </p>
                  <p className="text-xs text-slate-500">
                    Beberapa periode pembukuan terbuka
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-slate-400 font-poppins">
                    Tidak Ada
                  </p>
                  <p className="text-xs text-slate-400">
                    Semua periode pembukuan ditutup
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2. Total Periode */}
        <div className="flex items-center gap-3.5 px-1 sm:px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brandBlueTeal-500 text-white shadow-xs">
            <FontAwesomeIcon icon={faCalendarDays} className="text-base" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Periode
            </span>
            <div className="mt-0.5">
              <p className="text-lg font-bold text-slate-900 font-poppins">
                {totalCount}
              </p>
              <p className="text-xs text-slate-500">
                Riwayat seluruh periode pembukuan
              </p>
            </div>
          </div>
        </div>

        {/* 3. Periode Ditutup */}
        <div className="flex items-center gap-3.5 px-1 sm:px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brandPurple-500 text-white shadow-xs">
            <FontAwesomeIcon icon={faLock} className="text-base" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Periode Ditutup
            </span>
            <div className="mt-0.5">
              <p className="text-lg font-bold text-slate-900 font-poppins">
                {closedPeriods.length}
              </p>
              <p className="text-xs text-slate-500">
                Arsip pembukuan terkunci
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
