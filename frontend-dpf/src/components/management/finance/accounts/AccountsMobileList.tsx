import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faFolder,
  faFolderOpen,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import type { Account } from "@/types/finance";
import type { FlatTreeItem } from "@/utils/accountTreeUtils";
import { getNormalBalanceLabel } from "@/utils/financeUtils";
import { AccountTypeBadge } from "./AccountTypeBadge";
import { AccountRowActions } from "./AccountRowActions";

interface AccountsMobileListProps {
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

export const AccountsMobileList: React.FC<AccountsMobileListProps> = ({
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
    <div className="md:hidden space-y-2.5">
      {viewMode === "tree"
        ? treeItems.map((item) => {
            const { account, depth, hasChildren, isExpanded, childCount } = item;
            // Cap left indent to max 24px on mobile to preserve readable line width on 360px devices
            const indentPx = Math.min(depth * 10, 24);

            return (
              <div
                key={account.id}
                style={{ marginLeft: `${indentPx}px` }}
                className={`rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2.5 transition ${
                  depth > 0 ? "border-l-4 border-l-slate-300" : ""
                }`}
              >
                {/* Header: Code & Level + Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => onToggleExpand(account.id)}
                        aria-label={
                          isExpanded
                            ? `Tutup cabang ${account.code}`
                            : `Buka cabang ${account.code}`
                        }
                        className="h-6 w-6 inline-flex shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronDown : faChevronRight}
                          className="text-[10px]"
                        />
                      </button>
                    )}

                    <FontAwesomeIcon
                      icon={
                        hasChildren
                          ? isExpanded
                            ? faFolderOpen
                            : faFolder
                          : faFile
                      }
                      className={`text-xs shrink-0 ${
                        account.level === 1
                          ? "text-brandBlueTeal-500"
                          : hasChildren
                          ? "text-brandWarmOrange-500"
                          : "text-slate-400"
                      }`}
                    />

                    <span className="font-mono font-bold text-slate-900 text-xs tracking-tight">
                      {account.code}
                    </span>

                    <span className="rounded bg-slate-200 px-1 py-0.2 font-mono text-[9px] font-bold text-slate-800">
                      L{account.level}
                    </span>

                    {hasChildren && (
                      <span className="text-[10px] text-slate-600 font-medium">
                        ({childCount})
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${
                      account.is_active ? "bg-brandGreen-500" : "bg-slate-600"
                    }`}
                  >
                    {account.is_active ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>

                {/* Account Name */}
                <div>
                  <button
                    type="button"
                    onClick={() => onView(account)}
                    className="text-left font-semibold text-slate-900 text-xs sm:text-sm hover:text-primary-600 leading-snug line-clamp-2"
                  >
                    {account.name}
                  </button>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                  <AccountTypeBadge type={account.account_type} />
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-medium text-slate-700">
                    Saldo: {getNormalBalanceLabel(account.normal_balance)}
                  </span>
                  {account.report_category && (
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-600 truncate max-w-[150px]">
                      {account.report_category}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <AccountRowActions
                  account={account}
                  canManage={canManage}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  layout="stacked"
                />
              </div>
            );
          })
        : flatItems.map((account) => (
            <div
              key={account.id}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2.5"
            >
              {/* Header: Code & Level + Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono font-bold text-slate-900 text-xs tracking-tight">
                    {account.code}
                  </span>
                  <span className="rounded bg-slate-200 px-1 py-0.2 font-mono text-[9px] font-bold text-slate-800">
                    L{account.level}
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${
                    account.is_active ? "bg-brandGreen-500" : "bg-slate-600"
                  }`}
                >
                  {account.is_active ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>

              {/* Account Name & Parent Info */}
              <div>
                <button
                  type="button"
                  onClick={() => onView(account)}
                  className="text-left font-semibold text-slate-900 text-xs sm:text-sm hover:text-primary-600 leading-snug line-clamp-2"
                >
                  {account.name}
                </button>
                {account.parent && (
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5 truncate">
                    Induk: {account.parent.code} - {account.parent.name}
                  </div>
                )}
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                <AccountTypeBadge type={account.account_type} />
                <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-medium text-slate-700">
                  Saldo: {getNormalBalanceLabel(account.normal_balance)}
                </span>
                {account.report_category && (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-600 truncate max-w-[150px]">
                    {account.report_category}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <AccountRowActions
                account={account}
                canManage={canManage}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                layout="stacked"
              />
            </div>
          ))}

      {pagination && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {pagination}
        </div>
      )}
    </div>
  );
};

export default AccountsMobileList;
