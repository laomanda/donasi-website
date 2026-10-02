import React from "react";
import type { JournalStatus } from "@/types/finance";

interface JournalStatusFiltersProps {
  statusFilter: JournalStatus | "";
  onSelectStatus: (status: JournalStatus | "") => void;
}

export const JournalStatusFilters: React.FC<JournalStatusFiltersProps> = ({
  statusFilter,
  onSelectStatus,
}) => {
  const filters: {
    key: JournalStatus | "";
    label: string;
    mobileLabel?: string;
    activeClass: string;
  }[] = [
    {
      key: "",
      label: "Semua Status",
      mobileLabel: "Semua",
      activeClass: "bg-brandGreen-600 text-white border-brandGreen-600 shadow-xs",
    },
    {
      key: "posted",
      label: "Diposting",
      mobileLabel: "Diposting",
      activeClass: "bg-brandGreen-500 text-white border-brandGreen-500 shadow-xs",
    },
    {
      key: "draft",
      label: "Draft",
      mobileLabel: "Draft",
      activeClass: "bg-brandWarmOrange-500 text-white border-brandWarmOrange-500 shadow-xs",
    },
    {
      key: "void",
      label: "Dibatalkan (Void)",
      mobileLabel: "Void",
      activeClass: "bg-red-600 text-white border-red-600 shadow-xs",
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 w-full max-w-full scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {filters.map((f) => {
        const isActive = statusFilter === f.key;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onSelectStatus(f.key)}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isActive
                ? f.activeClass
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400"
            }`}
          >
            {f.mobileLabel ? (
              <>
                <span className="inline sm:hidden">{f.mobileLabel}</span>
                <span className="hidden sm:inline">{f.label}</span>
              </>
            ) : (
              f.label
            )}
          </button>
        );
      })}
    </div>
  );
};

export default JournalStatusFilters;
