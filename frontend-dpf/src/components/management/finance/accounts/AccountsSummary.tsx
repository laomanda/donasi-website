import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faCircleCheck,
  faCircleXmark,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import type { AccountSummary } from "@/types/finance";

interface AccountsSummaryProps {
  summary: AccountSummary | null;
  totalFallback: number;
  activeFallback: number;
  inactiveFallback: number;
  level1Count: number;
}

export const AccountsSummary: React.FC<AccountsSummaryProps> = ({
  summary,
  totalFallback,
  activeFallback,
  inactiveFallback,
  level1Count,
}) => {
  const cards = [
    {
      title: "Total Akun",
      value: summary?.total ?? totalFallback,
      helper: "Seluruh kode akun terdaftar",
      icon: faSitemap,
      accentBorder: "border-l-brandBlueTeal-500",
      iconBg: "bg-brandBlueTeal-500",
    },
    {
      title: "Akun Aktif",
      value: summary?.active ?? activeFallback,
      helper: "Dapat digunakan dalam jurnal",
      icon: faCircleCheck,
      accentBorder: "border-l-brandGreen-500",
      iconBg: "bg-brandGreen-500",
    },
    {
      title: "Tidak Aktif",
      value: summary?.inactive ?? inactiveFallback,
      helper: "Akun dinonaktifkan / ditutup",
      icon: faCircleXmark,
      accentBorder: "border-l-slate-500",
      iconBg: "bg-slate-700",
    },
    {
      title: "Akun Induk",
      value: level1Count,
      helper: "Klasifikasi utama Level 1",
      icon: faLayerGroup,
      accentBorder: "border-l-brandPurple-500",
      iconBg: "bg-brandPurple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200 border-l-4 ${card.accentBorder} bg-white p-3 sm:p-4 shadow-xs transition hover:shadow-sm`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {card.title}
            </span>
            <div
              className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg ${card.iconBg} text-white shadow-xs`}
            >
              <FontAwesomeIcon icon={card.icon} className="text-xs sm:text-sm" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {card.value.toLocaleString("id-ID")}
            </div>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 truncate">
              {card.helper}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountsSummary;
