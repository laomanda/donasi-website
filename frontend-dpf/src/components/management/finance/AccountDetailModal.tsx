import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faTimes,
  faEdit,
  faFolderTree,
  faReceipt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { Account } from "@/types/finance";
import {
  getAccountTypeLabel,
  getNormalBalanceLabel,
  getAccountTypeBadgeClass,
} from "@/utils/financeUtils";
import { FinanceStatusBadge } from "./shared";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onEdit?: (account: Account) => void;
  canEdit?: boolean;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  isOpen,
  onClose,
  account,
  onEdit,
  canEdit = false,
}) => {
  if (!account) return null;

  const hasTransactions = (account.journal_entry_lines_count ?? 0) > 0;
  const hasChildren = (account.children_count ?? account.children?.length ?? 0) > 0;

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <FontAwesomeIcon icon={faSitemap} className="text-base" />
                    </div>
                    <div>
                      <Dialog.Title className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-emerald-700 font-semibold">{account.code}</span>
                        <span>—</span>
                        <span>{account.name}</span>
                      </Dialog.Title>
                      <p className="text-xs text-slate-500">
                        Detail Bagan Akun (Chart of Accounts)
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

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  {/* Status & Type Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Jenis Akun:</span>
                      <span
                        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${getAccountTypeBadgeClass(
                          account.account_type
                        )}`}
                      >
                        {getAccountTypeLabel(account.account_type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Status:</span>
                      <FinanceStatusBadge
                        status={account.is_active ? "active" : "closed"}
                        label={account.is_active ? "Aktif" : "Tidak Aktif"}
                      />
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-100 p-4 space-y-1 bg-white">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Kode Akun
                      </div>
                      <div className="font-mono font-bold text-slate-800 text-sm">
                        {account.code}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-4 space-y-1 bg-white">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Nama Akun
                      </div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {account.name}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-4 space-y-1 bg-white">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Saldo Normal
                      </div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {getNormalBalanceLabel(account.normal_balance)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-4 space-y-1 bg-white">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Tingkat / Hirarki (Level)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700">
                          Level {account.level}
                        </span>
                        <span className="text-xs text-slate-500">
                          {account.level === 1
                            ? "Akun Induk Utama"
                            : account.level === 2
                            ? "Golongan Akun"
                            : account.level === 3
                            ? "Sub-Golongan"
                            : "Akun Buku Besar"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-4 space-y-1 bg-white">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Akun Induk (Parent)
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {account.parent ? (
                          <div className="flex items-center gap-1.5 text-emerald-700">
                            <FontAwesomeIcon icon={faFolderTree} className="text-xs" />
                            <span className="font-mono">{account.parent.code}</span>
                            <span>—</span>
                            <span>{account.parent.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            Tanpa Induk (Akun Utama Level 1)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-4 space-y-1 bg-white">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Kategori Laporan
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {account.report_category || (
                          <span className="text-slate-400 italic">Tidak diklasifikasikan</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accounting Integrity Notes */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <FontAwesomeIcon icon={faReceipt} className="text-slate-400" />
                      <span>Integritas Catatan Jurnal & Sub-Akun</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <span className="text-slate-500">Transaksi Jurnal:</span>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">
                          {account.journal_entry_lines_count ?? 0} baris jurnal
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <span className="text-slate-500">Jumlah Sub-Akun:</span>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">
                          {account.children_count ?? account.children?.length ?? 0} sub-akun
                        </div>
                      </div>
                    </div>

                    {hasTransactions && (
                      <div className="flex items-start gap-2 mt-2 pt-2 text-[11px] text-amber-700 border-t border-slate-200/60">
                        <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5 text-xs text-amber-500" />
                        <span>
                          Akun ini telah memiliki transaksi jurnal. Penghapusan, perubahan jenis akun, dan saldo normal diproteksi demi menjaga integritas pembukuan yayasan.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Child Accounts List if any */}
                  {hasChildren && account.children && account.children.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <FontAwesomeIcon icon={faFolderTree} className="text-emerald-600" />
                          <span>Daftar Sub-Akun ({account.children.length})</span>
                        </h4>
                      </div>
                      <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        {account.children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between p-3 text-xs hover:bg-slate-50 transition"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-700">{child.code}</span>
                              <span className="text-slate-400">|</span>
                              <span className="text-slate-800 font-medium">{child.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
                                L{child.level}
                              </span>
                              <FinanceStatusBadge
                                status={child.is_active ? "active" : "closed"}
                                label={child.is_active ? "Aktif" : "Nonaktif"}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95"
                  >
                    Tutup
                  </button>
                  {canEdit && onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEdit(account);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      <span>Edit Akun</span>
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AccountDetailModal;
