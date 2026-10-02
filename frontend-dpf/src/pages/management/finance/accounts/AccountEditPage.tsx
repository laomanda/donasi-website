import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faEdit, faLock } from "@fortawesome/free-solid-svg-icons";

import {
  AccountPageHeader,
  AccountForm,
  AccountTypeBadge,
} from "@/components/management/finance/accounts";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useAccount, invalidateAccountCache } from "@/hooks/finance/useAccount";
import { useAccountsData, invalidateAccountsDataCache } from "@/hooks/finance/useAccountsData";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";
import type { AccountPayload } from "@/types/finance";

export function AccountEditPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const accountId = Number(rawId);
  const isValidId = Number.isFinite(accountId) && accountId > 0;

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

  // 2. Fetch single account data (with instant cache fallback & refresh)
  const {
    account,
    loading: accountLoading,
    error: accountError,
  } = useAccount(isValidId ? accountId : undefined);

  // 3. Fetch accounts list for parent hierarchy options
  const { accounts, loading: accountsLoading } = useAccountsData();

  // 4. Form state
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 5. Submit Handler
  const handleSubmit = async (payload: AccountPayload) => {
    if (!isValidId || !account) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await financeService.updateAccount(accountId, payload);

      // Invalidate both list cache and individual cache
      invalidateAccountsDataCache();
      invalidateAccountCache(accountId);

      toast.success(`Perubahan akun [${account.code}] berhasil disimpan.`);

      // Navigate directly to the authoritative detail page
      navigate(`/finance/accounts/${accountId}`);
    } catch (err: unknown) {
      const errorMsg = extractFinanceErrorMessage(err, "Gagal memperbarui akun perkiraan.");
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
          title="Edit Akun"
          description="Ubah data akun perkiraan dalam bagan akun YWDP."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="Akses Ditolak"
            message="Anda tidak memiliki wewenang untuk mengubah data akun perkiraan. Hanya Divisi Keuangan dan Superadmin yang diizinkan."
            onRetry={() => navigate(isValidId ? `/finance/accounts/${accountId}` : "/finance/accounts")}
          />
        </div>
      </div>
    );
  }

  // Invalid ID state
  if (!isValidId) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Edit Akun"
          description="Ubah data akun perkiraan dalam bagan akun YWDP."
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

  // Loading skeleton
  if (accountLoading && !account) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-7 bg-slate-200 rounded w-64" />
          <div className="h-4 bg-slate-100 rounded w-96" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs h-96 bg-slate-50/50" />
      </div>
    );
  }

  // Error or Not Found state
  if (accountError || !account) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Edit Akun"
          description="Ubah data akun perkiraan dalam bagan akun YWDP."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="Akun Tidak Ditemukan"
            message={accountError || `Akun dengan ID ${accountId} tidak ditemukan.`}
            onRetry={() => navigate("/finance/accounts")}
          />
        </div>
      </div>
    );
  }

  const hasTransactions = (account.journal_entry_lines_count ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Context Badge */}
      <AccountPageHeader
        title={`Edit Akun: [${account.code}] ${account.name}`}
        description="Perbarui informasi identitas, klasifikasi, kategori laporan, dan struktur induk akun."
        badge={
          <div className="flex items-center gap-2">
            <AccountTypeBadge type={account.account_type} />
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                account.is_active
                  ? "bg-brandGreen-500 text-white"
                  : "bg-slate-600 text-white"
              }`}
            >
              {account.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        }
        breadcrumbs={[
          { label: "Bagan Akun", href: "/finance/accounts" },
          { label: `[${account.code}] ${account.name}`, href: `/finance/accounts/${account.id}` },
          { label: "Edit" },
        ]}
      />

      {/* 2. Audit Notice if Protected */}
      {hasTransactions && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-900 shadow-2xs flex items-start gap-2.5">
          <FontAwesomeIcon icon={faLock} className="text-amber-600 mt-0.5 text-sm" />
          <div className="space-y-0.5">
            <div className="font-bold">Sebagian Kolom Terkunci Demi Integritas Jurnal</div>
            <p className="font-normal text-amber-800 leading-relaxed">
              Akun ini telah memiliki transaksi jurnal aktif ({account.journal_entry_lines_count} baris jurnal). Kode akun, jenis akun, dan saldo normal tidak dapat diubah agar neraca historis tetap konsisten.
            </p>
          </div>
        </div>
      )}

      {/* 3. Server Error Banner if any */}
      {serverError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-2xs flex items-start gap-2.5">
          <FontAwesomeIcon icon={faInfoCircle} className="text-rose-600 mt-0.5 text-sm" />
          <div className="space-y-0.5">
            <div className="font-bold">Gagal Menyimpan Perubahan</div>
            <p className="font-normal text-rose-700 leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      {/* 4. Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Area (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
            <AccountForm
              mode="edit"
              account={account}
              accounts={accounts}
              loading={submitting || accountsLoading}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/finance/accounts/${account.id}`)}
            />
          </div>
        </div>

        {/* Right Info Sidebar (1 col) - Sticky so it follows scrolling */}
        <div className="lg:col-span-1 space-y-5 sticky top-24 self-start">
          <div className="rounded-2xl border border-slate-200 border-l-4 border-l-primary-500 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <FontAwesomeIcon icon={faEdit} className="text-primary-500" />
              <span>Petunjuk Edit Akun</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pastikan perubahan akun tetap selaras dengan hierarki bagan akun yayasan. Jika akun memiliki sub-akun, memindahkan akun induk akan memengaruhi tingkat hierarki secara bertingkat.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div>
                <strong>Tingkat Saat Ini:</strong> Level {account.level}
              </div>
              <div>
                <strong>Sub-Akun:</strong> {account.children_count ?? account.children?.length ?? 0} akun
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountEditPage;
