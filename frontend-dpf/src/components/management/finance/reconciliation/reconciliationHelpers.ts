import { formatFinanceDateTime } from "@/utils/financeUtils";
import type { StatusVisualConfig } from "./reconciliationTypes";

/**
 * Maps backend authoritative overall_status to human-readable Indonesian labels
 * and solid brand color styling. Never defaults unknown status to green.
 */
export function getOverallStatusConfig(status?: string | null): StatusVisualConfig {
  const norm = (status || "").toLowerCase().trim();

  if (norm === "critical") {
    return {
      label: "Kritis",
      badgeClass: "bg-red-600 text-white shadow-xs",
      iconClass: "text-white",
      dotClass: "bg-red-600",
      severity: "critical",
    };
  }

  if (norm === "needs_review" || norm === "needs_attention") {
    return {
      label: "Perlu Tinjauan",
      badgeClass: "bg-brandWarmOrange-500 text-white shadow-xs",
      iconClass: "text-white",
      dotClass: "bg-brandWarmOrange-500",
      severity: "warning",
    };
  }

  if (norm === "reconciled_with_warnings") {
    return {
      label: "Seimbang dengan Catatan",
      badgeClass: "bg-brandWarmOrange-500 text-white shadow-xs",
      iconClass: "text-white",
      dotClass: "bg-brandWarmOrange-500",
      severity: "warning",
    };
  }

  if (norm === "reconciled" || norm === "passed" || norm === "healthy") {
    return {
      label: "Seimbang",
      badgeClass: "bg-brandGreen-500 text-white shadow-xs",
      iconClass: "text-white",
      dotClass: "bg-brandGreen-500",
      severity: "passed",
    };
  }

  // Fallback for unknown status - strictly NOT green
  return {
    label: "Status Tidak Dikenal",
    badgeClass: "bg-slate-600 text-white shadow-xs",
    iconClass: "text-white",
    dotClass: "bg-slate-600",
    severity: "unknown",
  };
}

/**
 * Maps individual control status & severity to display configuration.
 */
export function getControlStatusConfig(
  status: string,
  severity?: string | null
): StatusVisualConfig {
  const normStatus = (status || "").toLowerCase().trim();
  const normSeverity = (severity || "").toLowerCase().trim();

  if (normStatus === "passed") {
    return {
      label: "LULUS",
      badgeClass: "bg-brandGreen-500 text-white shadow-xs",
      iconClass: "text-white",
      dotClass: "bg-brandGreen-500",
      severity: "passed",
    };
  }

  if (normSeverity === "critical") {
    return {
      label: "KRITIS",
      badgeClass: "bg-red-600 text-white shadow-xs",
      iconClass: "text-white",
      dotClass: "bg-red-600",
      severity: "critical",
    };
  }

  // Warning or other failed state
  return {
    label: "PERINGATAN",
    badgeClass: "bg-brandWarmOrange-500 text-white shadow-xs",
    iconClass: "text-white",
    dotClass: "bg-brandWarmOrange-500",
    severity: "warning",
  };
}

/**
 * Format timestamp safely using application standard date/time.
 */
export function formatReconciliationTimestamp(isoString?: string | null): string {
  if (!isoString) return "—";
  return formatFinanceDateTime(isoString);
}
