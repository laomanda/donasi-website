import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faFolder,
  faFolderOpen,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import type { Account } from "@/types/finance";

interface AccountTreeCellProps {
  account: Account;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
  onView?: (account: Account) => void;
}

export const AccountTreeCell: React.FC<AccountTreeCellProps> = ({
  account,
  depth,
  hasChildren,
  isExpanded,
  onToggleExpand,
  onView,
}) => {
  const indentPx = depth * 20;

  return (
    <div
      className="flex items-center gap-2"
      style={{ paddingLeft: `${indentPx}px` }}
    >
      {/* Expand/Collapse Chevron */}
      {hasChildren ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(account.id);
          }}
          aria-label={
            isExpanded
              ? `Tutup cabang akun ${account.code}`
              : `Buka cabang akun ${account.code}`
          }
          className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-slate-400"
        >
          <FontAwesomeIcon
            icon={isExpanded ? faChevronDown : faChevronRight}
            className="text-[10px]"
          />
        </button>
      ) : (
        <span className="w-5 flex justify-center text-slate-300 text-[10px]">
          •
        </span>
      )}

      {/* Folder or File Icon */}
      <FontAwesomeIcon
        icon={
          hasChildren
            ? isExpanded
              ? faFolderOpen
              : faFolder
            : faFile
        }
        className={`text-xs ${
          account.level === 1
            ? "text-brandBlueTeal-500"
            : hasChildren
            ? "text-brandWarmOrange-500"
            : "text-slate-400"
        }`}
      />

      {/* Code */}
      <span
        className={`font-mono tabular-nums tracking-tight ${
          account.level === 1
            ? "font-bold text-slate-900 text-[13px]"
            : "font-semibold text-slate-800 text-xs"
        }`}
      >
        {account.code}
      </span>

      <span className="text-slate-300">|</span>

      {/* Name as declarative Link */}
      <Link
        to={`/finance/accounts/${account.id}`}
        onClick={onView ? () => onView(account) : undefined}
        className="text-left font-medium text-slate-900 hover:text-primary-600 hover:underline transition truncate max-w-[280px] lg:max-w-md"
        title={account.name}
      >
        {account.name}
      </Link>
    </div>
  );
};

export default AccountTreeCell;
