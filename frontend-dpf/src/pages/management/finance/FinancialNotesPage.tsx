import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faFileExcel,
  faPlus,
  faFileLines,
  faSearch,
  faTimes,
  faPenToSquare,
  faTrashCan,
  faEye,
  faCheckCircle,
  faFolderOpen,
  faUser,
  faXmark,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";

import {
  FinancePageHeader,
  FinanceTableSkeleton,
  FinanceEmptyState,
  FinanceErrorState,
} from "@/components/management/finance/shared";
import financeService from "@/services/financeService";
import {
  formatFinanceDate,
  formatFinanceDateTime,
  extractFinanceErrorMessage,
  downloadBlobFile,
} from "@/utils/financeUtils";
import type {
  AccountingPeriod,
  FinancialNote,
  FinancialNoteSummary,
  FinancialNotePayload,
  FinancialNoteFilterParams,
  FinancialNoteCategory,
  FinancialNoteStatus,
} from "@/types/finance";

const CLK_CATEGORIES: Array<{ key: FinancialNoteCategory; label: string }> = [
  { key: "accounting_policy", label: "Kebijakan Akuntansi" },
  { key: "asset_note", label: "Catatan Aset Wakaf & Lancar" },
  { key: "revenue_note", label: "Catatan Penerimaan / Pendapatan" },
  { key: "expense_note", label: "Catatan Beban & Penyaluran" },
  { key: "waqf_note", label: "Catatan Pengelolaan Wakaf" },
  { key: "general_note", label: "Catatan Umum & Lain-Lain" },
];

export function FinancialNotesPage() {
  // Data States
  const [notes, setNotes] = useState<FinancialNote[]>([]);
  const [summary, setSummary] = useState<FinancialNoteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Master Data
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);

  // Filter States
  const [periodFilter, setPeriodFilter] = useState<number | "">("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FinancialNote | null>(null);
  const [viewingNote, setViewingNote] = useState<FinancialNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<FinancialNote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load accounting periods on mount
  useEffect(() => {
    let isMounted = true;
    const loadPeriods = async () => {
      try {
        const periodList = await financeService.getAccountingPeriods();
        if (isMounted) {
          setPeriods(periodList || []);
        }
      } catch {
        // Fallback silently
      }
    };

    void loadPeriods();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Notes and Summary
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: FinancialNoteFilterParams = {};
      if (periodFilter !== "") {
        params.period_id = periodFilter;
        params.accounting_period_id = periodFilter;
      }
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const [notesRes, summaryRes] = await Promise.all([
        financeService.getFinancialNotes(params),
        financeService.getFinancialNotesSummary({
          period_id: periodFilter !== "" ? periodFilter : undefined,
        }),
      ]);

      setNotes(notesRes || []);
      setSummary(summaryRes || null);
    } catch (err) {
      setError(extractFinanceErrorMessage(err, "Gagal memuat catatan atas laporan keuangan (CLK)."));
    } finally {
      setLoading(false);
    }
  }, [periodFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return Boolean(periodFilter !== "" || categoryFilter !== "" || statusFilter !== "");
  }, [periodFilter, categoryFilter, statusFilter]);

  const handleResetFilter = () => {
    setPeriodFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    setSearchQuery("");
  };

  // Export Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams: Record<string, string> = {};
      if (periodFilter !== "") exportParams.period_id = String(periodFilter);
      if (categoryFilter) exportParams.category = categoryFilter;
      if (statusFilter) exportParams.status = statusFilter;

      const blob = await financeService.exportFinancialNotes(exportParams);
      const today = new Date().toISOString().slice(0, 10);
      downloadBlobFile(
        blob as unknown as BlobPart,
        `Catatan_Laporan_Keuangan_CLK_${today}.xlsx`
      );
      toast.success("Catatan Keuangan (CLK) Excel berhasil diunduh.");
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal mengunduh catatan laporan keuangan."));
    } finally {
      setExporting(false);
    }
  };

  // Filter notes by search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase().trim();
    return notes.filter((n) => {
      const title = (n.title || "").toLowerCase();
      const content = (n.content || "").toLowerCase();
      const cat = (n.category_label || n.category || "").toLowerCase();
      const creator = (n.creator_name || "").toLowerCase();
      return title.includes(q) || content.includes(q) || cat.includes(q) || creator.includes(q);
    });
  }, [notes, searchQuery]);

  // Save (Create or Update)
  const handleSaveNote = async (payload: FinancialNotePayload) => {
    setSubmitting(true);
    try {
      if (editingNote) {
        await financeService.updateFinancialNote(editingNote.id, payload);
        toast.success("Catatan keuangan berhasil diperbarui.");
      } else {
        await financeService.createFinancialNote(payload);
        toast.success("Catatan keuangan berhasil ditambahkan.");
      }
      setIsFormOpen(false);
      setEditingNote(null);
      await fetchData();
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal menyimpan catatan keuangan."));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async () => {
    if (!deletingNote) return;
    setDeleting(true);
    try {
      await financeService.deleteFinancialNote(deletingNote.id);
      toast.success("Catatan keuangan berhasil dihapus.");
      setDeletingNote(null);
      await fetchData();
    } catch (err) {
      toast.error(extractFinanceErrorMessage(err, "Gagal menghapus catatan keuangan."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <FinancePageHeader
        title="Catatan Atas Laporan Keuangan (CLK)"
        description="Dokumentasi naratif resmi, pengungkapan kebijakan akuntansi, dan penjelasan rincian pos laporan posisi keuangan (LP), aktivitas (LA), serta aset wakaf (LRAW)."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingNote(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Tambah Catatan (CLK)</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon
                icon={faFileExcel}
                className={`text-emerald-600 ${exporting ? "animate-bounce" : ""}`}
              />
              <span>{exporting ? "Mengunduh..." : "Export Excel"}</span>
            </button>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className={loading ? "animate-spin" : ""}
              />
              <span>Segarkan</span>
            </button>
          </div>
        }
      />

      {/* 2. FILTER TOOLBAR */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          {/* Periode Akuntansi */}
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="clk_period_select"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Periode Akuntansi
            </label>
            <select
              id="clk_period_select"
              value={periodFilter}
              onChange={(e) =>
                setPeriodFilter(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Periode (Default)</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.period_name} ({p.status === "open" ? "Aktif" : "Ditutup"})
                </option>
              ))}
            </select>
          </div>

          {/* Kategori Catatan */}
          <div className="w-full sm:w-64">
            <label
              htmlFor="clk_cat_select"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Kategori CLK
            </label>
            <select
              id="clk_cat_select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Kategori</option>
              {CLK_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Catatan */}
          <div className="w-full sm:w-44">
            <label
              htmlFor="clk_status_select"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Status Publikasi
            </label>
            <select
              id="clk_status_select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Semua Status</option>
              <option value="published">Dipublikasikan</option>
              <option value="draft">Konsep (Draft)</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          {isFilterActive && (
            <div>
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. ERROR STATE */}
      {error && (
        <FinanceErrorState
          title="Tidak Dapat Memuat Catatan Keuangan"
          message={error}
          onRetry={fetchData}
        />
      )}

      {/* 4. LOADING SKELETON */}
      {loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <FinanceTableSkeleton rows={6} cols={5} />
          </div>
        </div>
      )}

      {/* 5. SUMMARY & NOTES CONTENT */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Catatan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  TOTAL CATATAN (CLK)
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <FontAwesomeIcon icon={faFileLines} className="text-xs" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-black font-heading text-slate-900 tabular-nums">
                  {summary?.total_notes ?? notes.length} Catatan
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Pengungkapan laporan keuangan
                </p>
              </div>
            </div>

            {/* Card 2: Dipublikasikan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  DIPUBLIKASIKAN
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-black font-heading text-emerald-700 tabular-nums">
                  {summary?.by_status?.published ?? 0} Catatan
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Tampil pada lampiran laporan resmi
                </p>
              </div>
            </div>

            {/* Card 3: Konsep / Draft */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  DRAFT / KONSEP
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-black font-heading text-amber-700 tabular-nums">
                  {summary?.by_status?.draft ?? 0} Catatan
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Belum dipublikasikan ke laporan
                </p>
              </div>
            </div>

            {/* Card 4: Kategori Terisi */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  KATEGORI TERISI
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FontAwesomeIcon icon={faFolderOpen} className="text-xs" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-black font-heading text-slate-900 tabular-nums">
                  {summary?.by_category?.filter((c) => c.count > 0).length || 0} / {CLK_CATEGORIES.length}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  Cakupan pos pengungkapan
                </p>
              </div>
            </div>
          </div>

          {/* NOTES LIST CARD */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <div>
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Daftar Catatan Atas Laporan Keuangan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Menampilkan {filteredNotes.length} dari {notes.length} catatan terdaftar
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, isi, penyusun..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>
            </div>

            {/* Notes Table */}
            {filteredNotes.length === 0 ? (
              <div className="p-8">
                <FinanceEmptyState
                  title="Belum Ada Catatan Keuangan (CLK)"
                  description="Tidak ditemukan catatan atas laporan keuangan pada filter yang dipilih. Silakan tambahkan catatan baru."
                  icon={faFileLines}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-6 w-16 text-center">Urutan</th>
                      <th className="py-3.5 px-4 min-w-[240px]">Judul Catatan</th>
                      <th className="py-3.5 px-4 w-48">Kategori Pos</th>
                      <th className="py-3.5 px-4 w-36">Periode</th>
                      <th className="py-3.5 px-4 w-36">Penyusun</th>
                      <th className="py-3.5 px-4 text-center w-28">Status</th>
                      <th className="py-3.5 px-4 w-36">Diperbarui</th>
                      <th className="py-3.5 px-6 text-center w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredNotes.map((note) => (
                      <tr
                        key={note.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="py-3.5 px-6 text-center font-mono font-bold text-slate-500">
                          {note.sort_order ?? note.order ?? 0}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <button
                            type="button"
                            onClick={() => setViewingNote(note)}
                            className="text-left hover:text-emerald-700 hover:underline transition font-bold"
                          >
                            {note.title}
                          </button>
                          <p className="text-[11px] text-slate-500 line-clamp-1 font-normal mt-0.5">
                            {note.content}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200/60 text-[10px] font-bold text-purple-900 uppercase">
                            {note.category_label || note.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {note.period_name || (note.period_id ? `Periode #${note.period_id}` : "Semua Periode")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faUser} className="text-slate-400 text-[10px]" />
                            {note.creator_name || "Admin Keuangan"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              note.status === "published"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {note.status === "published" ? "Publikasi" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {formatFinanceDate(note.updated_at || note.created_at)}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingNote(note)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                              title="Lihat Detail Catatan"
                            >
                              <FontAwesomeIcon icon={faEye} className="text-[11px]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNote(note);
                                setIsFormOpen(true);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition"
                              title="Edit Catatan"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="text-[11px]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingNote(note)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Catatan"
                            >
                              <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. CREATE / EDIT MODAL */}
      {isFormOpen && (
        <FinancialNoteFormModal
          editingNote={editingNote}
          periods={periods}
          submitting={submitting}
          onSave={handleSaveNote}
          onClose={() => {
            setIsFormOpen(false);
            setEditingNote(null);
          }}
        />
      )}

      {/* 7. VIEW DETAIL MODAL */}
      {viewingNote && (
        <FinancialNoteDetailModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onEdit={() => {
            const n = viewingNote;
            setViewingNote(null);
            setEditingNote(n);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {deletingNote && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50">
                <FontAwesomeIcon icon={faTrashCan} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Catatan Keuangan</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus catatan:{" "}
              <span className="font-bold text-slate-900">{deletingNote.title}</span>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingNote(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteNote}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: FORM MODAL (CREATE / EDIT)
// ==========================================
interface FinancialNoteFormModalProps {
  editingNote: FinancialNote | null;
  periods: AccountingPeriod[];
  submitting: boolean;
  onSave: (payload: FinancialNotePayload) => Promise<void>;
  onClose: () => void;
}

function FinancialNoteFormModal({
  editingNote,
  periods,
  submitting,
  onSave,
  onClose,
}: FinancialNoteFormModalProps) {
  const [title, setTitle] = useState(editingNote?.title || "");
  const [category, setCategory] = useState<string>(
    editingNote?.category || CLK_CATEGORIES[0].key
  );
  const [periodId, setPeriodId] = useState<number | "">(
    editingNote?.accounting_period_id ?? editingNote?.period_id ?? ""
  );
  const [sortOrder, setSortOrder] = useState<number>(
    editingNote?.sort_order ?? editingNote?.order ?? 0
  );
  const [status, setStatus] = useState<FinancialNoteStatus>(
    (editingNote?.status as FinancialNoteStatus) || "published"
  );
  const [content, setContent] = useState(editingNote?.content || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul catatan wajib diisi.");
      return;
    }
    if (!content.trim()) {
      toast.error("Isi catatan wajib diisi.");
      return;
    }

    void onSave({
      title: title.trim(),
      category,
      period_id: periodId !== "" ? Number(periodId) : null,
      accounting_period_id: periodId !== "" ? Number(periodId) : null,
      sort_order: Number(sortOrder) || 0,
      status,
      content: content.trim(),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clk-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden my-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-bold">
                <FontAwesomeIcon icon={editingNote ? faPenToSquare : faPlus} />
              </div>
              <h3 id="clk-form-title" className="font-heading text-sm font-bold text-slate-900">
                {editingNote ? "Edit Catatan Keuangan (CLK)" : "Tambah Catatan Keuangan Baru (CLK)"}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            {/* Judul Catatan */}
            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500">
                Judul Catatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kebijakan Penyusutan Aset Wakaf Tahun 2026"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kategori Catatan */}
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500">
                  Kategori Pos <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  {CLK_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Periode Akuntansi */}
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500">
                  Periode Akuntansi
                </label>
                <select
                  value={periodId}
                  onChange={(e) =>
                    setPeriodId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Semua Periode</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.period_name} ({p.status === "open" ? "Aktif" : "Ditutup"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nomor Urut */}
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500">
                  Nomor Urut Tampilan
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500">
                  Status Publikasi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FinancialNoteStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="published">Dipublikasikan (Tampil pada Laporan)</option>
                  <option value="draft">Konsep (Draft Internal)</option>
                </select>
              </div>
            </div>

            {/* Isi Catatan */}
            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500">
                Isi Catatan / Pengungkapan Naratif <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Tuliskan penjelasan naratif pengungkapan laporan keuangan secara jelas..."
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 font-mono text-xs leading-relaxed text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-3.5 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {submitting ? "Menyimpan..." : "Simpan Catatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: DETAIL MODAL
// ==========================================
interface FinancialNoteDetailModalProps {
  note: FinancialNote;
  onClose: () => void;
  onEdit: () => void;
}

function FinancialNoteDetailModal({
  note,
  onClose,
  onEdit,
}: FinancialNoteDetailModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clk-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white text-xs font-bold">
              <FontAwesomeIcon icon={faFileLines} />
            </div>
            <div>
              <h3 id="clk-detail-title" className="font-heading text-sm font-bold text-slate-900">
                {note.title}
              </h3>
              <p className="text-[11px] text-slate-500">
                {note.category_label || note.category}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                  note.status === "published"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {note.status === "published" ? "Publikasi" : "Draft"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Periode</span>
              <span className="font-semibold text-slate-800">
                {note.period_name || "Semua Periode"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Penyusun</span>
              <span className="font-semibold text-slate-800">
                {note.creator_name || "Admin Keuangan"}
              </span>
            </div>
          </div>

          {/* Note Content */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Naskah Catatan Pengungkapan
            </span>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 font-sans text-xs leading-relaxed text-slate-800 whitespace-pre-line shadow-2xs">
              {note.content}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Dibuat: {formatFinanceDateTime(note.created_at)}</span>
            <span>Diperbarui: {formatFinanceDateTime(note.updated_at)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-3.5 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
          >
            Edit Catatan
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinancialNotesPage;
