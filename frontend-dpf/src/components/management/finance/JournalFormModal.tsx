import React, { Fragment, useState, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faTrash,
  faSpinner,
  faCheckCircle,
  faTriangleExclamation,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import type {
  Account,
  AccountingPeriod,
  ProgramOption,
  JournalEntryPayload,
} from "@/types/finance";
import financeService from "@/services/financeService";
import { extractFinanceErrorMessage, formatRupiah } from "@/utils/financeUtils";

interface LineItemState {
  account_id: number | "";
  description: string;
  debit: number | "";
  credit: number | "";
}

interface JournalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  periods: AccountingPeriod[];
  programs: ProgramOption[];
  onSuccess: () => void;
}

export const JournalFormModal: React.FC<JournalFormModalProps> = ({
  isOpen,
  onClose,
  accounts,
  periods,
  programs,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [periodId, setPeriodId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState<number | "">("");
  const [referenceType, setReferenceType] = useState("manual");

  // Initial 2 lines
  const [lines, setLines] = useState<LineItemState[]>([
    { account_id: "", description: "", debit: "", credit: "" },
    { account_id: "", description: "", debit: "", credit: "" },
  ]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      const today = new Date().toISOString().slice(0, 10);
      setTransactionDate(today);
      setDescription("");
      setProgramId("");
      setReferenceType("manual");

      // Auto-select open period matching today
      const matchedPeriod = periods.find(
        (p) =>
          p.status === "open" &&
          p.start_date <= today &&
          p.end_date >= today
      ) ?? periods.find((p) => p.status === "open");

      setPeriodId(matchedPeriod ? matchedPeriod.id : "");

      setLines([
        { account_id: "", description: "", debit: "", credit: "" },
        { account_id: "", description: "", debit: "", credit: "" },
      ]);
    }
  }, [isOpen, periods]);

  // Accounts filter: only active accounts
  const activeAccounts = useMemo(() => {
    return accounts.filter((a) => a.is_active);
  }, [accounts]);

  // Open periods only
  const openPeriods = useMemo(() => {
    return periods.filter((p) => p.status === "open");
  }, [periods]);

  // Double-entry balance calculation
  const totalDebit = useMemo(() => {
    return lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  }, [lines]);

  const totalCredit = useMemo(() => {
    return lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  }, [lines]);

  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.001 && totalDebit > 0;

  // Add line handler
  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      { account_id: "", description: "", debit: "", credit: "" },
    ]);
  };

  // Remove line handler (keep at least 2)
  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 2) {
      toast.error("Jurnal minimal harus memiliki 2 baris (Debit & Kredit).");
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  // Line field change handler with mutual exclusion for debit/credit
  const handleLineChange = (
    idx: number,
    field: keyof LineItemState,
    value: unknown
  ) => {
    setLines((prev) => {
      const next = [...prev];
      const current = { ...next[idx] };

      if (field === "debit") {
        current.debit = value === "" ? "" : Math.max(0, Number(value));
        if (Number(value) > 0) {
          current.credit = "";
        }
      } else if (field === "credit") {
        current.credit = value === "" ? "" : Math.max(0, Number(value));
        if (Number(value) > 0) {
          current.debit = "";
        }
      } else if (field === "account_id") {
        current.account_id = value === "" ? "" : Number(value);
      } else if (field === "description") {
        current.description = String(value);
      }

      next[idx] = current;
      return next;
    });
  };

  // Submit handler
  const handleSubmit = async (targetStatus: "draft" | "posted") => {
    setErrorMsg(null);

    // Validation
    if (!transactionDate) {
      setErrorMsg("Tanggal transaksi wajib diisi.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Keterangan jurnal wajib diisi.");
      return;
    }
    if (lines.length < 2) {
      setErrorMsg("Jurnal minimal harus memiliki 2 baris.");
      return;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.account_id) {
        setErrorMsg(`Baris ke-${i + 1} wajib memilih akun perkiraan.`);
        return;
      }
      const deb = Number(line.debit || 0);
      const cred = Number(line.credit || 0);
      if (deb === 0 && cred === 0) {
        setErrorMsg(
          `Baris ke-${i + 1} harus memiliki nilai Debit atau Kredit lebih dari 0.`
        );
        return;
      }
    }

    if (!isBalanced) {
      setErrorMsg(
        `Jurnal tidak seimbang. Total Debit (${formatRupiah(
          totalDebit
        )}) harus sama dengan Total Kredit (${formatRupiah(
          totalCredit
        )}). Selisih: ${formatRupiah(difference)}.`
      );
      return;
    }

    // Confirmation if posting immediately
    if (targetStatus === "posted") {
      const confirmResult = await Swal.fire({
        title: "Posting Jurnal Sekarang?",
        html: `Transaksi sebesar <b>${formatRupiah(
          totalDebit
        )}</b> akan langsung dibukukan ke Buku Besar (General Ledger) dan berstatus <i>immutable</i>.<br/><br/>Lanjutkan posting?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#059669",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Ya, Simpan & Posting",
        cancelButtonText: "Periksa Kembali",
      });

      if (!confirmResult.isConfirmed) return;
    }

    const payload: JournalEntryPayload = {
      transaction_date: transactionDate,
      accounting_period_id: periodId === "" ? null : Number(periodId),
      description: description.trim(),
      program_id: programId === "" ? null : Number(programId),
      reference_type: referenceType || "manual",
      status: targetStatus,
      journal_lines: lines.map((l) => ({
        account_id: Number(l.account_id),
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
        description: l.description.trim() || undefined,
      })),
    };

    setSubmitting(true);
    try {
      await financeService.createJournal(payload);
      toast.success(
        targetStatus === "posted"
          ? "Jurnal berhasil dibuat dan langsung di-posting."
          : "Jurnal berhasil disimpan sebagai draft."
      );
      onSuccess();
      onClose();
    } catch (err) {
      const msg = extractFinanceErrorMessage(err, "Gagal membuat jurnal.");
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
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
          <div className="flex min-h-full items-center justify-center p-3 text-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left align-middle shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <FontAwesomeIcon icon={faReceipt} className="text-base" />
                    </div>
                    <div>
                      <Dialog.Title className="text-base font-bold text-slate-900">
                        Buat Jurnal Umum Baru
                      </Dialog.Title>
                      <p className="text-xs text-slate-500">
                        Pencatatan transaksi pembukuan berpasangan (Double Entry)
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
                  {errorMsg && (
                    <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-rose-600 text-sm" />
                      <div className="flex-1 font-medium">{errorMsg}</div>
                    </div>
                  )}

                  {/* Header Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Tanggal Transaksi */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tanggal Transaksi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        disabled={submitting}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Periode Akuntansi */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Periode Akuntansi
                      </label>
                      <select
                        value={periodId}
                        onChange={(e) =>
                          setPeriodId(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        disabled={submitting}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">-- Otomatis Sesuai Tanggal --</option>
                        {openPeriods.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.start_date.slice(0, 10)} s/d {p.end_date.slice(0, 10)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Program Terkait */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Terkait Program (Opsional)
                      </label>
                      <select
                        value={programId}
                        onChange={(e) =>
                          setProgramId(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        disabled={submitting}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">-- Umum / Tanpa Program --</option>
                        {programs.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Keterangan Jurnal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Keterangan Jurnal <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tuliskan deskripsi lengkap transaksi (misal: Penerimaan wakaf uang via transfer bank BSI)..."
                      disabled={submitting}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Journal Lines Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Rincian Baris Jurnal (Double-Entry)
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddLine}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition active:scale-95"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        <span>Tambah Baris</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[650px]">
                          <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                              <th className="py-2.5 px-3 w-10 text-center">#</th>
                              <th className="py-2.5 px-3 min-w-[220px]">
                                Akun Perkiraan <span className="text-rose-500">*</span>
                              </th>
                              <th className="py-2.5 px-3 min-w-[150px]">
                                Keterangan Baris
                              </th>
                              <th className="py-2.5 px-3 w-36 text-right">
                                Debit (Rp)
                              </th>
                              <th className="py-2.5 px-3 w-36 text-right">
                                Kredit (Rp)
                              </th>
                              <th className="py-2.5 px-2 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {lines.map((line, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition">
                                <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                                  {idx + 1}
                                </td>

                                {/* Account select */}
                                <td className="py-2 px-3">
                                  <select
                                    value={line.account_id}
                                    onChange={(e) =>
                                      handleLineChange(idx, "account_id", e.target.value)
                                    }
                                    disabled={submitting}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                                  >
                                    <option value="">-- Pilih Akun --</option>
                                    {activeAccounts.map((acc) => (
                                      <option key={acc.id} value={acc.id}>
                                        {acc.code} - {acc.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Description */}
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={line.description}
                                    onChange={(e) =>
                                      handleLineChange(idx, "description", e.target.value)
                                    }
                                    placeholder="Memo baris..."
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                                  />
                                </td>

                                {/* Debit */}
                                <td className="py-2 px-3 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={line.debit}
                                    onChange={(e) =>
                                      handleLineChange(idx, "debit", e.target.value)
                                    }
                                    placeholder="0"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-right text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                                  />
                                </td>

                                {/* Credit */}
                                <td className="py-2 px-3 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={line.credit}
                                    onChange={(e) =>
                                      handleLineChange(idx, "credit", e.target.value)
                                    }
                                    placeholder="0"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-right text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                                  />
                                </td>

                                {/* Delete row */}
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLine(idx)}
                                    disabled={submitting || lines.length <= 2}
                                    title="Hapus Baris"
                                    className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30 disabled:hover:text-slate-300 disabled:hover:bg-transparent"
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Footnote */}
                      <div className="border-t-2 border-slate-200 bg-slate-50/90 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">Status:</span>
                            {isBalanced ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600" />
                                <span>Seimbang (Balanced)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 text-xs font-bold">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-rose-600" />
                                <span>Belum Seimbang (Selisih: {formatRupiah(difference)})</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-6 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                                Total Debit
                              </span>
                              <span className="font-mono text-sm font-bold text-slate-900">
                                {formatRupiah(totalDebit)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                                Total Kredit
                              </span>
                              <span className="font-mono text-sm font-bold text-slate-900">
                                {formatRupiah(totalCredit)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit("draft")}
                    disabled={submitting || !isBalanced}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 transition active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                    ) : null}
                    <span>Simpan sebagai Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit("posted")}
                    disabled={submitting || !isBalanced}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                    ) : null}
                    <span>Simpan & Langsung Posting</span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default JournalFormModal;
