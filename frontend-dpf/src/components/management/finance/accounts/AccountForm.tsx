import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faArrowLeft,
  faSpinner,
  faTriangleExclamation,
  faLock,
  faFolderTree,
} from "@fortawesome/free-solid-svg-icons";
import type {
  Account,
  AccountType,
  NormalBalance,
  AccountPayload,
} from "@/types/finance";

const COMMON_REPORT_CATEGORIES = [
  "Aset Lancar",
  "Kas dan Setara Kas",
  "Piutang",
  "Aset Tetap",
  "Akumulasi Penyusutan",
  "Liabilitas Jangka Pendek",
  "Liabilitas Jangka Panjang",
  "Aset Neto Tidak Terikat",
  "Aset Neto Terikat Temporer",
  "Aset Neto Terikat Permanen",
  "Penerimaan Wakaf Uang",
  "Penerimaan Bagi Hasil",
  "Penerimaan Donasi / Infaq",
  "Beban Operasional",
  "Beban Program Penyaluran",
  "Beban Administrasi dan Umum",
];

export interface AccountFormProps {
  mode: "create" | "edit";
  account?: Account | null;
  accounts: Account[];
  submitting?: boolean;
  loading?: boolean;
  serverError?: string | null;
  onSubmit: (payload: AccountPayload) => Promise<void>;
  onCancel: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  mode,
  account,
  accounts,
  submitting = false,
  loading = false,
  serverError,
  onSubmit,
  onCancel,
}) => {
  const isEditing = mode === "edit";
  const isSubmitting = Boolean(submitting || loading);

  // Form input states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [accountType, setAccountType] = useState<AccountType>("asset");
  const [normalBalance, setNormalBalance] = useState<NormalBalance>("debit");
  const [reportCategory, setReportCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  const hasTransactions = Boolean(
    account && (account.journal_entry_lines_count ?? 0) > 0
  );

  // Available parent options: in edit mode, exclude self and descendants
  const availableParents = useMemo(() => {
    if (!account) return accounts;

    const descendantIds = new Set<number>();
    const findChildren = (pid: number) => {
      accounts.forEach((acc) => {
        if (acc.parent_id === pid) {
          descendantIds.add(acc.id);
          findChildren(acc.id);
        }
      });
    };
    findChildren(account.id);

    return accounts.filter(
      (acc) => acc.id !== account.id && !descendantIds.has(acc.id)
    );
  }, [accounts, account]);

  // Synchronize form with account data on mount or change
  useEffect(() => {
    if (account && isEditing) {
      setCode(account.code);
      setName(account.name);
      setParentId(account.parent_id ?? "");
      setAccountType(account.account_type);
      setNormalBalance(account.normal_balance);
      setReportCategory(account.report_category ?? "");
      setIsActive(account.is_active);
    } else if (!isEditing) {
      setCode("");
      setName("");
      setParentId("");
      setAccountType("asset");
      setNormalBalance("debit");
      setReportCategory("");
      setIsActive(true);
    }
  }, [account, isEditing]);

  // Auto-inherit account_type & normal_balance when parent changes
  const handleParentChange = (newParentId: number | "") => {
    setParentId(newParentId);
    if (newParentId !== "") {
      const parent = accounts.find((a) => a.id === Number(newParentId));
      if (parent && !hasTransactions) {
        setAccountType(parent.account_type);
        setNormalBalance(parent.normal_balance);
        if (parent.report_category && !reportCategory) {
          setReportCategory(parent.report_category);
        }
      }
    }
  };

  // Auto-suggest normal balance when account type changes
  const handleTypeChange = (newType: AccountType) => {
    if (hasTransactions) return;
    setAccountType(newType);
    if (newType === "asset" || newType === "expense") {
      setNormalBalance("debit");
    } else {
      setNormalBalance("credit");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    const trimmedCode = code.trim();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      setClientError("Kode akun wajib diisi.");
      return;
    }
    if (!trimmedName) {
      setClientError("Nama akun wajib diisi.");
      return;
    }

    const payload: AccountPayload = {
      code: trimmedCode,
      name: trimmedName,
      account_type: accountType,
      normal_balance: normalBalance,
      parent_id: parentId === "" ? null : Number(parentId),
      report_category: reportCategory.trim() || null,
      is_active: isActive,
    };

    await onSubmit(payload);
  };

  const selectedParent = useMemo(() => {
    return parentId !== "" ? accounts.find((a) => a.id === Number(parentId)) : null;
  }, [accounts, parentId]);

  const derivedLevel = selectedParent ? selectedParent.level + 1 : 1;

  const displayError = clientError || serverError;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {displayError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 shadow-2xs">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-rose-600 shrink-0" />
          <div className="flex-1 font-medium">{displayError}</div>
        </div>
      )}

      {hasTransactions && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-2xs">
          <FontAwesomeIcon icon={faLock} className="mt-0.5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Akun memiliki riwayat transaksi jurnal:</span> Kode akun, jenis akun, dan saldo normal dikunci untuk melindungi integritas audit pembukuan.
          </div>
        </div>
      )}

      {/* SECTION 1: IDENTITAS AKUN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">1. Identitas Akun</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nomor kode akun perkiraan dan nama resmi untuk pelaporan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kode Akun */}
          <div>
            <label htmlFor="account-code" className="block text-xs font-bold text-slate-700 mb-1">
              Kode Akun <span className="text-rose-500">*</span>
            </label>
            <input
              id="account-code"
              type="text"
              required
              disabled={hasTransactions || submitting}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Contoh: 1-11101"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Gunakan format standar hierarki (e.g. 1-XXXXX).
            </p>
          </div>

          {/* Nama Akun */}
          <div>
            <label htmlFor="account-name" className="block text-xs font-bold text-slate-700 mb-1">
              Nama Akun <span className="text-rose-500">*</span>
            </label>
            <input
              id="account-name"
              type="text"
              required
              disabled={submitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kas Operasional Utama"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-hidden disabled:bg-slate-100 shadow-2xs"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Nama deskriptif akun dalam bahasa Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: HIERARKI & INDUK AKUN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">2. Struktur & Induk Akun</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan hierarki induk (parent) dalam bagan akun.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          {/* Akun Induk */}
          <div className="sm:col-span-2">
            <label htmlFor="parent-account" className="block text-xs font-bold text-slate-700 mb-1">
              Akun Induk (Parent)
            </label>
            <select
              id="parent-account"
              disabled={submitting}
              value={parentId}
              onChange={(e) =>
                handleParentChange(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-primary-500 focus:outline-hidden disabled:bg-slate-100 shadow-2xs"
            >
              <option value="">-- Tanpa Induk (Akun Utama Level 1) --</option>
              {availableParents.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {"— ".repeat(Math.max(0, acc.level - 1))}
                  [{acc.code}] {acc.name} (L{acc.level})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Jika dipilih, jenis akun dan saldo normal akan otomatis diwarisi dari induk.
            </p>
          </div>

          {/* Level Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <FontAwesomeIcon icon={faFolderTree} className="text-xs" />
              <span>Tingkat Level:</span>
            </div>
            <div className="mt-1 font-mono text-base font-bold text-slate-900">
              Level {derivedLevel}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {derivedLevel === 1 ? "Akun Induk Utama" : `Sub-Akun Tingkat ${derivedLevel}`}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: KLASIFIKASI AKUNTANSI */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">3. Klasifikasi Akuntansi</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Klasifikasi jenis laporan keuangan dan perilaku debit/kredit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Jenis Akun */}
          <div>
            <label htmlFor="account-type" className="block text-xs font-bold text-slate-700 mb-1">
              Jenis Akun <span className="text-rose-500">*</span>
            </label>
            <select
              id="account-type"
              required
              disabled={hasTransactions || submitting}
              value={accountType}
              onChange={(e) => handleTypeChange(e.target.value as AccountType)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-primary-500 focus:outline-hidden disabled:bg-slate-100 shadow-2xs"
            >
              <option value="asset">Aset (Asset)</option>
              <option value="liability">Liabilitas (Liability)</option>
              <option value="net_asset">Aset Neto (Net Asset)</option>
              <option value="revenue">Penerimaan (Revenue)</option>
              <option value="expense">Beban (Expense)</option>
            </select>
          </div>

          {/* Saldo Normal */}
          <div>
            <label htmlFor="normal-balance" className="block text-xs font-bold text-slate-700 mb-1">
              Saldo Normal <span className="text-rose-500">*</span>
            </label>
            <select
              id="normal-balance"
              required
              disabled={hasTransactions || submitting}
              value={normalBalance}
              onChange={(e) => setNormalBalance(e.target.value as NormalBalance)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-primary-500 focus:outline-hidden disabled:bg-slate-100 shadow-2xs"
            >
              <option value="debit">Debit</option>
              <option value="credit">Kredit</option>
            </select>
          </div>

          {/* Kategori Laporan */}
          <div>
            <label htmlFor="report-category" className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Laporan
            </label>
            <input
              id="report-category"
              type="text"
              list="common-categories"
              disabled={submitting}
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              placeholder="Pilih atau ketik kategori..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-hidden disabled:bg-slate-100 shadow-2xs"
            />
            <datalist id="common-categories">
              {COMMON_REPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* SECTION 4: STATUS AKTIF */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
        <div>
          <label htmlFor="account-active" className="text-xs font-bold text-slate-900 cursor-pointer">
            Status Akun Aktif
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Akun aktif dapat langsung dipilih saat pencatatan transaksi jurnal umum baru.
          </p>
        </div>

        <input
          id="account-active"
          type="checkbox"
          disabled={isSubmitting}
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-5 w-5 rounded-md border-slate-300 text-brandGreen-600 focus:ring-brandGreen-500 cursor-pointer"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          <span>Batal</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-600 transition active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="text-xs" />
              <span>{isEditing ? "Simpan Perubahan" : "Simpan Akun"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AccountForm;
