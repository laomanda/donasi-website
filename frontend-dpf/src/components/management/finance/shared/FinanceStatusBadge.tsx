import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faClock,
  faBan,
  faLock,
  faLockOpen,
  faTriangleExclamation,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

export type FinanceStatusType =
  | "draft"
  | "posted"
  | "void"
  | "open"
  | "closed"
  | "balanced"
  | "warning"
  | "anomaly"
  | "pending"
  | "active";

interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: any;
}

const BADGE_CONFIGS: Record<FinanceStatusType, BadgeConfig> = {
  draft: {
    label: "Draft",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: faClock,
  },
  posted: {
    label: "Posted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: faCircleCheck,
  },
  void: {
    label: "Void",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: faBan,
  },
  open: {
    label: "Terbuka",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: faLockOpen,
  },
  closed: {
    label: "Ditutup",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: faLock,
  },
  balanced: {
    label: "Seimbang",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: faCircleCheck,
  },
  warning: {
    label: "Perhatian",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: faTriangleExclamation,
  },
  anomaly: {
    label: "Anomali",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: faTriangleExclamation,
  },
  pending: {
    label: "Menunggu",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: faClock,
  },
  active: {
    label: "Aktif",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: faCircleCheck,
  },
};

export interface FinanceStatusBadgeProps {
  status: FinanceStatusType | string;
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function FinanceStatusBadge({
  status,
  label,
  className = "",
  children,
}: FinanceStatusBadgeProps) {
  const normalized = (status || "").toLowerCase() as FinanceStatusType;
  const config = BADGE_CONFIGS[normalized] ?? {
    label: status || "-",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: faCircleInfo,
  };

  const displayLabel = label ?? config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase shadow-xs ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <FontAwesomeIcon icon={config.icon} className="text-[9px]" />
      <span>{children ?? displayLabel}</span>
    </span>
  );
}

export default FinanceStatusBadge;
