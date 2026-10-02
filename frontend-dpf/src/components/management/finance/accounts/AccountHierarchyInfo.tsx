import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderTree,
  faSitemap,
  faChevronRight,
  faLevelDownAlt,
} from "@fortawesome/free-solid-svg-icons";
import type { Account } from "@/types/finance";

interface AccountHierarchyInfoProps {
  account: Account;
}

export const AccountHierarchyInfo: React.FC<AccountHierarchyInfoProps> = ({ account }) => {
  const getLevelDescription = (level: number) => {
    switch (level) {
      case 1:
        return "Akun Induk Utama";
      case 2:
        return "Golongan Akun";
      case 3:
        return "Sub-Golongan";
      case 4:
        return "Akun Buku Besar";
      default:
        return `Sub-Akun Tingkat ${level}`;
    }
  };

  const childrenCount =
    account.children_count ?? account.children?.length ?? 0;
  const hasChildren = Boolean(account.children && account.children.length > 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <FontAwesomeIcon icon={faFolderTree} className="text-brandBlueTeal-500 text-sm" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Struktur & Hierarki Akun
        </h3>
      </div>

      <div className="space-y-4">
        {/* Tingkat / Level */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tingkat Akun (Level)
            </div>
            <div className="text-xs font-semibold text-slate-800">
              {getLevelDescription(account.level)}
            </div>
          </div>
          <span className="inline-flex items-center justify-center h-7 px-3 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold shadow-xs">
            Level {account.level}
          </span>
        </div>

        {/* Akun Induk (Parent) */}
        <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Akun Induk (Parent)
          </div>
          {account.parent ? (
            <Link
              to={`/finance/accounts/${account.parent.id}`}
              className="group flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-brandBlueTeal-500 transition text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <FontAwesomeIcon
                  icon={faSitemap}
                  className="text-brandBlueTeal-500 text-xs shrink-0"
                />
                <span className="font-mono font-bold text-slate-900 group-hover:text-primary-600 transition">
                  {account.parent.code}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-800 font-medium truncate group-hover:text-primary-600 transition">
                  {account.parent.name}
                </span>
              </div>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-slate-400 group-hover:text-primary-600 transition text-[10px] shrink-0 ml-2"
              />
            </Link>
          ) : (
            <div className="text-xs text-slate-500 italic py-1">
              Tidak memiliki akun induk (Akun Induk Level 1).
            </div>
          )}
        </div>

        {/* Sub-Akun (Children) List */}
        <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Daftar Sub-Akun
            </div>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {childrenCount} Sub-Akun
            </span>
          </div>

          {hasChildren && account.children && account.children.length > 0 ? (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {account.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/finance/accounts/${child.id}`}
                  className="group flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-brandBlueTeal-500 transition text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FontAwesomeIcon
                      icon={faLevelDownAlt}
                      className="text-slate-400 rotate-180 text-[10px] shrink-0"
                    />
                    <span className="font-mono font-bold text-slate-900 group-hover:text-primary-600 transition">
                      {child.code}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-800 font-medium truncate group-hover:text-primary-600 transition">
                      {child.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600 font-semibold">
                      L{child.level}
                    </span>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        child.is_active ? "bg-brandGreen-500" : "bg-slate-400"
                      }`}
                      title={child.is_active ? "Aktif" : "Nonaktif"}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-1">
              Belum ada sub-akun terdaftar di bawah akun ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountHierarchyInfo;
