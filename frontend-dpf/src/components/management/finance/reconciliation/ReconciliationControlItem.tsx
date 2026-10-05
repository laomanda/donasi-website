import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import type { ReconciliationControlItem as IReconciliationControlItem } from "@/types/finance";
import { getControlStatusConfig } from "./reconciliationHelpers";
import { ReconciliationDiagnosticTable } from "./ReconciliationDiagnosticTable";
import { ReconciliationDiagnosticMobileList } from "./ReconciliationDiagnosticMobileList";
import { formatNumber } from "@/utils/financeUtils";

interface ReconciliationControlItemProps {
  check: IReconciliationControlItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ReconciliationControlItem: React.FC<ReconciliationControlItemProps> = ({
  check,
  isExpanded,
  onToggleExpand,
}) => {
  const [diagnosticPage, setDiagnosticPage] = useState<number>(1);
  const statusConfig = getControlStatusConfig(check.status, check.severity);
  const hasErrors = Array.isArray(check.errors) && check.errors.length > 0;

  let statusIcon = faCircleCheck;
  let statusIconBg = "bg-brandGreen-500";
  let leftBorderClass = "border-l-4 border-l-brandGreen-500";

  if (statusConfig.severity === "critical") {
    statusIcon = faCircleXmark;
    statusIconBg = "bg-red-600";
    leftBorderClass = "border-l-4 border-l-red-600";
  } else if (statusConfig.severity === "warning") {
    statusIcon = faTriangleExclamation;
    statusIconBg = "bg-brandWarmOrange-500";
    leftBorderClass = "border-l-4 border-l-brandWarmOrange-500";
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-slate-300 ${leftBorderClass}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        {/* Left: Status Icon, Title, Message */}
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Status Icon */}
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${statusIconBg} text-white shadow-2xs`}
          >
            <FontAwesomeIcon icon={statusIcon} className="text-sm" />
          </div>

          {/* Title & Technical Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-poppins text-sm font-bold text-slate-900">
                {check.name}
              </h3>
              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {check.check_code}
              </span>
            </div>

            <p
              className={`text-xs mt-1 leading-relaxed ${
                statusConfig.severity === "passed"
                  ? "text-slate-600"
                  : statusConfig.severity === "critical"
                  ? "text-red-700 font-medium"
                  : "text-brandWarmOrange-700 font-medium"
              }`}
            >
              {check.message}
            </p>
          </div>
        </div>

        {/* Right: Metrics, Status Badge, Expand Action */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 lg:self-center pl-11 lg:pl-0">
          {/* Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              Diperiksa:{" "}
              <strong className="text-slate-900">{formatNumber(check.total_checked)}</strong>
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                check.total_failed > 0
                  ? "bg-red-100 text-red-800 font-bold"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Bermasalah:{" "}
              <strong className={check.total_failed > 0 ? "text-red-800" : "text-slate-900"}>
                {formatNumber(check.total_failed)}
              </strong>
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${statusConfig.badgeClass}`}
          >
            {statusConfig.label}
          </span>

          {/* Expand Details Button */}
          {hasErrors && (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={isExpanded}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
            >
              <span>{isExpanded ? "Tutup Temuan" : `Lihat ${check.total_failed} Temuan`}</span>
              <FontAwesomeIcon
                icon={isExpanded ? faChevronUp : faChevronDown}
                className="text-[10px] text-slate-500"
              />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Diagnostic Panel */}
      {isExpanded && hasErrors && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ReconciliationDiagnosticTable
              check={check}
              currentPage={diagnosticPage}
              onPageChange={setDiagnosticPage}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden">
            <ReconciliationDiagnosticMobileList
              check={check}
              currentPage={diagnosticPage}
              onPageChange={setDiagnosticPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};
