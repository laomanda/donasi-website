import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export interface FinancePageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function FinancePageHeader({
  title,
  description,
  badge,
  backHref,
  backLabel = "Kembali",
  actions,
  children,
}: FinancePageHeaderProps) {
  return (
    <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          {backHref && (
            <Link
              to={backHref}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition mb-1"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
              {backLabel}
            </Link>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {description && (
            <p className="max-w-3xl text-sm font-medium text-slate-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="mt-6 pt-6 border-t border-slate-100">{children}</div>}
    </section>
  );
}

export default FinancePageHeader;
