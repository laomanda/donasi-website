import { useMemo } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { getAuthUser } from "@/lib/auth";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
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
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-red-100 text-red-600">
            <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-bold text-slate-800 font-poppins">
              Akses Terbatas
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hanya staf bagian Keuangan atau Superadmin yang memiliki hak akses untuk mengedit catatan laporan keuangan.
            </p>
          </div>
          <Link
            to="/finance/financial-notes"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            <span>Kembali ke Catatan Keuangan</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading && !note) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-xl bg-slate-200" />
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  // 3. Error State
  if (error && !note) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-poppins">
            Edit Catatan Keuangan
          </h1>
        </div>

        <FinanceErrorState
          title="Gagal Memuat Catatan Keuangan"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  if (!note) return null;

  const handleSubmit = async (payload: FinancialNotePayload) => {
    try {
      await updateNote(note.id, payload);
      toast.success("Catatan keuangan berhasil diperbarui.");
      navigate(`/finance/financial-notes/${note.id}${periodId ? `?period_id=${periodId}` : ""}`);
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal memperbarui catatan keuangan.")
      );
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/finance/financial-notes/${note.id}${periodId ? `?period_id=${periodId}` : ""}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition"
          title="Kembali"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
            Edit Catatan atas Laporan Keuangan
          </h1>
          <p className="text-xs text-slate-500">
            Perbarui naskah pengungkapan, kategori pos, atau status publikasi catatan.
          </p>
        </div>
      </div>

      {/* Shared Form */}
      <FinancialNoteForm
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
  );
}

export default FinancialNoteEditPage;
