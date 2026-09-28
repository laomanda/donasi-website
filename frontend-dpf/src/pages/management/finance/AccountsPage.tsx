import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faFileExcel,
  faFileImport,
  faPlus,
  faSearch,
  faTimes,
  faRotateRight,
  faChevronRight,
  faChevronDown,
  faFolder,
  faFolderOpen,
  faFile,
  faEye,
  faEdit,
  faTrash,
  faTable,
  faFolderTree,
  faLayerGroup,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import {
  FinancePageHeader,
  FinanceStatCard,
  FinanceStatusBadge,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import { AccountDetailModal } from "@/components/management/finance/AccountDetailModal";
import { AccountFormModal } from "@/components/management/finance/AccountFormModal";
import financeService from "@/services/financeService";
import {
  downloadBlobFile,
  extractFinanceErrorMessage,
  getAccountTypeLabel,
  getNormalBalanceLabel,
  getAccountTypeBadgeClass,
} from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";
import type { Account, AccountType, AccountSummary } from "@/types/finance";

interface FlatTreeItem {
  account: Account;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

export function AccountsPage() {
  // RBAC Permission Check
  const currentUser = getAuthUser();
  const userRoles = useMemo(() => {
    const roles = (currentUser?.roles ?? []).map((r) => r.name.toLowerCase());
    if (currentUser?.role_label) {
      roles.push(currentUser.role_label.toLowerCase());
    }
    return roles;
  }, [currentUser]);

  const canManage = userRoles.includes("keuangan") || userRoles.includes("superadmin");

  // Data states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");

  // Expand / Collapse state for Tree View
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Modals state
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Fetch Accounts from API
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.getAccounts({ all: true });
      const rawData = res.data;
      const list: Account[] = Array.isArray(rawData)
        ? rawData
        : (rawData as { data?: Account[] })?.data ?? [];

      setAccounts(list);
      if (res.summary) {
        setSummary(res.summary);
      }

      // Default expand level 1 and level 2 accounts
      const defaultExpanded = new Set<number>();
      list.forEach((acc) => {
        if (acc.level <= 2) {
          defaultExpanded.add(acc.id);
        }
      });
      setExpandedIds(defaultExpanded);
    } catch (err) {
      const msg = extractFinanceErrorMessage(err, "Gagal memuat daftar akun.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Export COA to Excel
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

  // Toggle individual tree item expansion
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all accounts
  const handleExpandAll = () => {
    const allIds = new Set<number>();
    accounts.forEach((acc) => allIds.add(acc.id));
    setExpandedIds(allIds);
  };

  // Collapse all accounts
  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Reset all active filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const isFiltered = Boolean(searchQuery.trim() || typeFilter || statusFilter);

  // Delete / Deactivate Account handler
  const handleDelete = async (account: Account) => {
    if (!canManage) return;

    const result = await Swal.fire({
      title: "Hapus Akun?",
      html: `Apakah Anda yakin ingin menghapus akun perkiraan <br/><b class="font-mono text-emerald-700">[${account.code}]</b> <b>${account.name}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await financeService.deleteAccount(account.id);
      toast.success("Akun berhasil dihapus.");
      fetchAccounts();
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
          confirmButtonColor: "#059669",
          cancelButtonColor: "#64748b",
          confirmButtonText: "Nonaktifkan Akun Ini",
          cancelButtonText: "Tutup",
        });

        if (deactPrompt.isConfirmed) {
          try {
            await financeService.updateAccount(account.id, { is_active: false });
            toast.success("Akun berhasil dinonaktifkan.");
            fetchAccounts();
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
  };

  // Build hierarchical tree structure using useMemo
  const { treeItems, flatFilteredItems } = useMemo(() => {
    // First, filter by type and status if applied
    let filtered = accounts;

    if (typeFilter) {
      filtered = filtered.filter((acc) => acc.account_type === typeFilter);
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((acc) => acc.is_active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((acc) => !acc.is_active);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (acc) =>
          acc.code.toLowerCase().includes(q) ||
          acc.name.toLowerCase().includes(q) ||
          (acc.report_category && acc.report_category.toLowerCase().includes(q))
      );
    }

    // Sort flat filtered items by code
    const sortedFlat = [...filtered].sort((a, b) => a.code.localeCompare(b.code));

    // Build children mapping for tree construction
    const childrenMap = new Map<number, Account[]>();
    accounts.forEach((acc) => {
      if (acc.parent_id != null) {
        const list = childrenMap.get(acc.parent_id) ?? [];
        list.push(acc);
        childrenMap.set(acc.parent_id, list);
      }
    });

    // Sort children lists by code
    childrenMap.forEach((childList) => {
      childList.sort((a, b) => a.code.localeCompare(b.code));
    });

    // If search or type filter is active, find which IDs are matched
    // and keep their ancestor chains visible
    const matchedIds = new Set(filtered.map((a) => a.id));
    const visibleInTreeIds = new Set<number>();

    if (isFiltered) {
      const accountMap = new Map<number, Account>(accounts.map((a) => [a.id, a]));
      matchedIds.forEach((id) => {
        visibleInTreeIds.add(id);
        let curr = accountMap.get(id);
        while (curr && curr.parent_id != null) {
          visibleInTreeIds.add(curr.parent_id);
          curr = accountMap.get(curr.parent_id);
        }
      });
    }

    // Flatten tree respecting expansion state
    const flattenedTree: FlatTreeItem[] = [];

    const traverse = (node: Account, depth: number) => {
      // If filtering is on, only show nodes in visibleInTreeIds
      if (isFiltered && !visibleInTreeIds.has(node.id)) {
        return;
      }

      const nodeChildren = childrenMap.get(node.id) ?? [];
      const hasChildren = nodeChildren.length > 0;
      // If filtered, auto-expand ancestors so matched accounts are visible
      const isExpanded = isFiltered ? true : expandedIds.has(node.id);

      flattenedTree.push({
        account: node,
        depth,
        hasChildren,
        isExpanded,
      });

      if (hasChildren && isExpanded) {
        nodeChildren.forEach((child) => traverse(child, depth + 1));
      }
    };

    // Find root nodes (parent_id === null or parent not in dataset)
    const allAccountIds = new Set(accounts.map((a) => a.id));
    const rootNodes = accounts.filter(
      (a) => a.parent_id == null || !allAccountIds.has(a.parent_id)
    );
    rootNodes.sort((a, b) => a.code.localeCompare(b.code));

    rootNodes.forEach((root) => traverse(root, 0));

    return {
      treeItems: flattenedTree,
      flatFilteredItems: sortedFlat,
    };
  }, [accounts, typeFilter, statusFilter, searchQuery, isFiltered, expandedIds]);

  // Total level 1 count
  const level1Count = useMemo(() => {
    return accounts.filter((a) => a.level === 1).length;
  }, [accounts]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <FinancePageHeader
        title="Daftar Akun"
        description="Kelola struktur dan klasifikasi akun keuangan YWDP."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/finance/import"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
            >
              <FontAwesomeIcon icon={faFileImport} className="text-slate-500" />
              <span>Import / Export</span>
            </Link>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-emerald-600" />
              <span>{exporting ? "Mengunduh..." : "Export Excel"}</span>
            </button>

            {canManage && (
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>Tambah Akun</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <FinanceStatCard
          title="Total Akun Terdaftar"
          value={summary?.total ?? accounts.length}
          helper="Seluruh kode akun COA"
          icon={faSitemap}
          tone="emerald"
        />
        <FinanceStatCard
          title="Akun Aktif"
          value={summary?.active ?? accounts.filter((a) => a.is_active).length}
          helper="Dapat digunakan di jurnal"
          icon={faCircleCheck}
          tone="emerald"
        />
        <FinanceStatCard
          title="Akun Tidak Aktif"
          value={summary?.inactive ?? accounts.filter((a) => !a.is_active).length}
          helper="Akun nonaktif / ditutup"
          icon={faCircleXmark}
          tone="slate"
        />
        <FinanceStatCard
          title="Akun Induk Utama"
          value={level1Count}
          helper="Akun klasifikasi Level 1"
          icon={faLayerGroup}
          tone="sky"
        />
      </div>

      {/* Account Type Pills Filter (Instant Quick Filter) */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Filter Cepat:</span>
        <button
          type="button"
          onClick={() => setTypeFilter("")}
          className={`rounded-full px-3 py-1 font-semibold transition border ${
            typeFilter === ""
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua ({summary?.total ?? accounts.length})
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter(typeFilter === "asset" ? "" : "asset")}
          className={`rounded-full px-3 py-1 font-semibold transition border ${
            typeFilter === "asset"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          }`}
        >
          Aset ({summary?.asset ?? accounts.filter((a) => a.account_type === "asset").length})
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter(typeFilter === "liability" ? "" : "liability")}
          className={`rounded-full px-3 py-1 font-semibold transition border ${
            typeFilter === "liability"
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
          }`}
        >
          Liabilitas ({summary?.liability ?? accounts.filter((a) => a.account_type === "liability").length})
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter(typeFilter === "net_asset" ? "" : "net_asset")}
          className={`rounded-full px-3 py-1 font-semibold transition border ${
            typeFilter === "net_asset"
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          }`}
        >
          Aset Neto ({summary?.net_asset ?? accounts.filter((a) => a.account_type === "net_asset").length})
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter(typeFilter === "revenue" ? "" : "revenue")}
          className={`rounded-full px-3 py-1 font-semibold transition border ${
            typeFilter === "revenue"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          Penerimaan ({summary?.revenue ?? accounts.filter((a) => a.account_type === "revenue").length})
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter(typeFilter === "expense" ? "" : "expense")}
          className={`rounded-full px-3 py-1 font-semibold transition border ${
            typeFilter === "expense"
              ? "bg-rose-600 text-white border-rose-600"
              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
          }`}
        >
          Beban ({summary?.expense ?? accounts.filter((a) => a.account_type === "expense").length})
        </button>
      </div>

      {/* 3. Toolbar & Filters */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode atau nama akun..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            )}
          </div>

          {/* Filter Jenis Akun */}
          <div className="w-full md:w-44">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AccountType | "")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Semua Jenis Akun</option>
              <option value="asset">Aset</option>
              <option value="liability">Liabilitas</option>
              <option value="net_asset">Aset Neto</option>
              <option value="revenue">Penerimaan</option>
              <option value="expense">Beban</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="w-full md:w-36">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "" | "active" | "inactive")
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-2xl border border-slate-200 p-0.5 bg-slate-50 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "tree"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FontAwesomeIcon icon={faFolderTree} className="text-xs" />
              <span>Hierarki</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("flat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "flat"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FontAwesomeIcon icon={faTable} className="text-xs" />
              <span>Tabel</span>
            </button>
          </div>
        </div>

        {/* Secondary toolbar actions (Expand/Collapse & Reset) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan{" "}
              <strong className="text-slate-800 font-mono">
                {viewMode === "tree" ? treeItems.length : flatFilteredItems.length}
              </strong>{" "}
              dari <strong className="text-slate-800 font-mono">{accounts.length}</strong> akun
            </span>

            {isFiltered && (
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                Filter Aktif
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "tree" && (
              <>
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="text-slate-600 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                >
                  Buka Semua
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="text-slate-600 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                >
                  Tutup Semua
                </button>
              </>
            )}

            {isFiltered && (
              <>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded hover:bg-rose-50 transition"
                >
                  Reset Filter
                </button>
              </>
            )}

            <button
              type="button"
              onClick={fetchAccounts}
              disabled={loading}
              title="Refresh Data"
              className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className={loading ? "animate-spin text-xs" : "text-xs"}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Table / Tree Container */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="py-3.5 px-4 min-w-[200px]">Kode & Nama Akun</th>
                  <th scope="col" className="py-3.5 px-4 w-28">Jenis</th>
                  <th scope="col" className="py-3.5 px-4 w-28">Saldo Normal</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[150px]">Kategori Laporan</th>
                  <th scope="col" className="py-3.5 px-4 w-20 text-center">Level</th>
                  <th scope="col" className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th scope="col" className="py-3.5 px-4 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <FinanceTableSkeleton rows={10} cols={7} />
            </table>
          </div>
        ) : error ? (
          <div className="p-8">
            <FinanceErrorState
              title="Gagal memuat daftar akun."
              message={error}
              onRetry={fetchAccounts}
            />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-8">
            <FinanceEmptyState
              title="Belum ada akun"
              description="Bagan akun belum memiliki data. Silakan tambahkan akun pertama."
              icon={faSitemap}
              action={
                canManage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAccount(null);
                      setIsFormOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Tambah Akun</span>
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (viewMode === "tree" ? treeItems.length === 0 : flatFilteredItems.length === 0) ? (
          <div className="p-8">
            <FinanceEmptyState
              title="Akun tidak ditemukan"
              description="Tidak ditemukan akun perkiraan dengan kriteria pencarian dan filter yang Anda pilih."
              icon={faSearch}
              action={
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Reset Filter
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="py-3.5 px-4 min-w-[200px]">
                    Kode & Nama Akun
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-28">
                    Jenis
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-28">
                    Saldo Normal
                  </th>
                  <th scope="col" className="py-3.5 px-4 min-w-[150px]">
                    Kategori Laporan
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-20 text-center">
                    Level
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-28 text-center">
                    Status
                  </th>
                  <th scope="col" className="py-3.5 px-4 w-28 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {viewMode === "tree"
                  ? treeItems.map((item) => {
                      const { account, depth, hasChildren, isExpanded } = item;
                      const indentPx = depth * 22;

                      return (
                        <tr
                          key={account.id}
                          className={`hover:bg-slate-50/80 transition group ${
                            account.level === 1
                              ? "bg-slate-50/40 font-semibold"
                              : ""
                          }`}
                        >
                          {/* Kode & Nama Akun (with tree indentation) */}
                          <td className="py-3 px-4">
                            <div
                              className="flex items-center gap-2"
                              style={{ paddingLeft: `${indentPx}px` }}
                            >
                              {/* Expand/Collapse Chevron */}
                              {hasChildren ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(account.id);
                                  }}
                                  className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                                >
                                  <FontAwesomeIcon
                                    icon={isExpanded ? faChevronDown : faChevronRight}
                                    className="text-[10px]"
                                  />
                                </button>
                              ) : (
                                <span className="w-5 flex justify-center text-slate-300 text-[10px]">
                                  •
                                </span>
                              )}

                              {/* Folder or File Icon */}
                              <FontAwesomeIcon
                                icon={
                                  hasChildren
                                    ? isExpanded
                                      ? faFolderOpen
                                      : faFolder
                                    : faFile
                                }
                                className={`text-xs ${
                                  account.level === 1
                                    ? "text-emerald-700"
                                    : hasChildren
                                    ? "text-amber-500"
                                    : "text-slate-400"
                                }`}
                              />

                              {/* Code */}
                              <span
                                className={`font-mono tabular-nums tracking-tight ${
                                  account.level === 1
                                    ? "font-bold text-slate-900"
                                    : "font-semibold text-slate-800"
                                }`}
                              >
                                {account.code}
                              </span>

                              <span className="text-slate-300">|</span>

                              {/* Name */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setIsDetailOpen(true);
                                }}
                                className="text-left font-medium text-slate-900 hover:text-emerald-700 hover:underline transition"
                              >
                                {account.name}
                              </button>
                            </div>
                          </td>

                          {/* Jenis Akun */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getAccountTypeBadgeClass(
                                account.account_type
                              )}`}
                            >
                              {getAccountTypeLabel(account.account_type)}
                            </span>
                          </td>

                          {/* Saldo Normal */}
                          <td className="py-3 px-4 text-slate-700">
                            {getNormalBalanceLabel(account.normal_balance)}
                          </td>

                          {/* Kategori Laporan */}
                          <td className="py-3 px-4 text-slate-600">
                            {account.report_category || (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>

                          {/* Level */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center h-5 w-6 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                              L{account.level}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <FinanceStatusBadge
                              status={account.is_active ? "active" : "closed"}
                              label={account.is_active ? "Aktif" : "Tidak Aktif"}
                            />
                          </td>

                          {/* Aksi */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setIsDetailOpen(true);
                                }}
                                title="Lihat Detail"
                                className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-700 transition"
                              >
                                <FontAwesomeIcon icon={faEye} className="text-xs" />
                              </button>

                              {canManage && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAccount(account);
                                      setIsFormOpen(true);
                                    }}
                                    title="Edit Akun"
                                    className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                                  >
                                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(account)}
                                    title="Hapus / Nonaktifkan"
                                    className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  : flatFilteredItems.map((account) => (
                      <tr
                        key={account.id}
                        className="hover:bg-slate-50/80 transition group"
                      >
                        {/* Kode & Nama Akun (Flat) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums font-bold text-slate-800">
                              {account.code}
                            </span>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAccount(account);
                                setIsDetailOpen(true);
                              }}
                              className="text-left font-medium text-slate-900 hover:text-emerald-700 hover:underline transition"
                            >
                              {account.name}
                            </button>
                          </div>
                          {account.parent && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 pl-0.5">
                              Induk: {account.parent.code} - {account.parent.name}
                            </div>
                          )}
                        </td>

                        {/* Jenis Akun */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getAccountTypeBadgeClass(
                              account.account_type
                            )}`}
                          >
                            {getAccountTypeLabel(account.account_type)}
                          </span>
                        </td>

                        {/* Saldo Normal */}
                        <td className="py-3 px-4 text-slate-700">
                          {getNormalBalanceLabel(account.normal_balance)}
                        </td>

                        {/* Kategori Laporan */}
                        <td className="py-3 px-4 text-slate-600">
                          {account.report_category || (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Level */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center h-5 w-6 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                            L{account.level}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <FinanceStatusBadge
                            status={account.is_active ? "active" : "closed"}
                            label={account.is_active ? "Aktif" : "Tidak Aktif"}
                          />
                        </td>

                        {/* Aksi */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAccount(account);
                                setIsDetailOpen(true);
                              }}
                              title="Lihat Detail"
                              className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-700 transition"
                            >
                              <FontAwesomeIcon icon={faEye} className="text-xs" />
                            </button>

                            {canManage && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAccount(account);
                                    setIsFormOpen(true);
                                  }}
                                  title="Edit Akun"
                                  className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(account)}
                                  title="Hapus / Nonaktifkan"
                                  className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Account Detail Modal */}
      <AccountDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        canEdit={canManage}
        onEdit={(acc) => {
          setEditingAccount(acc);
          setIsFormOpen(true);
        }}
      />

      {/* 6. Account Create / Edit Form Modal */}
      <AccountFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        accounts={accounts}
        onSuccess={fetchAccounts}
      />
    </div>
  );
}

export default AccountsPage;
