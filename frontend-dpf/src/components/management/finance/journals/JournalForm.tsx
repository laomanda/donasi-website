import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faSave,
  faArrowLeft,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "@/components/ui/ToastProvider";
import type {
  Account,
  AccountingPeriod,
  ProgramOption,
  JournalEntryPayload,
} from "@/types/finance";
import { formatRupiah } from "@/utils/financeUtils";
import { SearchableSelect } from "@/components/management/finance/shared";

export interface LineItemState {
  account_id: number | "";
  description: string;
  debit: string;
  credit: string;
}

export interface JournalFormProps {
  accounts: Account[];
  periods: AccountingPeriod[];
  programs: ProgramOption[];
  submitting?: boolean;
  isSubmitting?: boolean;
  loading?: boolean;
  masterLoading?: boolean;
  onSubmit: (payload: JournalEntryPayload) => Promise<void>;
  onCancel: () => void;
}

export const JournalForm: React.FC<JournalFormProps> = ({
  accounts,
  periods,
  programs,
  submitting = false,
  isSubmitting: isSubmittingProp = false,
  loading = false,
  masterLoading = false,
  onSubmit,
  onCancel,
}) => {
  const isSubmitting = submitting || isSubmittingProp || loading || masterLoading;

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Form Fields
  const [transactionDate, setTransactionDate] = useState(todayStr);
  const [periodId, setPeriodId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState<number | "">("");
  const [referenceType, setReferenceType] = useState("manual");
  const [referenceId, setReferenceId] = useState("");

  // Initial 2 lines
  const [lines, setLines] = useState<LineItemState[]>([
    { account_id: "", description: "", debit: "", credit: "" },
    { account_id: "", description: "", debit: "", credit: "" },
  ]);

  const [clientError, setClientError] = useState<string | null>(null);

  // Auto-select open period matching today
  useEffect(() => {
    if (periodId === "" && periods.length > 0) {
      const matched =
        periods.find(
          (p) =>
            p.status === "open" &&
            p.start_date <= transactionDate &&
            p.end_date >= transactionDate
        ) ?? periods.find((p) => p.status === "open");

      if (matched) {
        setPeriodId(matched.id);
      }
    }
  }, [periods, transactionDate, periodId]);

  // Active accounts only
  const activeAccounts = useMemo(() => {
    return accounts.filter((a) => a.is_active);
  }, [accounts]);

  // Open periods only
  const openPeriods = useMemo(() => {
    return periods.filter((p) => p.status === "open");
  }, [periods]);

  // Double-entry validation preview
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

  // Line field change with mutual exclusion for debit/credit
  const handleLineChange = (
    idx: number,
    field: keyof LineItemState,
    value: string | number
  ) => {
    setLines((prev) => {
      const next = [...prev];
      const item = { ...next[idx] };

      if (field === "account_id") {
        item.account_id = value === "" ? "" : Number(value);
      } else if (field === "description") {
        item.description = String(value);
      } else if (field === "debit") {
        item.debit = String(value);
        if (value && Number(value) > 0) {
          item.credit = ""; // Debit filled, clear credit
        }
      } else if (field === "credit") {
        item.credit = String(value);
        if (value && Number(value) > 0) {
          item.debit = ""; // Credit filled, clear debit
        }
      }

      next[idx] = item;
      return next;
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!transactionDate) {
      setClientError("Tanggal transaksi wajib diisi.");
      return;
    }

    if (periodId === "") {
      setClientError("Periode akuntansi wajib dipilih.");
      return;
    }

    if (!description.trim()) {
      setClientError("Keterangan jurnal wajib diisi.");
      return;
    }

    if (lines.length < 2) {
      setClientError("Jurnal minimal harus memiliki 2 baris pembukuan.");
      return;
    }

    // Validate each line has an account and either debit or credit
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.account_id === "") {
        setClientError(`Baris #${i + 1}: Akun perkiraan wajib dipilih.`);
        return;
      }
      const deb = Number(l.debit) || 0;
      const cre = Number(l.credit) || 0;
      if (deb <= 0 && cre <= 0) {
        setClientError(`Baris #${i + 1}: Wajib mengisi nilai Debit atau Kredit.`);
        return;
      }
    }

    if (!isBalanced) {
      setClientError("Total Debit dan Total Kredit harus seimbang (balance) dan lebih dari 0.");
      return;
    }

    const payload: JournalEntryPayload = {
      transaction_date: transactionDate,
      date: transactionDate,
      accounting_period_id: Number(periodId),
      description: description.trim(),
      reference_type: referenceType || "manual",
      reference_id: referenceId ? Number(referenceId) : null,
      program_id: programId !== "" ? Number(programId) : null,
      status: "draft",
      journal_lines: lines.map((l) => ({
        account_id: Number(l.account_id),
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description.trim() || undefined,
        memo: l.description.trim() || undefined,
      })),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Validation Error Alert */}
      {clientError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-2xs flex items-start gap-2.5">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-600 mt-0.5 text-sm" />
          <div className="space-y-0.5 flex-1">
            <p className="font-bold">Validasi Gagal</p>
            <p className="font-normal text-rose-700">{clientError}</p>
          </div>
          <button
            type="button"
            onClick={() => setClientError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            ×
          </button>
        </div>
      )}

      {/* SECTION 1: INFORMASI TRANSAKSI */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          1. Informasi Transaksi Jurnal
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tanggal Transaksi */}
          <div className="space-y-1.5">
            <label htmlFor="tx-date" className="block text-xs font-bold text-slate-700">
              Tanggal Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              id="tx-date"
              type="date"
              required
              disabled={isSubmitting}
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs text-slate-900 shadow-2xs focus:border-primary-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Periode Akuntansi */}
          <div className="space-y-1.5">
            <label htmlFor="period-id" className="block text-xs font-bold text-slate-700">
              Periode Akuntansi <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect<number | "">
              id="period-id"
              disabled={isSubmitting}
              value={periodId}
              onChange={(val) => setPeriodId(val === "" ? "" : Number(val))}
              options={openPeriods.map((p) => ({
                value: p.id,
                label: p.name || p.period_name || `Periode #${p.id}`,
                sublabel: `${p.start_date} s/d ${p.end_date}`,
                badge: "Aktif",
                badgeColor: "bg-brandGreen-500 text-white",
              }))}
              placeholder="-- Pilih Periode Aktif --"
              searchPlaceholder="Ketik nama periode..."
            />
          </div>

          {/* Program Terkait (Optional) */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label htmlFor="program-id" className="block text-xs font-bold text-slate-700">
              Program Penyaluran <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <SearchableSelect<number | "">
              id="program-id"
              disabled={isSubmitting}
              value={programId}
              onChange={(val) => setProgramId(val === "" ? "" : Number(val))}
              options={[
                { value: "", label: "-- Tanpa Program (Umum / Operasional) --" },
                ...programs.map((prog) => ({
                  value: prog.id,
                  label: prog.title,
                })),
              ]}
              placeholder="-- Tanpa Program (Umum / Operasional) --"
              searchPlaceholder="Ketik nama program..."
            />
          </div>

          {/* Keterangan Jurnal */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <label htmlFor="description" className="block text-xs font-bold text-slate-700">
              Uraian / Keterangan Transaksi <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={2}
              disabled={isSubmitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Penerimaan wakaf uang via Bank Syariah Indonesia, Pembelian perlengkapan kantor..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs text-slate-900 shadow-2xs focus:border-primary-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Tipe & ID Referensi (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="ref-type" className="block text-xs font-bold text-slate-700">
              Tipe Referensi <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <select
              id="ref-type"
              disabled={isSubmitting}
              value={referenceType}
              onChange={(e) => setReferenceType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs text-slate-900 shadow-2xs focus:border-primary-500 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="manual">Manual</option>
              <option value="donation">Donasi / Transaksi</option>
              <option value="allocation">Penyaluran Program</option>
              <option value="closing">Tutup Buku</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ref-id" className="block text-xs font-bold text-slate-700">
              ID Referensi Dokumen <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              id="ref-id"
              type="number"
              disabled={isSubmitting}
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="Contoh: 1042"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs text-slate-900 shadow-2xs focus:border-primary-500 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: BARIS PEMBUKUAN (DEBIT & KREDIT) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Rincian Baris Jurnal (Double-Entry)
            </h3>
            <p className="text-[11px] text-slate-500">
              Masukkan minimal 2 baris akun perkiraan. Total Debit harus seimbang dengan Kredit.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAddLine}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} className="text-primary-500 text-xs" />
            <span>Tambah Baris</span>
          </button>
        </div>

        {/* Lines Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th scope="col" className="py-2.5 px-3 min-w-[240px]">
                  Akun Perkiraan
                </th>
                <th scope="col" className="py-2.5 px-3 min-w-[150px]">
                  Memo / Catatan Baris
                </th>
                <th scope="col" className="py-2.5 px-3 w-32 text-right">
                  Debit (Rp)
                </th>
                <th scope="col" className="py-2.5 px-3 w-32 text-right">
                  Kredit (Rp)
                </th>
                <th scope="col" className="py-2.5 px-3 w-12 text-center">
                  Hapus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  {/* Account Selector */}
                  <td className="py-2 px-3">
                    <SearchableSelect<number | "">
                      disabled={isSubmitting}
                      value={line.account_id}
                      onChange={(val) => handleLineChange(idx, "account_id", val)}
                      options={activeAccounts.map((acc) => ({
                        value: acc.id,
                        label: `[${acc.code}] ${acc.name}`,
                        badge: acc.account_type,
                        badgeColor: "bg-slate-200 text-slate-700",
                      }))}
                      placeholder="-- Pilih Akun --"
                      searchPlaceholder="Ketik kode atau nama akun..."
                      size="sm"
                    />
                  </td>

                  {/* Memo */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      disabled={isSubmitting}
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                      placeholder="Catatan rincian..."
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-800 shadow-2xs focus:border-primary-500 focus:outline-hidden"
                    />
                  </td>

                  {/* Debit Input */}
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      disabled={isSubmitting}
                      value={line.debit}
                      onChange={(e) => handleLineChange(idx, "debit", e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2 text-xs font-mono tabular-nums text-right text-slate-900 shadow-2xs focus:border-primary-500 focus:outline-hidden"
                    />
                  </td>

                  {/* Credit Input */}
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      disabled={isSubmitting}
                      value={line.credit}
                      onChange={(e) => handleLineChange(idx, "credit", e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2 text-xs font-mono tabular-nums text-right text-slate-900 shadow-2xs focus:border-primary-500 focus:outline-hidden"
                    />
                  </td>

                  {/* Remove Line */}
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      disabled={isSubmitting || lines.length <= 2}
                      onClick={() => handleRemoveLine(idx)}
                      title={lines.length <= 2 ? "Minimal 2 baris pembukuan" : "Hapus baris ini"}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Totals & Validation Footer */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                <td colSpan={2} className="py-3 px-3 text-slate-800 text-right">
                  Total Validasi Formulir:
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-900">
                  {formatRupiah(totalDebit)}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-900">
                  {formatRupiah(totalCredit)}
                </td>
                <td className="py-3 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Balance Status Banner */}
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold ${
            isBalanced
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-amber-50 border-amber-300 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={isBalanced ? faCheckCircle : faExclamationTriangle}
              className={isBalanced ? "text-brandGreen-500 text-base" : "text-amber-500 text-base"}
            />
            <span>
              {isBalanced
                ? "Jurnal Seimbang (Balance). Siap disimpan ke sistem sebagai Draft."
                : `Jurnal Belum Seimbang! Selisih: ${formatRupiah(difference)}.`}
            </span>
          </div>
          <span className="font-mono text-xs font-bold">
            Debit: {formatRupiah(totalDebit)} | Kredit: {formatRupiah(totalCredit)}
          </span>
        </div>
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
          disabled={isSubmitting || !isBalanced}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-600 transition active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
              <span>Menyimpan Jurnal...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="text-xs" />
              <span>Simpan Jurnal sebagai Draft</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default JournalForm;
