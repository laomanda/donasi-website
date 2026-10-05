import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faArrowLeft,
  faSpinner,
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

export interface FinancialNoteFormProps {
  id?: string;
  mode: "create" | "edit";
  initialValue?: Partial<FinancialNotePayload>;
  periods: AccountingPeriod[];
  submitting: boolean;
  hideActions?: boolean;
  onSubmit: (payload: FinancialNotePayload) => Promise<void>;
  onCancel: () => void;
}

export const FinancialNoteForm: React.FC<FinancialNoteFormProps> = ({
  id = "financial-note-form",
  mode,
  initialValue,
  periods,
  submitting,
  hideActions = false,
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
    <form id={id} onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: IDENTITAS & POS PENGUNGKAPAN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-poppins">1. Identitas & Pos Pengungkapan</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Judul pengungkapan resmi, kategori pos laporan, dan periode akuntansi.
          </p>
        </div>

        {/* Judul Catatan */}
        <div>
          <label htmlFor="fn-title" className="block text-xs font-bold text-slate-700 mb-1">
            Judul Catatan Pengungkapan <span className="text-rose-500">*</span>
          </label>
          <input
            id="fn-title"
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="Contoh: Dasar Penyusunan & Kepatuhan Standar Akuntansi Syariah"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-hidden shadow-2xs"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Kategori Pos & Periode Akuntansi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fn-category" className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Pos CLK <span className="text-rose-500">*</span>
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
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="fn-period" className="block text-xs font-bold text-slate-700 mb-1">
              Periode Akuntansi
            </label>
            <SearchableSelect<number | "">
              id="fn-period"
              value={periodId}
              onChange={(val) => setPeriodId(val === "" ? "" : Number(val))}
              options={[
                { value: "", label: "Semua Periode" },
                ...periods.map((p) => {
                  const pName = p.name || p.period_name || `Periode #${p.id}`;
                  return {
                    value: p.id,
                    label: pName,
                    badge: p.status === "closed" ? "Ditutup" : "Aktif",
                    badgeColor:
                      p.status === "closed"
                        ? "bg-slate-700 text-white"
                        : "bg-brandGreen-500 text-white",
                  };
                }),
              ]}
              placeholder="Semua Periode"
              searchPlaceholder="Pilih periode..."
              icon={faCalendarAlt}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Pilih Semua Periode jika catatan tidak dibatasi pada satu periode akuntansi.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: PENGATURAN PUBLIKASI */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-poppins">2. Pengaturan Urutan & Status Publikasi</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan urutan posisi naskah dan visibilitas pada cetakan resmi laporan keuangan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fn-sort-order" className="block text-xs font-bold text-slate-700 mb-1">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-hidden shadow-2xs"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Menentukan urutan naskah di dalam grup kategori (misal: 1 untuk A.1).
            </p>
          </div>

          <div>
            <label htmlFor="fn-status" className="block text-xs font-bold text-slate-700 mb-1">
              Status Publikasi
            </label>
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <label
                className={`flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
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
                className={`flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
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
              Catatan berstatus Dipublikasikan akan disertakan pada laporan resmi.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: NASKAH PENGUNGKAPAN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-poppins">3. Naskah Pengungkapan Naratif</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Uraian naratif lengkap, pengungkapan kebijakan, dan rincian transaksi laporan keuangan.
          </p>
        </div>

        <div>
          <label htmlFor="fn-content" className="block text-xs font-bold text-slate-700 mb-1">
            Isi Pengungkapan Catatan <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="fn-content"
            rows={10}
            required
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
            }}
            placeholder="Tuliskan penjelasan, kebijakan, rincian angka, atau pengungkapan lain yang diperlukan dalam laporan keuangan..."
            className="w-full min-h-[260px] lg:min-h-[300px] resize-y rounded-xl border border-slate-300 p-4 font-sans text-xs sm:text-sm leading-relaxed text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-hidden shadow-2xs"
          />
          {errors.content && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.content}</p>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {!hideActions && (
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition active:scale-95 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>Batal</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-600 transition active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="text-xs" />
                <span>{mode === "create" ? "Simpan Catatan" : "Simpan Perubahan"}</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

export default FinancialNoteForm;
