import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import {
  formatRupiah,
  getNormalBalanceLabel,
} from "@/utils/financeUtils";
import { CurrencyDisplay } from "@/components/management/finance/shared";
import { TrialBalanceAccountTypeBadge } from "./TrialBalanceAccountTypeBadge";
import type {
  TrialBalanceAccount,
  TrialBalanceResponse,
} from "@/types/finance";

interface TrialBalanceDesktopTableProps {
  accounts: TrialBalanceAccount[];
  summaryData: TrialBalanceResponse;
  periodId: number | "";
  startDate: string;
  endDate: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TrialBalanceDesktopTable: React.FC<TrialBalanceDesktopTableProps> = ({
  accounts,
  summaryData,
  periodId,
  startDate,
  endDate,
  searchQuery,
  onSearchChange,
}) => {
  // Build drilldown URL helper
  const getLedgerUrl = (accountId: number) => {
    const params = new URLSearchParams();
    params.set("account_id", String(accountId));
    if (periodId !== "") {
      params.set("period_id", String(periodId));
    }
    if (startDate.trim()) {
      params.set("start_date", startDate.trim());
    }
    if (endDate.trim()) {
      params.set("end_date", endDate.trim());
    }
    return `/finance/general-ledger?${params.toString()}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Table Toolbar: Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 bg-slate-50">
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
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
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

        <div className="text-xs text-slate-500">
          Daftar <strong>{accounts.length}</strong> akun pada halaman ini
        </div>
      </div>

      {/* Table Scroll Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          {/* Multi-tier Header with SOLID colors */}
          <thead>
            {/* Top Header Row */}
            <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
              <th className="px-4 py-3 w-28" rowSpan={2}>
                Kode
              </th>
              <th className="px-4 py-3 min-w-[220px]" rowSpan={2}>
                Nama Akun Perkiraan
              </th>
              <th className="px-3 py-3 w-28 text-center" rowSpan={2}>
                Jenis
              </th>
              <th className="px-3 py-3 w-24 text-center" rowSpan={2}>
                Saldo Normal
              </th>
              <th
                className="px-4 py-2 text-center border-b border-slate-700 bg-slate-800 text-slate-100"
                colSpan={2}
              >
                Mutasi
              </th>
              <th
                className="px-4 py-2 text-center border-b border-slate-700 bg-slate-800 text-slate-100"
                colSpan={2}
              >
                Saldo Akhir
              </th>
              <th className="px-4 py-3 w-28 text-center" rowSpan={2}>
                Aksi
              </th>
            </tr>
            {/* Subheader Row */}
            <tr className="bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider">
              <th className="px-4 py-2 text-right w-36 text-emerald-400">
                Debit
              </th>
              <th className="px-4 py-2 text-right w-36 text-sky-400">
                Kredit
              </th>
              <th className="px-4 py-2 text-right w-36 text-emerald-400">
                Debit
              </th>
              <th className="px-4 py-2 text-right w-36 text-sky-400">
                Kredit
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 bg-white">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Tidak ada akun yang sesuai dengan pencarian.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr
                  key={acc.account_id}
                  className="hover:bg-slate-50/90 transition-colors"
                >
                  {/* Kode */}
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {acc.code}
                  </td>

                  {/* Nama Akun */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">
                      {acc.name}
                    </span>
                  </td>

                  {/* Jenis */}
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <TrialBalanceAccountTypeBadge type={acc.account_type} />
                  </td>

                  {/* Saldo Normal */}
                  <td className="px-3 py-3 text-center text-slate-600 font-medium whitespace-nowrap">
                    {getNormalBalanceLabel(acc.normal_balance)}
                  </td>

                  {/* Mutasi Debit */}
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {acc.total_debit > 0 ? (
                      <CurrencyDisplay amount={acc.total_debit} tone="debit" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Mutasi Kredit */}
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {acc.total_credit > 0 ? (
                      <CurrencyDisplay amount={acc.total_credit} tone="credit" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Saldo Debit Akhir */}
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {acc.debit_balance > 0 ? (
                      formatRupiah(acc.debit_balance)
                    ) : (
                      <span className="text-slate-300 font-normal">-</span>
                    )}
                  </td>

                  {/* Saldo Kredit Akhir */}
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {acc.credit_balance > 0 ? (
                      formatRupiah(acc.credit_balance)
                    ) : (
                      <span className="text-slate-300 font-normal">-</span>
                    )}
                  </td>

                  {/* Aksi: Buku Besar */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <Link
                      to={getLedgerUrl(acc.account_id)}
                      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                      title={`Buka Buku Besar akun ${acc.code} - ${acc.name}`}
                    >
                      <FontAwesomeIcon icon={faBookOpen} className="text-[10px] text-slate-500" />
                      <span>Buku Besar</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Table Footer Totals with SOLID slate-900 styling */}
          <tfoot className="border-t-2 border-slate-700 bg-slate-900 text-white font-bold text-xs">
            <tr>
              <td
                colSpan={4}
                className="px-4 py-3.5 text-right uppercase tracking-wider text-slate-300"
              >
                TOTAL NERACA SALDO
              </td>
              {/* Mutasi Debit */}
              <td className="px-4 py-3.5 text-right font-mono text-emerald-400 tabular-nums font-bold">
                {formatRupiah(summaryData.total_debit)}
              </td>
              {/* Mutasi Kredit */}
              <td className="px-4 py-3.5 text-right font-mono text-sky-400 tabular-nums font-bold">
                {formatRupiah(summaryData.total_credit)}
              </td>
              {/* Saldo Akhir Debit */}
              <td className="px-4 py-3.5 text-right font-mono text-emerald-300 tabular-nums font-bold">
                {formatRupiah(summaryData.total_debit_balance)}
              </td>
              {/* Saldo Akhir Kredit */}
              <td className="px-4 py-3.5 text-right font-mono text-sky-300 tabular-nums font-bold">
                {formatRupiah(summaryData.total_credit_balance)}
              </td>
              {/* Blank spacer for action column */}
              <td className="px-4 py-3.5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TrialBalanceDesktopTable;
