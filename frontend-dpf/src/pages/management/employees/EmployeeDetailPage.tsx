import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/ToastProvider';
import employeeService from '@/services/employeeService';
import { useEmployeeDetail } from '@/hooks/employees/useEmployeeDetail';
import { useEmployeePermissions } from '@/hooks/employees/useEmployeePermissions';
import { EmployeeDetailView, EmployeeDeleteDialog } from '@/components/management/employees';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { canManage } = useEmployeePermissions();

  const { employee, loading, error, refresh } = useEmployeeDetail(id);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteConfirm = async () => {
    if (!employee) return;
    setIsDeleting(true);
    try {
      await employeeService.deleteEmployee(employee.id);
      toast.success('Karyawan berhasil dihapus.');
      navigate('/employees');
    } catch {
      toast.error('Gagal menghapus karyawan.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-pulse font-body">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-96 rounded-2xl bg-slate-200 lg:col-span-5" />
          <div className="h-96 rounded-2xl bg-slate-200 lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 py-16 text-center font-body">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-2xl" />
        </div>
        <h2 className="font-poppins text-lg font-bold text-slate-900">
          {error || 'Karyawan tidak ditemukan.'}
        </h2>
        <p className="text-xs text-slate-500">
          Data karyawan yang Anda cari mungkin telah dihapus atau tidak tersedia.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/employees"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Kembali ke Daftar</span>
          </Link>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-fade-in font-body">
      <EmployeeDetailView
        employee={employee}
        canManage={canManage}
        onDeleteClick={() => setShowDeleteModal(true)}
      />

      {/* Delete Confirmation Modal */}
      <EmployeeDeleteDialog
        employee={showDeleteModal ? employee : null}
        deleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

export default EmployeeDetailPage;
