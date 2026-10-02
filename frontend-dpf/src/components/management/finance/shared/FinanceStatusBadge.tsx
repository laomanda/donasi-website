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
  | "active"
  | "completed"
  | "failed"
  | "processing"
  | "previewed";

interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: any;
}

const BADGE_CONFIGS: Record<FinanceStatusType, BadgeConfig> = {
  draft: {
    label: "Draf",
    bg: "bg-slate-600",
    text: "text-white",
    border: "border-slate-600",
    icon: faClock,
  },
  posted: {
    label: "Terbuku",
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-600",
    icon: faCircleCheck,
  },
  completed: {
    label: "Selesai",
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-600",
    icon: faCircleCheck,
  },
  failed: {
    label: "Gagal",
    bg: "bg-rose-600",
    text: "text-white",
    border: "border-rose-600",
    icon: faTriangleExclamation,
  },
  processing: {
    label: "Diproses",
    bg: "bg-brandBlueTeal-600",
    text: "text-white",
    border: "border-brandBlueTeal-600",
    icon: faClock,
  },
  previewed: {
    label: "Tervalidasi",
    bg: "bg-indigo-600",
    text: "text-white",
    border: "border-indigo-600",
    icon: faCircleInfo,
  },
  void: {
    label: "Batal",
    bg: "bg-rose-600",
    text: "text-white",
    border: "border-rose-600",
    icon: faBan,
  },
  open: {
    label: "Terbuka",
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-600",
    icon: faLockOpen,
  },
  closed: {
    label: "Ditutup",
    bg: "bg-slate-700",
    text: "text-white",
    border: "border-slate-700",
    icon: faLock,
  },
  balanced: {
    label: "Seimbang",
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-600",
    icon: faCircleCheck,
  },
  warning: {
    label: "Perhatian",
    bg: "bg-amber-500",
    text: "text-white",
    border: "border-amber-500",
    icon: faTriangleExclamation,
  },
  anomaly: {
    label: "Anomali",
    bg: "bg-rose-600",
    text: "text-white",
    border: "border-rose-600",
    icon: faTriangleExclamation,
  },
  pending: {
    label: "Menunggu",
    bg: "bg-amber-500",
    text: "text-white",
    border: "border-amber-500",
    icon: faClock,
  },
  active: {
    label: "Aktif",
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-600",
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
    bg: "bg-slate-700",
    text: "text-white",
    border: "border-slate-700",
    icon: faCircleInfo,
  };

  const displayLabel = label ?? config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap shrink-0 shadow-xs ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <FontAwesomeIcon icon={config.icon} className="text-[9px] shrink-0" />
      <span className="whitespace-nowrap">{children ?? displayLabel}</span>
    </span>
  );
}

export default FinanceStatusBadge;
