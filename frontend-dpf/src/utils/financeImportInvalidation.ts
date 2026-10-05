import { invalidateAccountsCache } from "@/hooks/finance/useAccountsData";
import { invalidateJournalsCache } from "@/hooks/finance/useJournals";
import { invalidateFinanceDashboardCache } from "@/utils/financeDashboardCache";
import { invalidateGeneralLedgerCache } from "@/utils/finance/generalLedgerCache";
import { invalidateTrialBalanceCache } from "@/utils/finance/trialBalanceCache";
import { invalidateBalanceSheetCache } from "@/utils/finance/balanceSheetCache";
import { invalidateActivityStatementCache } from "@/utils/finance/activityStatementCache";
import { clearReconCache } from "@/components/management/finance/reconciliation/reconciliationCache";

export function invalidateFinanceAfterAccountsImport(): void {
  invalidateAccountsCache();
}

export function invalidateFinanceAfterJournalImport(): void {
  invalidateJournalsCache();
  invalidateFinanceDashboardCache();
  invalidateGeneralLedgerCache();
  invalidateTrialBalanceCache();
  invalidateBalanceSheetCache();
  invalidateActivityStatementCache();
  clearReconCache();
}

export function invalidateFinanceAfterOpeningBalanceImport(): void {
  invalidateFinanceDashboardCache();
  invalidateGeneralLedgerCache();
  invalidateTrialBalanceCache();
  invalidateBalanceSheetCache();
  invalidateActivityStatementCache();
  clearReconCache();
}
