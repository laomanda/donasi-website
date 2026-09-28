import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faTimes,
  faCheck,
  faBan,
  faRotate,
  faCalendarDay,
  faFolderOpen,
  faUser,
  faHashtag,
  faShieldHalved,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { JournalEntry } from "@/types/finance";
import {
  formatFinanceDate,
  formatFinanceDateTime,
  formatRupiah,
} from "@/utils/financeUtils";
import {
  FinanceStatusBadge,
  CurrencyDisplay,
} from "./shared";

interface JournalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal: JournalEntry | null;
  canManage?: boolean;
  onPost?: (journal: JournalEntry) => void;
  onVoid?: (journal: JournalEntry) => void;
  onReverse?: (journal: JournalEntry) => void;
}

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  isOpen,
  onClose,
  journal,
  canManage = false,
  onPost,
  onVoid,
  onReverse,
}) => {
  if (!journal) return null;

  const lines = journal.lines ?? [];
  const totalDebit = lines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + Number(l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <FontAwesomeIcon icon={faReceipt} className="text-base" />
                    </div>
                    <div>
                      <Dialog.Title className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-emerald-700 tracking-tight">
                          {journal.journal_number}
                        </span>
                        <FinanceStatusBadge status={journal.status} />
                      </Dialog.Title>
                      <p className="text-xs text-slate-500">
                        Voucher Jurnal Umum (Double-Entry Accounting)
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
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-slate-100 p-3.5 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-[10px]" />
                        <span>Tanggal Transaksi</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs">
                        {formatFinanceDate(journal.transaction_date || journal.date)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-3.5 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faFolderOpen} className="text-[10px]" />
                        <span>Periode Akuntansi</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs">
                        {journal.accounting_period?.name || "-"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-3.5 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faHashtag} className="text-[10px]" />
                        <span>Referensi</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs truncate">
                        {journal.reference_type
                          ? `${journal.reference_type}${
                              journal.reference_id ? ` #${journal.reference_id}` : ""
                            }`
                          : "-"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-3.5 bg-slate-50/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                        <span>Dibuat Oleh</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs truncate">
                        {journal.creator?.name || "Sistem"}
                      </div>
                    </div>
                  </div>

                  {/* Program & Description */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                    {journal.program && (
                      <div className="text-xs">
                        <span className="font-bold text-slate-500 mr-2">Terkait Program:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                          {journal.program.title}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Keterangan Jurnal:
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {journal.description}
                      </p>
                    </div>
                  </div>

                  {/* Journal Lines Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Rincian Baris Jurnal ({lines.length} Baris)
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Status Keseimbangan:</span>
                        {isBalanced ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                            <span>Seimbang</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-xs">
                            <FontAwesomeIcon icon={faBan} className="text-xs" />
                            <span>Tidak Seimbang</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">#</th>
                            <th className="py-2.5 px-4 w-28">Kode Akun</th>
                            <th className="py-2.5 px-4 min-w-[180px]">Nama Akun & Keterangan</th>
                            <th className="py-2.5 px-4 w-32 text-right">Debit</th>
                            <th className="py-2.5 px-4 w-32 text-right">Kredit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {lines.map((line, idx) => (
                            <tr key={line.id ?? idx} className="hover:bg-slate-50/50 transition">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                                {line.account?.code ?? line.account_id}
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="font-semibold text-slate-900">
                                  {line.account?.name ?? `Akun #${line.account_id}`}
                                </div>
                                {line.description && (
                                  <div className="text-[11px] text-slate-500 italic mt-0.5">
                                    {line.description}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <CurrencyDisplay amount={Number(line.debit || 0)} tone="debit" />
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <CurrencyDisplay amount={Number(line.credit || 0)} tone="credit" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-xs">
                          <tr>
                            <td colSpan={3} className="py-3 px-4 text-right text-slate-700">
                              Total
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                              {formatRupiah(totalDebit)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                              {formatRupiah(totalCredit)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Accounting Immutability & Status Notice */}
                  {journal.status === "posted" && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 p-3.5 text-xs text-emerald-800">
                      <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 text-emerald-600 text-sm" />
                      <div>
                        <strong>Jurnal telah diposting ke Buku Besar.</strong> Demi kepatuhan standar akuntansi dan integritas audit trail, jurnal ini berstatus <em>immutable</em> (tidak dapat diedit atau dihapus). Koreksi dilakukan melalui mekanisme Jurnal Pembalik (Reverse).
                      </div>
                    </div>
                  )}

                  {journal.status === "draft" && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/60 border border-amber-200 p-3.5 text-xs text-amber-800">
                      <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 text-amber-600 text-sm" />
                      <div>
                        <strong>Status: Draft.</strong> Transaksi ini belum mempengaruhi saldo Buku Besar dan Laporan Keuangan. Anda dapat mempostingnya untuk membukukannya secara resmi.
                      </div>
                    </div>
                  )}

                  {journal.status === "void" && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50/60 border border-rose-200 p-3.5 text-xs text-rose-800">
                      <FontAwesomeIcon icon={faBan} className="mt-0.5 text-rose-600 text-sm" />
                      <div>
                        <strong>Status: Void (Dibatalkan).</strong> Jurnal ini telah dibatalkan dan tidak lagi berlaku dalam pembukuan yayasan.
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div className="text-[11px] text-slate-400">
                    ID: #{journal.id} • Dibuat: {formatFinanceDateTime(journal.created_at)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95"
                    >
                      Tutup
                    </button>

                    {canManage && journal.status === "draft" && (
                      <>
                        {onVoid && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onVoid(journal);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 shadow-xs hover:bg-rose-50 transition active:scale-95"
                          >
                            <FontAwesomeIcon icon={faBan} className="text-xs" />
                            <span>Void</span>
                          </button>
                        )}
                        {onPost && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onPost(journal);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
                          >
                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                            <span>Posting Jurnal</span>
                          </button>
                        )}
                      </>
                    )}

                    {canManage && journal.status === "posted" && onReverse && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onReverse(journal);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-700 shadow-xs hover:bg-amber-50 transition active:scale-95"
                      >
                        <FontAwesomeIcon icon={faRotate} className="text-xs" />
                        <span>Reverse (Jurnal Pembalik)</span>
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default JournalDetailModal;
