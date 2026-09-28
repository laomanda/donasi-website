import React, { Fragment, useState, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faEdit,
  faSpinner,
  faTriangleExclamation,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import type { Account, AccountType, NormalBalance, AccountPayload } from "@/types/finance";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  accounts: Account[];
  onSuccess: () => void;
}

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

export const AccountFormModal: React.FC<AccountFormModalProps> = ({
  isOpen,
  onClose,
  account,
  accounts,
  onSuccess,
}) => {
  const isEditing = Boolean(account);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [accountType, setAccountType] = useState<AccountType>("asset");
  const [normalBalance, setNormalBalance] = useState<NormalBalance>("debit");
  const [reportCategory, setReportCategory] = useState("");
  const [isActive, setIsActive] = useState(true);

  const hasTransactions = Boolean(
    account && (account.journal_entry_lines_count ?? 0) > 0
  );

  // Exclude current account and any descendants from parent options to prevent circular hierarchy
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

  // Reset or fill form on open / account change
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (account) {
        setCode(account.code);
        setName(account.name);
        setParentId(account.parent_id ?? "");
        setAccountType(account.account_type);
        setNormalBalance(account.normal_balance);
        setReportCategory(account.report_category ?? "");
        setIsActive(account.is_active);
      } else {
        setCode("");
        setName("");
        setParentId("");
        setAccountType("asset");
        setNormalBalance("debit");
        setReportCategory("");
        setIsActive(true);
      }
    }
  }, [isOpen, account]);

  // Auto-inherit account_type & normal_balance when parent changes in create mode
  const handleParentChange = (newParentId: number | "") => {
    setParentId(newParentId);
    if (newParentId !== "") {
      const parent = accounts.find((a) => a.id === Number(newParentId));
      if (parent) {
        if (!hasTransactions) {
          setAccountType(parent.account_type);
          setNormalBalance(parent.normal_balance);
          if (parent.report_category && !reportCategory) {
            setReportCategory(parent.report_category);
          }
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
    setErrorMsg(null);

    const trimmedCode = code.trim();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      setErrorMsg("Kode akun wajib diisi.");
      return;
    }
    if (!trimmedName) {
      setErrorMsg("Nama akun wajib diisi.");
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

    setLoading(true);
    try {
      if (isEditing && account) {
        await financeService.updateAccount(account.id, payload);
        toast.success("Akun berhasil diperbarui.");
      } else {
        await financeService.createAccount(payload);
        toast.success("Akun berhasil ditambahkan.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = extractFinanceErrorMessage(
        err,
        isEditing ? "Gagal memperbarui akun." : "Gagal menambahkan akun."
      );
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <FontAwesomeIcon
                        icon={isEditing ? faEdit : faPlus}
                        className="text-base"
                      />
                    </div>
                    <div>
                      <Dialog.Title className="text-base font-bold text-slate-900">
                        {isEditing ? `Edit Akun [${account?.code}]` : "Tambah Akun Baru"}
                      </Dialog.Title>
                      <p className="text-xs text-slate-500">
                        {isEditing
                          ? "Perbarui metadata akun perkiraan akuntansi"
                          : "Tambahkan kode akun baru ke dalam Bagan Akun (COA)"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {errorMsg && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-rose-600" />
                      <div className="flex-1 font-medium">{errorMsg}</div>
                    </div>
                  )}

                  {hasTransactions && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800">
                      <FontAwesomeIcon icon={faLock} className="mt-0.5 text-amber-600" />
                      <div className="flex-1">
                        Akun ini telah memiliki transaksi jurnal. Demi menjaga integritas buku besar,
                        <strong> jenis akun</strong> dan <strong>saldo normal</strong> tidak dapat diubah.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kode Akun */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Kode Akun <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Contoh: 1119"
                        disabled={loading}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Gunakan pola penomoran hierarkis COA (misal 1111, 1112).
                      </span>
                    </div>

                    {/* Nama Akun */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nama Akun <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Bank Muamalat Giro"
                        disabled={loading}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Akun Induk (Parent) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Akun Induk (Parent Account)
                    </label>
                    <select
                      value={parentId}
                      onChange={(e) =>
                        handleParentChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      disabled={loading}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="">-- Tanpa Induk (Akun Utama / Level 1) --</option>
                      {availableParents.map((p) => (
                        <option key={p.id} value={p.id}>
                          {"\u00A0\u00A0".repeat(Math.max(0, (p.level ?? 1) - 1))}
                          {p.code} - {p.name} (L{p.level})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Tingkat level akun akan dihitung otomatis mengikuti akun induk.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Jenis Akun */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Jenis Akun <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={accountType}
                        onChange={(e) => handleTypeChange(e.target.value as AccountType)}
                        disabled={loading || hasTransactions}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-slate-50"
                      >
                        <option value="asset">Aset (Asset)</option>
                        <option value="liability">Liabilitas (Liability)</option>
                        <option value="net_asset">Aset Neto (Net Asset / Ekuitas)</option>
                        <option value="revenue">Penerimaan / Pendapatan (Revenue)</option>
                        <option value="expense">Beban (Expense)</option>
                      </select>
                    </div>

                    {/* Saldo Normal */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Saldo Normal <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={normalBalance}
                        onChange={(e) => setNormalBalance(e.target.value as NormalBalance)}
                        disabled={loading || hasTransactions}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-slate-50"
                      >
                        <option value="debit">Debit</option>
                        <option value="credit">Kredit</option>
                      </select>
                    </div>
                  </div>

                  {/* Kategori Laporan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Kategori Laporan
                    </label>
                    <input
                      type="text"
                      list="report-category-list"
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      placeholder="Pilih atau ketik kategori laporan (misal: Aset Lancar)"
                      disabled={loading}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                    />
                    <datalist id="report-category-list">
                      {COMMON_REPORT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Digunakan untuk pengelompokan di Neraca dan Laporan Aktivitas.
                    </span>
                  </div>

                  {/* Status Aktif */}
                  <div className="pt-2">
                    <label className="relative inline-flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="text-xs font-bold text-slate-700">
                        {isActive ? "Akun Aktif (Dapat digunakan dalam jurnal)" : "Nonaktifkan Akun"}
                      </span>
                    </label>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-5 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>{isEditing ? "Simpan Perubahan" : "Tambah Akun"}</span>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AccountFormModal;
