import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ToneKey } from "../../StatCard";
import { TONE_STYLES } from "../../StatCard";

export interface FinanceStatCardProps {
  title: string;
  value: ReactNode;
  icon?: any;
  tone?: ToneKey;
  loading?: boolean;
  helper?: string;
  badge?: ReactNode;
  className?: string;
}

export function FinanceStatCard({
  title,
  value,
  icon,
  tone = "emerald",
  loading = false,
  helper,
  badge,
  className = "",
}: FinanceStatCardProps) {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.emerald;

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 truncate">
          {title}
        </p>
        {badge}
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-100 my-1" />
          ) : (
            <div className={`font-heading text-xl sm:text-2xl font-bold tracking-tight ${styles.textBold} truncate`}>
              {value}
            </div>
          )}

          {helper && (
            <p className="mt-1 text-xs font-semibold text-slate-500 truncate">
              {helper}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconText} shadow-sm`}
          >
            <FontAwesomeIcon icon={icon} className="text-base" />
          </div>
        )}
      </div>
    </div>
  );
}

export default FinanceStatCard;
