import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/ToastProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faBookOpen } from "@fortawesome/free-solid-svg-icons";

import { AccountPageHeader } from "@/components/management/finance/accounts";
import { JournalForm } from "@/components/management/finance/journals";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useJournalMasterData } from "@/hooks/finance/useJournalMasterData";
import { invalidateJournalsCache } from "@/hooks/finance/useJournals";
import { seedJournalDetailCache } from "@/hooks/finance/useJournal";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";
import type { JournalEntryPayload } from "@/types/finance";

export function JournalCreatePage() {
  const navigate = useNavigate();

  // 1. RBAC Guard
  const currentUser = getAuthUser();
  const userRoles = useMemo(() => {
    const roles = (currentUser?.roles ?? []).map((r) => r.name.toLowerCase());
    if (currentUser?.role_label) {
      roles.push(currentUser.role_label.toLowerCase());
    }
    return roles;
  }, [currentUser]);

  const canManage = userRoles.includes("keuangan") || userRoles.includes("superadmin");

  // 2. Cached Master Data (Periods, Accounts, Programs)
  const {
    accounts,
    periods,
    programs,
    loading: masterLoading,
    error: masterError,
    refreshMasterData,
  } = useJournalMasterData();

  // 3. Form submit state
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 4. Handle Submit
  const handleSubmit = async (payload: JournalEntryPayload) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const response = await financeService.createJournal(payload);
      const newJournal = response.data;

      // Invalidate list caches so the new journal immediately appears in list queries
      invalidateJournalsCache();

      // Seed detail cache if complete data was returned
      if (newJournal?.id) {
        seedJournalDetailCache(newJournal);
      }

      toast.success(
        `Jurnal [${newJournal?.journal_number || "Baru"}] berhasil disimpan sebagai Draft.`
      );

      // Navigate to detail page if ID exists, else to list
      if (newJournal?.id) {
        navigate(`/finance/journals/${newJournal.id}`);
      } else {
        navigate("/finance/journals");
      }
    } catch (err: unknown) {
      const errorMsg = extractFinanceErrorMessage(err, "Gagal membuat jurnal baru.");
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // RBAC Access Denied view
  if (!canManage) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Buat Jurnal"
          description="Catat transaksi jurnal berpasangan sesuai periode akuntansi yang aktif."
          backHref="/finance/journals"
          backLabel="Kembali ke Jurnal Umum"
        />
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-xs flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
            <FontAwesomeIcon icon={faInfoCircle} className="text-lg" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Akses Ditolak</h3>
            <p className="text-xs text-slate-600">
              Anda tidak memiliki izin untuk membuat jurnal baru. Fitur ini hanya dapat diakses oleh staf Keuangan atau Superadmin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AccountPageHeader
        title="Buat Jurnal Baru"
        description="Catat transaksi jurnal berpasangan sesuai periode akuntansi yang aktif."
        backHref="/finance/journals"
        backLabel="Kembali ke Jurnal Umum"
        variant="primary"
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
            <FontAwesomeIcon icon={faBookOpen} className="text-xs" />
            <span>Double-Entry Voucher</span>
          </span>
        }
        breadcrumbs={[
          { label: "Keuangan", href: "/finance" },
          { label: "Jurnal Umum", href: "/finance/journals" },
          { label: "Buat Jurnal" },
        ]}
      />

      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3">
          <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5 text-red-600 text-sm" />
          <div className="space-y-0.5">
            <p className="font-bold">Gagal Menyimpan Jurnal</p>
            <p className="font-normal text-red-700 leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      {/* Master Data Loading Error */}
      {masterError && (
        <FinanceErrorState
          title="Gagal Memuat Master Data Jurnal"
          message={masterError}
          onRetry={refreshMasterData}
        />
      )}

      {/* Main Journal Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
        <JournalForm
          accounts={accounts}
          periods={periods}
          programs={programs}
          masterLoading={masterLoading}
          isSubmitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/finance/journals")}
        />
      </div>
    </div>
  );
}

export default JournalCreatePage;
