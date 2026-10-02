import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { FinanceEmptyState } from "@/components/management/finance/shared";
import { LedgerAccountsTable } from "./LedgerAccountsTable";
import { LedgerAccountsMobileList } from "./LedgerAccountsMobileList";
import { LedgerAccountsPagination } from "./LedgerAccountsPagination";
import type { GeneralLedgerAccount } from "@/types/finance";

interface LedgerOverviewProps {
  accounts: GeneralLedgerAccount[];
  filteredAccounts: GeneralLedgerAccount[];
  paginatedAccounts: GeneralLedgerAccount[];
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  isFilterActive: boolean;
  onSearchChange: (q: string) => void;
  onPageChange: (page: number) => void;
  onSelectAccount: (accountId: number) => void;
  onResetFilters: () => void;
}

export const LedgerOverview: React.FC<LedgerOverviewProps> = ({
  accounts,
  filteredAccounts,
  paginatedAccounts,
  searchQuery,
  currentPage,
  totalPages,
  pageSize,
  isFilterActive,
  onSearchChange,
  onPageChange,
  onSelectAccount,
  onResetFilters,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Search & Metadata Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 bg-slate-50/50">
        <div className="relative flex-1 max-w-md">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode atau nama akun perkiraan..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="Hapus pencarian"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium text-right sm:text-left">
          Menampilkan <strong>{filteredAccounts.length}</strong> dari{" "}
          <strong>{accounts.length}</strong> akun
        </div>
      </div>

      {/* Main Content: Table on Desktop, List on Mobile */}
      {paginatedAccounts.length === 0 ? (
        <div className="py-12">
          <FinanceEmptyState
            title="Tidak Ada Akun yang Sesuai"
            description="Tidak ada data akun buku besar yang cocok dengan kata kunci atau filter terpilih."
            icon={faBookOpen}
            action={
              isFilterActive ? (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  Reset Filter
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <LedgerAccountsTable
              accounts={paginatedAccounts}
              onSelectAccount={onSelectAccount}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden">
            <LedgerAccountsMobileList
              accounts={paginatedAccounts}
              onSelectAccount={onSelectAccount}
            />
          </div>

          {/* Pagination */}
          <LedgerAccountsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAccounts.length}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default LedgerOverview;
