import React from "react";
import type { AccountType, AccountSummary } from "@/types/finance";

interface AccountsQuickFiltersProps {
  typeFilter: AccountType | "";
  onSelectType: (type: AccountType | "") => void;
  summary: AccountSummary | null;
  counts: {
    total: number;
    asset: number;
    liability: number;
    net_asset: number;
    revenue: number;
    expense: number;
  };
}

export const AccountsQuickFilters: React.FC<AccountsQuickFiltersProps> = ({
  typeFilter,
  onSelectType,
  summary,
  counts,
}) => {
  const items: {
    key: AccountType | "";
    label: string;
    count: number;
    activeClass: string;
  }[] = [
    {
      key: "",
      label: "Semua",
      count: summary?.total ?? counts.total,
      activeClass: "bg-slate-900 text-white border-slate-900",
    },
    {
      key: "asset",
      label: "Aset",
      count: summary?.asset ?? counts.asset,
      activeClass: "bg-brandBlueTeal-500 text-white border-brandBlueTeal-500",
    },
    {
      key: "liability",
      label: "Liabilitas",
      count: summary?.liability ?? counts.liability,
      activeClass: "bg-brandWarmOrange-500 text-white border-brandWarmOrange-500",
    },
    {
      key: "net_asset",
      label: "Aset Neto",
      count: summary?.net_asset ?? counts.net_asset,
      activeClass: "bg-brandPurple-500 text-white border-brandPurple-500",
    },
    {
      key: "revenue",
      label: "Penerimaan",
      count: summary?.revenue ?? counts.revenue,
      activeClass: "bg-brandGreen-500 text-white border-brandGreen-500",
    },
    {
      key: "expense",
      label: "Beban",
      count: summary?.expense ?? counts.expense,
      activeClass: "bg-primary-600 text-white border-primary-600",
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
      <span className="shrink-0 text-slate-500 font-semibold text-[11px] uppercase tracking-wider mr-1">
        Klasifikasi:
      </span>
      {items.map((item) => {
        const isActive = typeFilter === item.key;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelectType(item.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg sm:rounded-xl px-3 py-1.5 font-semibold transition border shadow-2xs ${
              isActive
                ? item.activeClass
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`rounded-md px-1.5 py-0.2 text-[10px] font-mono tabular-nums ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AccountsQuickFilters;
