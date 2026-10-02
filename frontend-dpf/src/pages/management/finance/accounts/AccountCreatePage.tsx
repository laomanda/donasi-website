import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faInfoCircle, faFolderTree } from "@fortawesome/free-solid-svg-icons";

import {
  AccountPageHeader,
  AccountForm,
} from "@/components/management/finance/accounts";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useAccountsData, invalidateAccountsDataCache } from "@/hooks/finance/useAccountsData";
import { invalidateAccountCache } from "@/hooks/finance/useAccount";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { getAuthUser } from "@/lib/auth";
import type { AccountPayload } from "@/types/finance";

export function AccountCreatePage() {
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

  // 2. Fetch parent accounts from cache / API
  const { accounts, loading: accountsLoading } = useAccountsData();

  // 3. Form submit state
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 4. Handle Submit
  const handleSubmit = async (payload: AccountPayload) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const response = await financeService.createAccount(payload);
      const newAccount = response.data;

      // Invalidate list cache so newly created account immediately reflects in table
      invalidateAccountsDataCache();
      if (newAccount?.id) {
        invalidateAccountCache(newAccount.id);
      }

      toast.success(`Akun [${newAccount?.code || payload.code}] berhasil dibuat.`);

      // Navigate to the newly created account detail page if ID exists, else to list
      if (newAccount?.id) {
        navigate(`/finance/accounts/${newAccount.id}`);
      } else {
        navigate("/finance/accounts");
      }
    } catch (err: unknown) {
      const errorMsg = extractFinanceErrorMessage(err, "Gagal membuat akun perkiraan baru.");
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
          title="Tambah Akun"
          description="Tambahkan akun baru ke struktur bagan akun YWDP."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="Akses Ditolak"
            message="Anda tidak memiliki wewenang untuk menambahkan akun perkiraan. Hanya Divisi Keuangan dan Superadmin yang diizinkan."
            onRetry={() => navigate("/finance/accounts")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs */}
      <AccountPageHeader
        title="Tambah Akun"
        description="Tambahkan akun baru ke struktur bagan akun YWDP."
        breadcrumbs={[
          { label: "Bagan Akun", href: "/finance/accounts" },
          { label: "Tambah Akun" },
        ]}
      />

      {/* 2. Server Error Banner if any */}
      {serverError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-2xs flex items-start gap-2.5">
          <FontAwesomeIcon icon={faInfoCircle} className="text-rose-600 mt-0.5 text-sm" />
          <div className="space-y-0.5">
            <div className="font-bold">Gagal Menyimpan Akun</div>
            <p className="font-normal text-rose-700 leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      {/* 3. Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Area (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
            <AccountForm
              mode="create"
              accounts={accounts}
              loading={submitting || accountsLoading}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/finance/accounts")}
            />
          </div>
        </div>

        {/* Right Contextual Guide Sidebar (1 col) - Sticky so it follows scrolling */}
        <div className="lg:col-span-1 space-y-5 sticky top-24 self-start">
          {/* Guide Card 1 */}
          <div className="rounded-2xl border border-slate-200 border-l-4 border-l-primary-500 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <FontAwesomeIcon icon={faPlusCircle} className="text-primary-500" />
              <span>Panduan Pembuatan Akun</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-slate-800">Kode Akun:</strong> Pastikan kode akun unik dan mengikuti hierarki akun induk (misal: 1101 untuk Kas).
              </li>
              <li>
                <strong className="text-slate-800">Akun Induk:</strong> Pilih akun induk jika akun ini merupakan sub-akun. Tingkat (level) akan dihitung otomatis.
              </li>
              <li>
                <strong className="text-slate-800">Saldo Normal:</strong> Posisi saldo normal akan ditentukan otomatis berdasarkan jenis akun, namun dapat disesuaikan jika perlu.
              </li>
            </ul>
          </div>

          {/* Guide Card 2: Hierarchy reference */}
          <div className="rounded-2xl border border-slate-200 border-l-4 border-l-brandBlueTeal-500 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <FontAwesomeIcon icon={faFolderTree} className="text-brandBlueTeal-500" />
              <span>Tingkat Hierarki</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Level 1</span>
                <span className="text-slate-500 text-[11px]">Akun Induk Utama (1-9)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Level 2</span>
                <span className="text-slate-500 text-[11px]">Golongan Akun (2 digit)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Level 3</span>
                <span className="text-slate-500 text-[11px]">Sub-Golongan (3 digit)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Level 4</span>
                <span className="text-slate-500 text-[11px]">Akun Buku Besar / Transaksi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountCreatePage;
