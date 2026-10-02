import React from "react";
import type { JournalStatus } from "@/types/finance";

interface JournalStatusBadgeProps {
  status: JournalStatus;
  className?: string;
}

export const JournalStatusBadge: React.FC<JournalStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case "posted":
        return {
          label: "Diposting",
          classes: "bg-brandGreen-500 text-white",
        };
      case "draft":
        return {
          label: "Draft",
          classes: "bg-primary-400 text-white",
        };
      case "void":
        return {
          label: "Dibatalkan (Void)",
          classes: "bg-red-500 text-white",
        };
      default:
        return {
          label: status,
          classes: "bg-slate-600 text-white",
        };
    }
  };

  const { label, classes } = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-xs ${classes} ${className}`}
    >
      {label}
    </span>
  );
};

export default JournalStatusBadge;
