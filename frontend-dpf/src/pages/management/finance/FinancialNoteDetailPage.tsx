import { useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { toast } from "@/components/ui/ToastProvider";
import { getAuthUser } from "@/lib/auth";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { FinanceErrorState } from "@/components/management/finance/shared";
import { useFinancialNote } from "@/hooks/finance/useFinancialNote";
import { useFinancialNoteActions } from "@/hooks/finance/useFinancialNoteActions";
import {
  FinancialNoteDetailHeader,
  FinancialNoteMetadata,
  FinancialNoteContent,
  FinancialNoteDeleteDialog,
} from "@/components/management/finance/financial-notes";

export function FinancialNoteDetailPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const noteId = Number(paramId);
  const isValidId = !isNaN(noteId) && noteId > 0;

  // Retrieve optional period_id to preserve context
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

  // Single Note Query
  const { note, loading, refreshing, error, refresh } = useFinancialNote(
    isValidId ? noteId : undefined
  );

  // Delete Action & Dialog State
  const { deleting, deleteNote } = useFinancialNoteActions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!note) return;
    try {
      await deleteNote(note.id);
      toast.success("Catatan keuangan berhasil dihapus.");
      setShowDeleteDialog(false);
      navigate(`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`);
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal menghapus catatan keuangan.")
      );
    }
  };

  // 1. Invalid Note ID State
  if (!isValidId) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/finance/financial-notes"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-poppins">
            Catatan Keuangan Tidak Valid
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FontAwesomeIcon icon={faFileLines} className="text-xl" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-800 font-poppins">
              ID Catatan Tidak Ditemukan
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Identifier catatan pengungkapan tidak valid atau tidak berformat angka.
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

  // 2. Initial Loading Skeleton
  if (loading && !note) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-xl bg-slate-200" />
            <div className="h-4 w-36 rounded-md bg-slate-100" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // 3. Error State
  if (error && !note) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/finance/financial-notes${periodId ? `?period_id=${periodId}` : ""}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-poppins">
            Detail Catatan Keuangan
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

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Detail Header */}
      <FinancialNoteDetailHeader
        note={note}
        periodId={periodId}
        canManage={canManage}
        refreshing={refreshing}
        onRefresh={refresh}
        onDeleteClick={() => setShowDeleteDialog(true)}
      />

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <FinancialNoteContent title={note.title} content={note.content} />
        </div>

        {/* Sidebar Metadata (1/3) */}
        <div>
          <FinancialNoteMetadata note={note} />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <FinancialNoteDeleteDialog
        note={showDeleteDialog ? note : null}
        deleting={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default FinancialNoteDetailPage;
