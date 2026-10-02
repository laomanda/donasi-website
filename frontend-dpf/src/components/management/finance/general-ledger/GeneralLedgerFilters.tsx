import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBookOpen, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { SearchableSelect } from "@/components/management/finance/shared";
import type { Account, AccountingPeriod } from "@/types/finance";

interface GeneralLedgerFiltersProps {
  accountId: number | "";
  periodId: number | "";
  startDate: string;
  endDate: string;
  includeZeroBalance: boolean;
  activeAccounts: Account[];
  periods: AccountingPeriod[];
  isFilterActive: boolean;
  totalAccountsCount?: number;
  selectedAccountTransactionsCount?: number;
  selectedAccountCode?: string;
  onAccountIdChange: (id: number | "") => void;
  onPeriodIdChange: (id: number | "") => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onIncludeZeroBalanceChange: (val: boolean) => void;
  onResetFilters: () => void;
  onClearAccount?: () => void;
}

export const GeneralLedgerFilters: React.FC<GeneralLedgerFiltersProps> = ({
  accountId,
  periodId,
  startDate,
  endDate,
  includeZeroBalance,
  activeAccounts,
  periods,
  isFilterActive,
  totalAccountsCount = 0,
  selectedAccountTransactionsCount,
  selectedAccountCode,
  onAccountIdChange,
  onPeriodIdChange,
  onStartDateChange,
  onEndDateChange,
  onIncludeZeroBalanceChange,
  onResetFilters,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
      {/* Focused Account Notification Banner */}
      {accountId !== "" && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span>
              Fokus Rincian Akun:{" "}
              <strong className="font-mono text-slate-900 font-bold">
                {selectedAccountCode || accountId}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* 4-Column Grid: Desktop (4), Tablet (2), Mobile (1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Filter Akun Perkiraan */}
        <div>
          <label
            htmlFor="filter-gl-account"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Akun Perkiraan
          </label>
          <SearchableSelect<number | "">
            id="filter-gl-account"
            value={accountId}
            onChange={(val) => onAccountIdChange(val === "" ? "" : Number(val))}
            options={[
              { value: "", label: "-- Semua Akun (Ikhtisar) --" },
              ...activeAccounts.map((acc) => ({
                value: acc.id,
                label: `[${acc.code}] ${acc.name}`,
                badge: acc.account_type,
                badgeColor: "bg-slate-200 text-slate-700",
              })),
            ]}
            placeholder="-- Semua Akun (Ikhtisar) --"
            searchPlaceholder="Ketik kode atau nama akun..."
            icon={faBookOpen}
          />
        </div>

        {/* Filter Periode Akuntansi */}
        <div>
          <label
            htmlFor="filter-gl-period"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Periode Akuntansi
          </label>
          <SearchableSelect<number | "">
            id="filter-gl-period"
            value={periodId}
            onChange={(val) => onPeriodIdChange(val === "" ? "" : Number(val))}
            options={[
              { value: "", label: "-- Semua Periode --" },
              ...periods.map((p) => {
                const pName = p.period_name || p.name || `Periode #${p.id}`;
                return {
                  value: p.id,
                  label: pName,
                  badge: p.status === "closed" ? "Tertutup" : "Aktif",
                  badgeColor:
                    p.status === "closed"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-brandGreen-500 text-white",
                };
              }),
            ]}
            placeholder="-- Semua Periode --"
            searchPlaceholder="Ketik nama atau tahun periode..."
            icon={faCalendarAlt}
          />
        </div>

        {/* Filter Tanggal Mulai */}
        <div>
          <label
            htmlFor="filter-gl-start-date"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Tanggal Mulai
          </label>
          <input
            id="filter-gl-start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>

        {/* Filter Tanggal Akhir */}
        <div>
          <label
            htmlFor="filter-gl-end-date"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Tanggal Akhir
          </label>
          <input
            id="filter-gl-end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>
      </div>

      {/* Bottom Control Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={includeZeroBalance}
            onChange={(e) => onIncludeZeroBalanceChange(e.target.checked)}
            className="h-4 w-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span>Sertakan Akun Bersaldo Nol</span>
        </label>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-slate-500">
            {selectedAccountCode ? (
              <span>
                Akun: <strong className="text-slate-800 font-mono">{selectedAccountCode}</strong>
                {selectedAccountTransactionsCount !== undefined && (
                  <span> • {selectedAccountTransactionsCount} mutasi</span>
                )}
              </span>
            ) : (
              <span>
                Total: <strong className="text-slate-800 font-semibold">{totalAccountsCount}</strong> akun beraktivitas
              </span>
            )}
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
            >
              <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralLedgerFilters;
