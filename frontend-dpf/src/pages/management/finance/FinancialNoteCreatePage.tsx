import { useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { getAuthUser } from "@/lib/auth";
import { extractFinanceErrorMessage } from "@/utils/financeUtils";
import { useFinancePeriods } from "@/hooks/finance/useFinancePeriods";
import { useFinancialNoteActions } from "@/hooks/finance/useFinancialNoteActions";
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
              Hanya staf bagian Keuangan atau Superadmin yang memiliki hak akses untuk menambah catatan laporan keuangan.
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

  const handleSubmit = async (payload: FinancialNotePayload) => {
    try {
      const newNote = await createNote(payload);
      toast.success("Catatan keuangan berhasil ditambahkan.");
      if (newNote?.id) {
        navigate(`/finance/financial-notes/${newNote.id}`);
      } else {
        navigate("/finance/financial-notes");
      }
    } catch (err) {
      toast.error(
        extractFinanceErrorMessage(err, "Gagal menyimpan catatan keuangan.")
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
          to="/finance/financial-notes"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition"
          title="Kembali"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
            Tambah Catatan atas Laporan Keuangan
          </h1>
          <p className="text-xs text-slate-500">
            Tambahkan catatan pengungkapan untuk melengkapi laporan keuangan YWDP.
          </p>
        </div>
      </div>

      {/* Shared Form */}
      <FinancialNoteForm
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
  );
}

export default FinancialNoteCreatePage;
