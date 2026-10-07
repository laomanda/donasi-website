import { useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import {
  AccountPageHeader,
  AccountDetailOverview,
  AccountHierarchyInfo,
  AccountMetadata,
} from "@/components/management/finance/accounts";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useToast } from "@/components/ui/ToastProvider";
import { useAccount, invalidateAccountCache } from "@/hooks/finance/useAccount";
import { invalidateAccountsDataCache } from "@/hooks/finance/useAccountsData";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";

export function AccountDetailPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const accountId = Number(rawId);
  const isValidId = Number.isFinite(accountId) && accountId > 0;

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

  // 2. Authoritative account data hook with instant cache fallback & background refresh
  const {
    account,
    loading,
    error,
    refresh,
  } = useAccount(isValidId ? accountId : undefined);

  // 3. Delete & Deactivate flow with SweetAlert
  const handleDelete = useCallback(async () => {
    if (!account || !canManage) return;

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
      toast.success("Akun perkiraan berhasil dihapus.");
      invalidateAccountsDataCache();
      invalidateAccountCache(account.id);
      navigate("/finance/accounts");
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
            invalidateAccountsDataCache();
            invalidateAccountCache(account.id);
            refresh(true);
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
  }, [account, canManage, navigate, refresh]);

  // Invalid ID state
  if (!isValidId) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Detail Akun"
          description="Informasi bagan akun perkiraan YWDP."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="ID Akun Tidak Valid"
            message={`Parameter ID akun "${rawId}" tidak valid. Pastikan URL yang dituju benar.`}
            onRetry={() => navigate("/finance/accounts")}
          />
        </div>
      </div>
    );
  }

  // Loading skeleton (matches structure, no full screen spinner)
  if (loading && !account) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-7 bg-slate-200 rounded w-64" />
          <div className="h-4 bg-slate-100 rounded w-96" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs h-64 bg-slate-50/50" />
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs h-48 bg-slate-50/50" />
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs h-80 bg-slate-50/50" />
          </div>
        </div>
      </div>
    );
  }

  // Error or Not Found state
  if (error || !account) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Detail Akun"
          description="Informasi bagan akun perkiraan YWDP."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="Akun Tidak Ditemukan"
            message={error || `Akun dengan ID ${accountId} tidak ditemukan dalam sistem.`}
            onRetry={() => navigate("/finance/accounts")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Action Buttons */}
      <AccountPageHeader
        title={`${account.code} — ${account.name}`}
        description="Detail klasifikasi, saldo normal, struktur hierarki, dan catatan integritas akun."
        breadcrumbs={[
          { label: "Bagan Akun", href: "/finance/accounts" },
          { label: `[${account.code}] ${account.name}` },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/finance/accounts"
              className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border border-white/30 bg-white/15 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-white/25 transition backdrop-blur-xs active:scale-95"
            >
              Kembali ke Bagan Akun
            </Link>

            {canManage && (
              <>
                <Link
                  to={`/finance/accounts/${account.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-slate-100 transition active:scale-95"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-xs text-primary-500" />
                  <span>Edit Akun</span>
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-rose-600 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition active:scale-95"
                  title="Hapus atau nonaktifkan akun"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  <span className="hidden sm:inline">Hapus / Nonaktifkan</span>
                  <span className="sm:hidden">Hapus</span>
                </button>
              </>
            )}
          </div>
        }
      />

      {/* 2. Responsive Institutional Grid (2 cols Main + 1 col Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content Area: Identity, Classification & Metadata (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <AccountDetailOverview account={account} />
          <AccountMetadata account={account} />
        </div>

        {/* Sidebar Area: Hierarchy, Parent & Children (1 col) - Sticky so it follows scrolling */}
        <div className="lg:col-span-1 sticky top-24 self-start">
          <AccountHierarchyInfo account={account} />
        </div>
      </div>
    </div>
  );
}

export default AccountDetailPage;
