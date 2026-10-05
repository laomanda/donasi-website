import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getOverallStatusConfig } from "./reconciliationHelpers";

interface ReconciliationStatusBadgeProps {
  status?: string | null;
  className?: string;
}

export const ReconciliationStatusBadge: React.FC<ReconciliationStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const config = getOverallStatusConfig(status);

  let icon = faCircleCheck;
  if (config.severity === "critical") {
    icon = faCircleXmark;
  } else if (config.severity === "warning") {
    icon = faTriangleExclamation;
  } else if (config.severity === "unknown") {
    icon = faQuestionCircle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${config.badgeClass} ${className}`}
    >
      <FontAwesomeIcon icon={icon} className="text-[11px]" />
      <span>{config.label}</span>
    </span>
  );
};
