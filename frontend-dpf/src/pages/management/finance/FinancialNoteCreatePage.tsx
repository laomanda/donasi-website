import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faArrowLeft,
  faSave,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "@/components/ui/ToastProvider";
import { getAuthUser } from "@/lib/auth";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useFinancialNoteActions } from "@/hooks/finance/useFinancialNoteActions";
import { AccountPageHeader } from "@/components/management/finance/accounts";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { FinancialNoteForm } from "@/components/management/finance/financial-notes";
import type { FinancialNotePayload } from "@/types/finance";

export function FinancialNoteCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read optional period_id from query params to prepopulate form
  const rawPeriodId = searchParams.get("period_id");
  const initialPeriodId = rawPeriodId ? Number(rawPeriodId) : undefined;
  const initialCategory = searchParams.get("category") || undefined;

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
  const { submitting, createNote } = useFinancialNoteActions();

  // Access Denied State for Unauthorized Users
  if (!canManage) {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title="Tambah Catatan Keuangan"
          description="Tambahkan pengungkapan resmi untuk melengkapi laporan keuangan YWDP."
          backHref="/finance/financial-notes"
          backLabel="Kembali ke Catatan Keuangan"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <FinanceErrorState
            title="Akses Ditolak"
            message="Anda tidak memiliki wewenang untuk menambahkan catatan keuangan. Hanya staf Divisi Keuangan dan Superadmin yang diizinkan."
            onRetry={() => navigate("/finance/financial-notes")}
          />
        </div>
      </div>
    );
  }

  const handleSubmit = async (payload: FinancialNotePayload) => {
    try {
      await createNote(payload);
      toast.success("Catatan keuangan berhasil ditambahkan.");
      navigate(`/finance/financial-notes${rawPeriodId ? `?period_id=${rawPeriodId}` : ""}`);
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal menyimpan catatan keuangan.")
      );
    }
  };

  const handleCancel = () => {
    navigate(`/finance/financial-notes${rawPeriodId ? `?period_id=${rawPeriodId}` : ""}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Dual-Brand Gradient */}
      <AccountPageHeader
        title="Tambah Catatan atas Laporan Keuangan"
        description="Tambahkan catatan pengungkapan resmi naratif untuk melengkapi laporan posisi keuangan dan aktivitas YWDP."
        backHref={`/finance/financial-notes${rawPeriodId ? `?period_id=${rawPeriodId}` : ""}`}
        backLabel="Kembali ke Catatan Keuangan"
        variant="brand"
        breadcrumbs={[
          { label: "Keuangan", href: "/finance" },
          { label: "Catatan Keuangan", href: `/finance/financial-notes${rawPeriodId ? `?period_id=${rawPeriodId}` : ""}` },
          { label: "Tambah Catatan" },
        ]}
      />

      {/* 2. Main Form Grid (2 cols form, 1 col sticky guide sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Area (2 cols) */}
        <div className="lg:col-span-2">
          <FinancialNoteForm
            id="financial-note-form"
            hideActions
            mode="create"
            initialValue={{
              period_id: initialPeriodId,
              category: initialCategory,
              status: "draft",
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

export default FinancialNoteCreatePage;
