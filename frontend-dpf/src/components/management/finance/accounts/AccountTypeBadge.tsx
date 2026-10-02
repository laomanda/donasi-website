import React from "react";
import type { AccountType } from "@/types/finance";
import { getAccountTypeLabel } from "@/utils/financeUtils";

interface AccountTypeBadgeProps {
  type: AccountType;
  className?: string;
}

export const AccountTypeBadge: React.FC<AccountTypeBadgeProps> = ({
  type,
  className = "",
}) => {
  const getSolidBadgeColor = (accType: AccountType) => {
    switch (accType) {
      case "asset":
        return "bg-brandBlueTeal-500 text-white";
      case "liability":
        return "bg-brandWarmOrange-500 text-white";
      case "net_asset":
        return "bg-brandPurple-500 text-white";
      case "revenue":
        return "bg-brandGreen-500 text-white";
      case "expense":
        return "bg-primary-600 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide shadow-xs ${getSolidBadgeColor(
        type
      )} ${className}`}
    >
      {getAccountTypeLabel(type)}
    </span>
  );
};

export default AccountTypeBadge;
