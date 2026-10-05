import { useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faBookOpen,
  faArrowLeft,
  faSave,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { getAuthUser } from "@/lib/auth";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { AccountPageHeader } from "@/components/management/finance/accounts";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useFinancialNote } from "@/hooks/finance/useFinancialNote";
import { useFinancialNoteActions } from "@/hooks/finance/useFinancialNoteActions";
import { FinancialNoteForm } from "@/components/management/finance/financial-notes";
import type { FinancialNotePayload } from "@/types/finance";

export function FinancialNoteEditPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const noteId = Number(paramId);
  const isValidId = !isNaN(noteId) && noteId > 0;

  // Retrieve optional period_id
  const rawPeriodId = searchParams.get("period_id");
  const periodId = useMemo(() => {
    if (!rawPeriodId) return "";
    const n = Number(rawPeriodId);
    return isNaN(n) ? "" : n;
  }, [rawPeriodId]);

  // RBAC Permission Check
  const currentUser = getAuthUser();
  const canManage = useMemo(() => {
    const roles = (currentUser?.roles ?? []).map((r) => r.name.toLowerCase());
    if (currentUser?.role_label) {
      roles.push(currentUser.role_label.toLowerCase());
    }
    return roles.includes("keuangan") || roles.includes("superadmin");
  }, [currentUser]);

  const { periods } = useFinancePeriods();
  const { note, loading, error, refresh } = useFinancialNote(
    isValidId ? noteId : undefined
  );
  const { submitting, updateNote } = useFinancialNoteActions();

  // 1. RBAC Guard
  if (!canManage) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Edit Catatan Keuangan"
          description="Perbarui naskah pengungkapan, kategori pos, atau status publikasi catatan keuangan."
          backHref={`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`}
          backLabel="Kembali ke Catatan Keuangan"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="Akses Ditolak"
            message="Anda tidak memiliki wewenang untuk mengubah catatan keuangan. Hanya staf Divisi Keuangan dan Superadmin yang diizinkan."
            onRetry={() => navigate(`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`)}
          />
        </div>
      </div>
    );
  }

  // 2. Invalid ID Guard
  if (!isValidId) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Edit Catatan Keuangan"
          description="Perbarui naskah pengungkapan, kategori pos, atau status publikasi catatan keuangan."
          backHref="/finance/financial-notes"
          backLabel="Kembali ke Catatan Keuangan"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="ID Catatan Tidak Valid"
            message={`Parameter ID catatan "${paramId}" tidak valid. Pastikan tautan yang dituju benar.`}
            onRetry={() => navigate("/finance/financial-notes")}
          />
        </div>
      </div>
    );
  }

  // 3. Loading State
  if (loading && !note) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-7 bg-slate-200 rounded w-64" />
          <div className="h-4 bg-slate-100 rounded w-96" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs h-96 bg-slate-50/50" />
      </div>
    );
  }

  // 4. Error State
  if (error && !note) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Edit Catatan Keuangan"
          description="Perbarui naskah pengungkapan, kategori pos, atau status publikasi catatan keuangan."
          backHref={`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`}
          backLabel="Kembali ke Catatan Keuangan"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="Catatan Keuangan Tidak Ditemukan"
            message={error || `Catatan keuangan dengan ID ${noteId} tidak ditemukan.`}
            onRetry={refresh}
          />
        </div>
      </div>
    );
  }

  if (!note) return null;

  const handleSubmit = async (payload: FinancialNotePayload) => {
    try {
      await updateNote(note.id, payload);
      toast.success("Catatan keuangan berhasil diperbarui.");
      navigate(`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`);
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal memperbarui catatan keuangan.")
      );
    }
  };

  const handleCancel = () => {
    navigate(`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Status Badge */}
      <AccountPageHeader
        title={`Edit Catatan: ${note.title}`}
        description="Perbarui uraian naratif pengungkapan resmi, kategori pos laporan, nomor urut, atau status publikasi."
        backHref={`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`}
        backLabel="Kembali ke Catatan Keuangan"
        variant="brand"
        badge={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
              <FontAwesomeIcon icon={faBookOpen} className="text-xs" />
              <span>CLK #{note.id}</span>
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                note.status === "published"
                  ? "bg-brandGreen-500 text-white"
                  : "bg-brandWarmOrange-500 text-white"
              }`}
            >
              {note.status === "published" ? "Dipublikasikan" : "Draft"}
            </span>
          </div>
        }
        breadcrumbs={[
          { label: "Keuangan", href: "/finance" },
          {
            label: "Catatan Keuangan",
            href: `/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`,
          },
          { label: `Edit: ${note.title}` },
        ]}
      />

      {/* 2. Main Form Grid (2 cols form, 1 col sticky guide sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Area (2 cols) */}
        <div className="lg:col-span-2">
          <FinancialNoteForm
            id="financial-note-form"
            hideActions
            mode="edit"
            initialValue={{
              title: note.title,
              category: note.category,
              period_id: note.period_id ?? undefined,
              sort_order: note.sort_order ?? note.order ?? undefined,
              status: note.status as any,
              content: note.content,
            }}
            periods={periods}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>

        {/* Right Contextual Guide Sidebar (1 col) - Sticky */}
        <div className="lg:col-span-1 space-y-5 sticky top-24 self-start">
          {/* Guide Card 1: Panduan Pengungkapan CLK */}
          <div className="rounded-2xl border border-slate-200 border-l-4 border-l-primary-500 bg-white p-5 shadow-xs space-y-3">
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-slate-800">Prinsip Keterbukaan:</strong> Catatan atas Laporan Keuangan menyajikan rincian pos yang tidak tertera pada muka laporan neraca / aktivitas.
              </li>
              <li>
                <strong className="text-slate-800">Kesesuaian Standar:</strong> Mengacu pada PSAK 109 (Akuntansi Zakat & Infak/Sedekah) dan regulasi wakaf yang berlaku.
              </li>
              <li>
                <strong className="text-slate-800">Status Publikasi:</strong> Pilih <em>Dipublikasikan</em> agar catatan muncul pada tampilan naratif resmi laporan yayasan.
              </li>
            </ul>
          </div>

          {/* Guide Card 2: Struktur Kategori CLK */}
          <div className="rounded-2xl border border-slate-200 border-l-4 border-l-brandBlueTeal-500 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <FontAwesomeIcon icon={faLayerGroup} className="text-brandBlueTeal-500" />
              <span>Struktur Kategori CLK</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Kebijakan Akuntansi</span>
                <span className="text-slate-500 text-[11px]">Asas & Prinsip</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Aset Wakaf</span>
                <span className="text-slate-500 text-[11px]">Uang & Benda Tetap</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Penerimaan & Penyaluran</span>
                <span className="text-slate-500 text-[11px]">Realisasi Program</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Liabilitas & Komitmen</span>
                <span className="text-slate-500 text-[11px]">Kewajiban Nazhir</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Moved below Struktur Kategori CLK */}
          <div className="flex items-center gap-3 pt-4 pb-4 px-4 bg-slate-200 border-t border-slate-300/60 rounded-xl">
            <button
              type="button"
              disabled={submitting}
              onClick={handleCancel}
              className="flex-1 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition active:scale-95 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              <span>Batal</span>
            </button>

            <button
              type="submit"
              form="financial-note-form"
              disabled={submitting}
              className="flex-1 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-600 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="text-xs" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialNoteEditPage;
