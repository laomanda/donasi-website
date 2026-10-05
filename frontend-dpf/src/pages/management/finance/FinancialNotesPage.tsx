import { useState, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getAuthUser } from "@/lib/auth";
import financeService from "@/services/financeService";
import {
  extractFinanceErrorMessage,
  downloadBlobFile,
} from "@/utils/financeUtils";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useFinancialNoteFilters } from "@/hooks/finance/useFinancialNoteFilters";
import { useFinancialNotes } from "@/hooks/finance/useFinancialNotes";
import { useFinancialNoteActions } from "@/hooks/finance/useFinancialNoteActions";
import { buildFinancialNoteExportParams } from "@/utils/finance/financialNotesQuery";
import { groupFinancialNotesByCategory } from "@/utils/finance/financialNotesDisplay";
import type { FinancialNote } from "@/types/finance";
import {
  FinancialNotesHeader,
  FinancialNotesFilters,
  FinancialNotesSummary,
  FinancialNotesToolbar,
  FinancialNotesReportHeader,
  FinancialNotesNarrative,
  FinancialNotesDesktopTable,
  FinancialNotesMobileList,
  FinancialNoteDeleteDialog,
} from "@/components/management/finance/financial-notes";

export function FinancialNotesPage() {
  const [exporting, setExporting] = useState<boolean>(false);
  const [deletingNote, setDeletingNote] = useState<FinancialNote | null>(null);

  // RBAC Permission Check
  const currentUser = getAuthUser();
  const canManage = useMemo(() => {
    const roles = (currentUser?.roles ?? []).map((r) => r.name.toLowerCase());
    if (currentUser?.role_label) {
      roles.push(currentUser.role_label.toLowerCase());
    }
    return roles.includes("keuangan") || roles.includes("superadmin");
  }, [currentUser]);

  // 1. Shared Accounting Periods Cache
  const { periods } = useFinancePeriods();

  // 2. URL Synchronized Filters
  const {
    filters,
    periodId,
    category,
    status,
    search,
    viewMode,
    isFilterActive,
    setPeriodId,
    setCategory,
    setStatus,
    setSearch,
    setViewMode,
    resetFilters,
  } = useFinancialNoteFilters();

  // 3. SWR Cached Notes List & Summary Query
  const {
    notes,
    summary,
    loading,
    refreshing,
    error,
    refresh,
  } = useFinancialNotes({ periodId, category, status });

  // 4. Delete Action Hook
  const { deleting, deleteNote } = useFinancialNoteActions();

  // 5. Client Search Filtering
  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase().trim();
    return notes.filter((n) => {
      const titleMatch = (n.title || "").toLowerCase().includes(q);
      const contentMatch = (n.content || "").toLowerCase().includes(q);
      const catMatch = (n.category_label || n.category || "").toLowerCase().includes(q);
      const creatorMatch = (n.creator_name || "").toLowerCase().includes(q);
      return titleMatch || contentMatch || catMatch || creatorMatch;
    });
  }, [notes, search]);

  // 6. Grouped Notes for Narrative Report View
  const groupedNotes = useMemo(() => {
    return groupFinancialNotesByCategory(filteredNotes, category);
  }, [filteredNotes, category]);

  // Active Period Object
  const selectedPeriodObj = useMemo(() => {
    if (periodId === "") return null;
    return periods.find((p) => p.id === Number(periodId)) || null;
  }, [periods, periodId]);

  // 7. Handle Excel Export
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const exportParams = buildFinancialNoteExportParams(filters);
      const blob = await financeService.exportFinancialNotes(exportParams);
      const pName = selectedPeriodObj
        ? (selectedPeriodObj.name || selectedPeriodObj.period_name || "Periode").replace(/\s+/g, "_")
        : "Semua_Periode";
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Catatan_Atas_Laporan_Keuangan_${pName}_${today}.xlsx`
      );
      toast.success("Catatan Keuangan (CLK) Excel berhasil diunduh.");
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal mengunduh catatan laporan keuangan.")
      );
    } finally {
      setExporting(false);
    }
  }, [filters, selectedPeriodObj]);

  // 8. Handle Browser Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 9. Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingNote) return;
    try {
      await deleteNote(deletingNote.id);
      toast.success("Catatan keuangan berhasil dihapus.");
      setDeletingNote(null);
      await refresh();
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal menghapus catatan keuangan.")
      );
    }
  };

  const createUrl = `/finance/financial-notes/create${periodId ? `?period_id=${periodId}` : ""}`;

  return (
    <div className="space-y-6 print:space-y-4 print:p-0 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <FinancialNotesHeader
        totalNotesCount={summary?.total_notes ?? notes.length}
        canManage={canManage}
        refreshing={refreshing}
        exporting={exporting}
        createUrl={createUrl}
        onRefresh={() => void refresh()}
        onExport={() => void handleExport()}
        onPrint={handlePrint}
      />

      {/* Filter Toolbar */}
      <FinancialNotesFilters
        periods={periods}
        periodId={periodId}
        category={category}
        status={status}
        searchQuery={search}
        isFilterActive={isFilterActive}
        onPeriodChange={setPeriodId}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onReset={resetFilters}
      />

      {/* Summary KPI Cards */}
      <FinancialNotesSummary summary={summary} loading={refreshing} />

      {/* View Mode & Quick Nav Toolbar */}
      <FinancialNotesToolbar
        viewMode={viewMode}
        periodId={periodId}
        searchQuery={search}
        totalCount={notes.length}
        filteredCount={filteredNotes.length}
        onViewModeChange={setViewMode}
        onClearSearch={() => setSearch("")}
      />

      {/* Initial Loading Skeleton */}
      {loading && !notes.length && (
        <div className="space-y-6 animate-pulse">
          <div className="h-28 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      )}

      {/* Error State */}
      {error && !notes.length && (
        <FinanceErrorState
          title="Gagal Memuat Catatan atas Laporan Keuangan"
          message={error}
          onRetry={refresh}
        />
      )}

      {/* Main Content Body */}
      {(!loading || notes.length > 0) && (
        <div className="space-y-6">
          {/* Formal Print Banner & Narrative Screen Header */}
          <div className={viewMode === "narrative" ? "block" : "hidden print:block"}>
            <FinancialNotesReportHeader period={selectedPeriodObj} />
          </div>

          {/* Narrative View Mode (Default & Always used in Print) */}
          <div className={viewMode === "narrative" ? "block" : "hidden print:block"}>
            <FinancialNotesNarrative
              groups={groupedNotes}
              totalNotes={filteredNotes.length}
              periodId={periodId}
              canManage={canManage}
              onDeleteClick={(note) => setDeletingNote(note)}
              onResetFilters={resetFilters}
            />
          </div>

          {/* Table View Mode (Screen only) */}
          {viewMode === "table" && (
            <div className="print:hidden space-y-4">
              <FinancialNotesDesktopTable
                notes={filteredNotes}
                periodId={periodId}
                canManage={canManage}
                onDeleteClick={(note) => setDeletingNote(note)}
                onResetFilters={resetFilters}
              />

              <FinancialNotesMobileList
                notes={filteredNotes}
                periodId={periodId}
                canManage={canManage}
                onDeleteClick={(note) => setDeletingNote(note)}
                onResetFilters={resetFilters}
              />
            </div>
          )}
        </div>
      )}

      {/* Accessible Delete Confirmation Dialog */}
      <FinancialNoteDeleteDialog
        note={deletingNote}
        deleting={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingNote(null)}
      />
    </div>
  );
}

export default FinancialNotesPage;
