import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/ToastProvider";
import Swal from "sweetalert2";

import {
  JournalsHeader,
  JournalsToolbar,
  JournalsDesktopTable,
  JournalsMobileList,
  JournalsPagination,
} from "@/components/management/finance/journals";
import {
  FinanceErrorState,
} from "@/components/management/finance/shared";
import { useJournals, invalidateJournalsCache } from "@/hooks/finance/useJournals";
import { invalidateJournalDetailCache } from "@/hooks/finance/useJournal";
import { useJournalFilters } from "@/hooks/finance/useJournalFilters";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import financeService from "@/services/financeService";
import {
  extractFinanceErrorMessage,
  downloadBlobFile,
} from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";
import type { JournalEntry } from "@/types/finance";

export function JournalsPage() {
  const navigate = useNavigate();

  // 1. RBAC Permission Check
  const currentUser = getAuthUser();
  const userRoles = useMemo(() => {
    const roles = (currentUser?.roles ?? []).map((r) => r.name.toLowerCase());
    if (currentUser?.role_label) {
      roles.push(currentUser.role_label.toLowerCase());
    }
    return roles;
  }, [currentUser]);

  const canManage = userRoles.includes("keuangan") || userRoles.includes("superadmin");

  // 2. Filter & URL Synchronized Hook
  const {
    filters,
    searchInput,
    setSearchInput,
    setStatus,
    setPeriodId,
    setDateFrom,
    setDateTo,
    setPage,
    setPerPage,
    resetFilters,
  } = useJournalFilters();

  // 3. Accounting Periods Hook (Cached, shared across Finance module)
  const { periods } = useFinancePeriods();

  // 4. Cached & SWR Journal List Query Hook
  const {
    journals,
    pagination,
    loading,
    refreshing,
    error,
    refresh,
  } = useJournals(filters);

  // 5. Excel Export State
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const exportParams: Record<string, string> = {};
      if (filters.period_id) exportParams.period_id = String(filters.period_id);
      if (filters.date_from) exportParams.start_date = filters.date_from;
      if (filters.date_to) exportParams.end_date = filters.date_to;

      const blobData = await financeService.exportJournals(exportParams);
      const dateStr = new Date().toISOString().split("T")[0];
      downloadBlobFile(
        blobData as unknown as BlobPart,
        `Jurnal_Umum_${dateStr}.xlsx`
      );
      toast.success("Berhasil mengunduh jurnal umum Excel.");
    } catch (err: unknown) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh Excel jurnal."));
    } finally {
      setExporting(false);
    }
  };

  // 6. Transactional Action: Post Journal (With Accounting Confirmation)
  const handlePostJournal = useCallback(async (journal: JournalEntry) => {
    const result = await Swal.fire({
      title: "Posting Jurnal ke Buku Besar?",
      html: `
        <div class="text-left text-xs space-y-2 text-slate-700">
          <p>Jurnal <b>${journal.journal_number}</b> akan langsung dibukukan ke dalam <b>Buku Besar (General Ledger)</b> yayasan.</p>
          <p class="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
            <strong>Peringatan Akuntansi:</strong> Setelah diposting, jurnal ini berstatus <em>immutable</em> (terkunci permanen) demi integritas audit trail. Segala bentuk koreksi saldo harus dilakukan melalui <b>Jurnal Pembalik (Reverse)</b>.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3f8f3f", // Solid brandGreen-500
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Posting Sekarang",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await financeService.postJournal(journal.id);
      toast.success(`Jurnal ${journal.journal_number} berhasil diposting.`);

      invalidateJournalsCache();
      invalidateJournalDetailCache(journal.id);
      await refresh();
    } catch (err: unknown) {
      toast.error(extractFinanceErrorMessage(err, "Gagal memposting jurnal."));
    }
  }, [refresh]);

  // 7. Transactional Action: Void Journal (With Mandatory Reason)
  const handleVoidJournal = useCallback(async (journal: JournalEntry) => {
    const result = await Swal.fire({
      title: "Batalkan Jurnal (Void)?",
      html: `
        <div class="text-left text-xs space-y-2 text-slate-700">
          <p>Jurnal <b>${journal.journal_number}</b> akan dibatalkan secara permanen dan tidak lagi berlaku dalam pembukuan yayasan.</p>
        </div>
      `,
      icon: "warning",
      input: "textarea",
      inputLabel: "Alasan Pembatalan (Wajib Diisi)",
      inputPlaceholder: "Tuliskan alasan pembatalan jurnal secara jelas...",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Alasan pembatalan wajib diisi!";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: "#dc2626", // Solid Red
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Batalkan Jurnal",
      cancelButtonText: "Tutup",
    });

    if (!result.isConfirmed) return;

    try {
      await financeService.voidJournal(journal.id, result.value);
      toast.success(`Jurnal ${journal.journal_number} berhasil dibatalkan (void).`);

      invalidateJournalsCache();
      invalidateJournalDetailCache(journal.id);
      await refresh();
    } catch (err: unknown) {
      toast.error(extractFinanceErrorMessage(err, "Gagal membatalkan jurnal."));
    }
  }, [refresh]);

  // 8. Transactional Action: Reverse Journal (Creates New Draft Reversal)
  const handleReverseJournal = useCallback(async (journal: JournalEntry) => {
    const result = await Swal.fire({
      title: "Buat Jurnal Pembalik (Reverse)?",
      html: `
        <div class="text-left text-xs space-y-2 text-slate-700">
          <p>Sistem akan membuat jurnal baru berstatus draft yang membalikkan posisi Debit dan Kredit dari jurnal <b>${journal.journal_number}</b>.</p>
          <p class="text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200">
            Jurnal asli tetap tersimpan secara permanen untuk integritas riwayat audit.
          </p>
        </div>
      `,
      icon: "info",
      input: "textarea",
      inputLabel: "Alasan Pembalikan (Wajib Diisi)",
      inputPlaceholder: "Tuliskan alasan pembuatan jurnal pembalik...",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Alasan pembalikan wajib diisi!";
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonColor: "#f39c12", // Solid brandWarmOrange-500
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Buat Jurnal Pembalik",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await financeService.reverseJournal(journal.id, result.value);
      const newJournal = res.data;

      invalidateJournalsCache();
      invalidateJournalDetailCache(journal.id);

      toast.success(
        newJournal?.journal_number
          ? `Jurnal pembalik ${newJournal.journal_number} berhasil dibuat sebagai draft.`
          : "Jurnal pembalik berhasil dibuat sebagai draft."
      );

      if (newJournal?.id) {
        navigate(`/finance/journals/${newJournal.id}`);
      } else {
        await refresh();
      }
    } catch (err: unknown) {
      toast.error(extractFinanceErrorMessage(err, "Gagal membuat jurnal pembalik."));
    }
  }, [navigate, refresh]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Refresh, Import/Export, Export Excel, Buat Jurnal */}
      <JournalsHeader
        onRefresh={refresh}
        isRefreshing={refreshing}
        onExport={handleExportExcel}
        isExporting={exporting}
        canManage={canManage}
      />

      {/* 2. Main Filters Toolbar (Search, Period, Status, Dates, Reset) */}
      <JournalsToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={filters.status || ""}
        onStatusChange={setStatus}
        periodId={filters.period_id || ""}
        onPeriodChange={setPeriodId}
        periods={periods}
        dateFrom={filters.date_from || ""}
        onDateFromChange={setDateFrom}
        dateTo={filters.date_to || ""}
        onDateToChange={setDateTo}
        onResetFilters={resetFilters}
        totalCount={pagination.total}
      />

      {/* 3. Error Banner */}
      {error && (
        <FinanceErrorState
          title="Gagal Memuat Daftar Jurnal"
          message={error}
          onRetry={refresh}
        />
      )}

      {/* 4. Desktop View Table (hidden on mobile) */}
      <div className="hidden md:block">
        <JournalsDesktopTable
          journals={journals}
          loading={loading}
          refreshing={refreshing}
          canManage={canManage}
          onPost={handlePostJournal}
          onVoid={handleVoidJournal}
          onReverse={handleReverseJournal}
        />
      </div>

      {/* 5. Mobile View Card List (hidden on desktop) */}
      <div className="md:hidden">
        <JournalsMobileList
          journals={journals}
          loading={loading}
        />
      </div>

      {/* 6. Server Pagination */}
      {!loading && pagination.total > 0 && (
        <JournalsPagination
          pagination={pagination}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}
    </div>
  );
}

export default JournalsPage;
