import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faFileImport,
  faPlus,
  faSitemap,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import {
  AccountsSummary,
  AccountsQuickFilters,
  AccountsToolbar,
  AccountsDesktopTable,
  AccountsMobileList,
  AccountsPagination,
} from "@/components/management/finance/accounts";

import { useAccountsData } from "@/hooks/finance/useAccountsData";
import { useAccountFilters } from "@/hooks/finance/useAccountFilters";
import { useAccountTree } from "@/hooks/finance/useAccountTree";

import financeService from "@/services/financeService";
import { downloadBlobFile, extractFinanceErrorMessage } from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";
import type { Account } from "@/types/finance";

export function AccountsPage() {
  const navigate = useNavigate();

  // 1. RBAC Permissions
  const currentUser = getAuthUser();
  const userRoles = useMemo(() => {
    const roles = (currentUser?.roles ?? []).map((r) => r.name.toLowerCase());
    if (currentUser?.role_label) {
      roles.push(currentUser.role_label.toLowerCase());
    }
    return roles;
  }, [currentUser]);

  const canManage = userRoles.includes("keuangan") || userRoles.includes("superadmin");

  // 2. Data fetching with SWR module-level cache
  const {
    accounts,
    summary,
    loading,
    isRefreshing,
    error,
    refresh,
  } = useAccountsData();

  // 3. Search and filter states
  const {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    isFiltered,
    resetFilters,
  } = useAccountFilters();

  // 4. Tree processing & hierarchy state
  const {
    treeItems,
    flatFilteredItems,
    toggleExpand,
    expandAll,
    collapseAll,
    level1Count,
  } = useAccountTree({
    accounts,
    typeFilter,
    statusFilter,
    searchQuery,
    isFiltered,
  });

  // 5. Client-derived metrics fallback
  const clientCounts = useMemo(() => {
    let total = accounts.length;
    let asset = 0;
    let liability = 0;
    let net_asset = 0;
    let revenue = 0;
    let expense = 0;
    let active = 0;
    let inactive = 0;

    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      if (acc.is_active) active++;
      else inactive++;

      switch (acc.account_type) {
        case "asset":
          asset++;
          break;
        case "liability":
          liability++;
          break;
        case "net_asset":
          net_asset++;
          break;
        case "revenue":
          revenue++;
          break;
        case "expense":
          expense++;
          break;
      }
    }

    return { total, asset, liability, net_asset, revenue, expense, active, inactive };
  }, [accounts]);

  // 6. Navigation handlers (No modals)
  const handleView = useCallback(
    (acc: Account) => {
      navigate(`/finance/accounts/${acc.id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (acc: Account) => {
      navigate(`/finance/accounts/${acc.id}/edit`);
    },
    [navigate]
  );

  // 7. Excel Export
  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    setExporting(true);
    try {
      const params: Record<string, string> = {};
      if (typeFilter) params.account_type = typeFilter;
      if (statusFilter === "active") params.is_active = "1";
      if (statusFilter === "inactive") params.is_active = "0";

      const blob = await financeService.exportAccounts(params);
      downloadBlobFile(
        blob,
        `chart-of-accounts-ywdp-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      toast.success("Bagan akun berhasil diekspor.");
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengekspor bagan akun."));
    } finally {
      setExporting(false);
    }
  };

  // 8. Delete & Safe Deactivate Flow with solid color SweetAlert
  const handleDelete = useCallback(
    async (account: Account) => {
      if (!canManage) return;

      const result = await Swal.fire({
        title: "Hapus Akun?",
        html: `Apakah Anda yakin ingin menghapus akun perkiraan <br/><b class="font-mono text-slate-900">[${account.code}]</b> <b>${account.name}</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e11d48", // Solid red
        cancelButtonColor: "#64748b", // Slate
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;

      try {
        await financeService.deleteAccount(account.id);
        toast.success("Akun berhasil dihapus.");
        await refresh(true);
      } catch (err: unknown) {
        const msg = extractFinanceErrorMessage(err, "Gagal menghapus akun.");
        const isRestrictedByAudit =
          msg.includes("transaksi jurnal") || msg.includes("sub-akun");

        if (isRestrictedByAudit && account.is_active) {
          const deactPrompt = await Swal.fire({
            title: "Akun Terproteksi",
            text: `${msg} Sebagai alternatif yang aman, Anda dapat menonaktifkan status akun ini agar tidak dapat dipilih lagi dalam jurnal baru.`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3f8f3f", // Solid brandGreen-500
            cancelButtonColor: "#64748b",
            confirmButtonText: "Nonaktifkan Akun Ini",
            cancelButtonText: "Tutup",
          });

          if (deactPrompt.isConfirmed) {
            try {
              await financeService.updateAccount(account.id, { is_active: false });
              toast.success("Akun berhasil dinonaktifkan.");
              await refresh(true);
            } catch (deactErr) {
              toast.error(
                extractFinanceErrorMessage(deactErr, "Gagal menonaktifkan akun.")
              );
            }
          }
        } else {
          Swal.fire({
            title: "Operasi Ditolak",
            text: msg,
            icon: "error",
            confirmButtonColor: "#64748b",
            confirmButtonText: "Mengerti",
          });
        }
      }
    },
    [canManage, refresh]
  );

  // 9. Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Reset page to 1 when filters or view mode change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter, viewMode]);

  const totalItems = viewMode === "tree" ? treeItems.length : flatFilteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  const paginatedTreeItems = useMemo(() => {
    return treeItems.slice(startIndex, endIndex);
  }, [treeItems, startIndex, endIndex]);

  const paginatedFlatItems = useMemo(() => {
    return flatFilteredItems.slice(startIndex, endIndex);
  }, [flatFilteredItems, startIndex, endIndex]);

  const fromItem = totalItems === 0 ? 0 : startIndex + 1;
  const toItem = Math.min(endIndex, totalItems);

  const paginationElement = (
    <AccountsPagination
      currentPage={safeCurrentPage}
      totalPages={totalPages}
      perPage={perPage}
      totalItems={totalItems}
      fromItem={fromItem}
      toItem={toItem}
      onPageChange={setCurrentPage}
      onPerPageChange={(size: number) => {
        setPerPage(size);
        setCurrentPage(1);
      }}
    />
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Page Header */}
      <FinancePageHeader
        title="Bagan Akun"
        description="Kelola struktur, klasifikasi, dan status akun pembukuan YWDP."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/finance/import"
              className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
            >
              <FontAwesomeIcon icon={faFileImport} className="text-slate-500" />
              <span>Import / Export</span>
            </Link>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-brandGreen-500" />
              <span>{exporting ? "Mengunduh..." : "Export Excel"}</span>
            </button>

            {canManage && (
              <Link
                to="/finance/accounts/create"
                className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-primary-500 px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>Tambah Akun</span>
              </Link>
            )}
          </div>
        }
      />

      {/* 2. Summary KPI Cards */}
      <AccountsSummary
        summary={summary}
        totalFallback={clientCounts.total}
        activeFallback={clientCounts.active}
        inactiveFallback={clientCounts.inactive}
        level1Count={level1Count}
      />

      {/* 3. Quick Account Type Filter Segmented Buttons */}
      <AccountsQuickFilters
        typeFilter={typeFilter}
        onSelectType={(newType: import("@/types/finance").AccountType | "") =>
          setTypeFilter(typeFilter === newType ? "" : newType)
        }
        summary={summary}
        counts={clientCounts}
      />

      {/* 4. Toolbar & Controls Bar */}
      <AccountsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        displayedCount={totalItems}
        totalCount={accounts.length}
        isFiltered={isFiltered}
        onResetFilters={resetFilters}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onRefresh={() => refresh(true)}
        isRefreshing={isRefreshing}
      />

      {/* 5. Main Workspace (Desktop Table + Mobile Cards) */}
      {loading && accounts.length === 0 ? (
        <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs p-4">
          <div className="hidden md:block">
            <FinanceTableSkeleton rows={8} cols={7} />
          </div>
          <div className="md:hidden space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-200 p-3.5 space-y-2.5 bg-slate-50">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs p-8">
          <FinanceErrorState
            title="Gagal memuat daftar akun"
            message={error}
            onRetry={() => refresh(true)}
          />
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs p-8">
          <FinanceEmptyState
            title="Belum ada akun perkiraan"
            description="Bagan akun belum memiliki data. Silakan tambahkan akun pertama."
            icon={faSitemap}
            action={
              canManage ? (
                <Link
                  to="/finance/accounts/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-600 transition"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Tambah Akun</span>
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : totalItems === 0 ? (
        <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs p-8">
          <FinanceEmptyState
            title="Akun tidak ditemukan"
            description="Tidak ditemukan akun perkiraan dengan kriteria pencarian dan filter yang Anda pilih."
            icon={faSearch}
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Reset Filter
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= md) */}
          <AccountsDesktopTable
            viewMode={viewMode}
            treeItems={paginatedTreeItems}
            flatItems={paginatedFlatItems}
            canManage={canManage}
            onToggleExpand={toggleExpand}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={paginationElement}
          />

          {/* Mobile Card List View (< md) */}
          <AccountsMobileList
            viewMode={viewMode}
            treeItems={paginatedTreeItems}
            flatItems={paginatedFlatItems}
            canManage={canManage}
            onToggleExpand={toggleExpand}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={paginationElement}
          />
        </>
      )}
    </div>
  );
}

export default AccountsPage;
