import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faXmark,
  faLayerGroup,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import type {
  AccountingPeriod,
  FinancialNotePayload,
  FinancialNoteStatus,
} from "@/types/finance";
import { SearchableSelect } from "@/components/management/finance/shared";
import { FINANCIAL_NOTE_CATEGORIES } from "@/config/finance/financialNoteCategories";

interface FinancialNoteFormProps {
  mode: "create" | "edit";
  initialValue?: Partial<FinancialNotePayload>;
  periods: AccountingPeriod[];
  submitting: boolean;
  onSubmit: (payload: FinancialNotePayload) => Promise<void>;
  onCancel: () => void;
}

export const FinancialNoteForm: React.FC<FinancialNoteFormProps> = ({
  mode,
  initialValue,
  periods,
  submitting,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialValue?.title || "");
  const [category, setCategory] = useState(initialValue?.category || "accounting_policy");
  const [periodId, setPeriodId] = useState<number | "">(
    initialValue?.period_id !== undefined && initialValue.period_id !== null
      ? Number(initialValue.period_id)
      : ""
  );
  const [sortOrder, setSortOrder] = useState<number | "">(
    initialValue?.sort_order !== undefined && initialValue.sort_order !== null
      ? Number(initialValue.sort_order)
      : 1
  );
  const [status, setStatus] = useState<FinancialNoteStatus>(
    (initialValue?.status as FinancialNoteStatus) || "draft"
  );
  const [content, setContent] = useState(initialValue?.content || "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValue) {
      if (initialValue.title !== undefined) setTitle(initialValue.title);
      if (initialValue.category !== undefined) setCategory(initialValue.category);
      if (initialValue.period_id !== undefined) {
        setPeriodId(initialValue.period_id === null ? "" : Number(initialValue.period_id));
      }
      if (initialValue.sort_order !== undefined) {
        setSortOrder(initialValue.sort_order === null ? "" : Number(initialValue.sort_order));
      }
      if (initialValue.status !== undefined) setStatus(initialValue.status as FinancialNoteStatus);
      if (initialValue.content !== undefined) setContent(initialValue.content);
    }
  }, [initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Judul catatan pengungkapan wajib diisi.";
    }
    if (!category.trim()) {
      newErrors.category = "Kategori pos catatan wajib dipilih.";
    }
    if (!content.trim()) {
      newErrors.content = "Naskah isi catatan pengungkapan wajib diisi.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload: FinancialNotePayload = {
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      period_id: periodId === "" ? null : Number(periodId),
      accounting_period_id: periodId === "" ? null : Number(periodId),
      sort_order: sortOrder === "" ? 0 : Number(sortOrder),
      status,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6">
        {/* 1. Judul Catatan (Full Width) */}
        <div>
          <label
            htmlFor="fn-title"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Judul Catatan Pengungkapan <span className="text-red-500">*</span>
          </label>
          <input
            id="fn-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="Contoh: Dasar Penyusunan & Kepatuhan Standar Akuntansi Syariah"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition focus:outline-hidden focus:ring-1 ${
              errors.title
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-slate-800 focus:ring-slate-800"
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.title}</p>
          )}
        </div>

        {/* 2. Kategori Pos & Periode Akuntansi (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="fn-category"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Kategori Pos CLK <span className="text-red-500">*</span>
            </label>
            <SearchableSelect<string>
              id="fn-category"
              value={category}
              onChange={(val) => {
                setCategory(val);
                if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
              }}
              options={FINANCIAL_NOTE_CATEGORIES.map((c) => ({
                value: c.key,
                label: c.label,
              }))}
              placeholder="Pilih Kategori Pos..."
              searchPlaceholder="Cari kategori..."
              icon={faLayerGroup}
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.category}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="fn-period"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Periode Akuntansi
            </label>
            <SearchableSelect<number | "">
              id="fn-period"
              value={periodId}
              onChange={(val) => setPeriodId(val === "" ? "" : Number(val))}
              options={[
                { value: "", label: "-- Berlaku untuk Semua Periode --" },
                ...periods.map((p) => {
                  const pName = p.name || p.period_name || `Periode #${p.id}`;
                  return {
                    value: p.id,
                    label: pName,
                    badge: p.status === "closed" ? "Tertutup" : "Aktif",
                    badgeColor:
                      p.status === "closed"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-brandGreen-500 text-white",
                  };
                }),
              ]}
              placeholder="-- Berlaku untuk Semua Periode --"
              searchPlaceholder="Pilih periode..."
              icon={faCalendarAlt}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Kosongkan jika catatan ini berlaku permanen untuk seluruh periode pelaporan.
            </p>
          </div>
        </div>

        {/* 3. Nomor Urut Tampilan & Status Publikasi (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="fn-sort-order"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Nomor Urut Tampilan
            </label>
            <input
              id="fn-sort-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="1"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 transition focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Menentukan urutan naskah di dalam grup kategori (misal: 1 untuk A.1).
            </p>
          </div>

          <div>
            <label
              htmlFor="fn-status"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Status Publikasi
            </label>
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                  status === "published"
                    ? "border-brandGreen-500 bg-brandGreen-500 text-white shadow-xs"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === "published"}
                  onChange={() => setStatus("published")}
                  className="sr-only"
                />
                <span>Dipublikasikan</span>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                  status === "draft"
                    ? "border-brandWarmOrange-500 bg-brandWarmOrange-500 text-white shadow-xs"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === "draft"}
                  onChange={() => setStatus("draft")}
                  className="sr-only"
                />
                <span>Draft</span>
              </label>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Hanya catatan berstatus &quot;Dipublikasikan&quot; yang akan tampil pada cetakan resmi laporan.
            </p>
          </div>
        </div>

        {/* 4. Isi Catatan / Pengungkapan Naratif (Full Width) */}
        <div>
          <label
            htmlFor="fn-content"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Naskah Pengungkapan Naratif <span className="text-red-500">*</span>
          </label>
          <textarea
            id="fn-content"
            rows={8}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
            }}
            placeholder="Tuliskan naskah pengungkapan, rincian kebijakan, penjelasan angka laporan, atau komitmen yayasan..."
            className={`w-full rounded-xl border p-3.5 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 placeholder-slate-400 transition focus:outline-hidden focus:ring-1 ${
              errors.content
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-slate-800 focus:ring-slate-800"
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.content}</p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
          <span>Batal</span>
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-primary-600 active:scale-95 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faFloppyDisk} className="text-xs" />
          <span>
            {submitting
              ? "Menyimpan..."
              : mode === "create"
              ? "Simpan Catatan"
              : "Perbarui Catatan"}
          </span>
        </button>
      </div>
    </form>
  );
};
