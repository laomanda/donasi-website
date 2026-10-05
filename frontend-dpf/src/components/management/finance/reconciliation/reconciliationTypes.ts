export type ReconciliationTabFilter = "all" | "review" | "passed";

export interface StatusVisualConfig {
  label: string;
  badgeClass: string;
  iconClass: string;
  dotClass: string;
  severity: "passed" | "warning" | "critical" | "unknown";
}
