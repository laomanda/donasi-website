import React from "react";
import type { Account } from "@/types/finance";
import type { FlatTreeItem } from "@/utils/accountTreeUtils";
import { getNormalBalanceLabel } from "@/utils/financeUtils";
import { AccountTreeCell } from "./AccountTreeCell";
import { AccountTypeBadge } from "./AccountTypeBadge";
import { AccountRowActions } from "./AccountRowActions";

interface AccountsDesktopTableProps {
  viewMode: "tree" | "flat";
  treeItems: FlatTreeItem[];
  flatItems: Account[];
  canManage: boolean;
  onToggleExpand: (id: number) => void;
  onView: (account: Account) => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  pagination?: React.ReactNode;
}

export const AccountsDesktopTable: React.FC<AccountsDesktopTableProps> = ({
  viewMode,
  treeItems,
  flatItems,
  canManage,
  onToggleExpand,
  onView,
  onEdit,
  onDelete,
  pagination,
}) => {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4 min-w-[220px]">
                Kode & Nama Akun
              </th>
              <th scope="col" className="py-3.5 px-4 w-28">
                Jenis
              </th>
              <th scope="col" className="py-3.5 px-4 w-28">
                Saldo Normal
              </th>
              <th scope="col" className="py-3.5 px-4 min-w-[140px]">
                Kategori Laporan
              </th>
              <th scope="col" className="py-3.5 px-4 w-20 text-center">
                Level
              </th>
              <th scope="col" className="py-3.5 px-4 w-28 text-center">
                Status
              </th>
              <th scope="col" className="py-3.5 px-4 w-28 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {viewMode === "tree"
              ? treeItems.map((item) => {
                  const { account, depth, hasChildren, isExpanded } = item;
                  const isLevel1 = account.level === 1;

                  return (
                    <tr
                      key={account.id}
                      className={`hover:bg-slate-50 transition group ${
                        isLevel1 ? "bg-slate-50/80 font-semibold" : "bg-white"
                      }`}
                    >
                      {/* Kode & Nama with tree indentation */}
                      <td className="py-2.5 px-4">
                        <AccountTreeCell
                          account={account}
                          depth={depth}
                          hasChildren={hasChildren}
                          isExpanded={isExpanded}
                          onToggleExpand={onToggleExpand}
                          onView={onView}
                        />
                      </td>

                      {/* Jenis Akun */}
                      <td className="py-2.5 px-4">
                        <AccountTypeBadge type={account.account_type} />
                      </td>

                      {/* Saldo Normal */}
                      <td className="py-2.5 px-4 text-slate-700 font-medium">
                        {getNormalBalanceLabel(account.normal_balance)}
                      </td>

                      {/* Kategori Laporan */}
                      <td className="py-2.5 px-4 text-slate-600">
                        {account.report_category || (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Level */}
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center h-5 w-6 rounded bg-slate-200 font-mono text-[10px] font-bold text-slate-800">
                          L{account.level}
                        </span>
                      </td>

                      {/* Status (Solid Badge) */}
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold text-white ${
                            account.is_active ? "bg-brandGreen-500" : "bg-slate-600"
                          }`}
                        >
                          {account.is_active ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 px-4 text-right">
                        <AccountRowActions
                          account={account}
                          canManage={canManage}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </td>
                    </tr>
                  );
                })
              : flatItems.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-slate-50 transition bg-white"
                  >
                    {/* Kode & Nama (Flat) */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums font-bold text-slate-900 text-xs">
                          {account.code}
                        </span>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => onView(account)}
                          className="text-left font-medium text-slate-900 hover:text-primary-600 hover:underline transition truncate max-w-[280px] lg:max-w-md"
                          title={account.name}
                        >
                          {account.name}
                        </button>
                      </div>
                      {account.parent && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 pl-0.5 truncate">
                          Induk: {account.parent.code} - {account.parent.name}
                        </div>
                      )}
                    </td>

                    {/* Jenis Akun */}
                    <td className="py-2.5 px-4">
                      <AccountTypeBadge type={account.account_type} />
                    </td>

                    {/* Saldo Normal */}
                    <td className="py-2.5 px-4 text-slate-700 font-medium">
                      {getNormalBalanceLabel(account.normal_balance)}
                    </td>

                    {/* Kategori Laporan */}
                    <td className="py-2.5 px-4 text-slate-600">
                      {account.report_category || (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>

                    {/* Level */}
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center h-5 w-6 rounded bg-slate-200 font-mono text-[10px] font-bold text-slate-800">
                        L{account.level}
                      </span>
                    </td>

                    {/* Status (Solid Badge) */}
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold text-white ${
                          account.is_active ? "bg-brandGreen-500" : "bg-slate-600"
                        }`}
                      >
                        {account.is_active ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-2.5 px-4 text-right">
                      <AccountRowActions
                        account={account}
                        canManage={canManage}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {pagination}
    </div>
  );
};

export default AccountsDesktopTable;
