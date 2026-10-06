import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTriangleExclamation, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/ToastProvider';
import type { AxiosError } from 'axios';
import employeeService from '@/services/employeeService';
import type { EmployeeFormErrors, EmployeeFormPayload } from '@/types/employee';
import { useEmployeeDetail } from '@/hooks/employees/useEmployeeDetail';
import { useEmployeeFilters } from '@/hooks/employees/useEmployeeFilters';
import { EmployeeDeleteDialog, EmployeeForm } from '@/components/management/employees';

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { employee, loading, error } = useEmployeeDetail(id);
  const { filters: filterOptions } = useEmployeeFilters();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<EmployeeFormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (payload: EmployeeFormPayload) => {
    if (!id) return;
    setSubmitting(true);
    setServerErrors({});

    try {
      await employeeService.updateEmployee(id, payload);
      toast.success('Data karyawan berhasil diperbarui.', { title: 'Berhasil' });
      navigate(`/employees/${id}`);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      if (axiosErr?.response?.status === 422 && axiosErr.response?.data?.errors) {
        const rawErrors = axiosErr.response.data.errors;
        const mappedErrors: EmployeeFormErrors = {};
        Object.entries(rawErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            mappedErrors[field as keyof EmployeeFormErrors] = messages[0];
          }
        });
        setServerErrors(mappedErrors);
        toast.error('Periksa kembali isian formulir.', { title: 'Validasi gagal' });
      } else {
        const msg = axiosErr?.response?.data?.message || 'Gagal memperbarui data karyawan.';
        setServerErrors({ general: msg });
        toast.error(msg, { title: 'Gagal' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await employeeService.deleteEmployee(id);
      toast.success('Karyawan berhasil dihapus.', { title: 'Berhasil' });
      navigate('/employees');
    } catch {
      toast.error('Gagal menghapus karyawan.', { title: 'Gagal' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 animate-pulse font-body">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 py-16 text-center font-body">
        <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-rose-500 bg-white p-10 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-2xl" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900">
            {error || 'Karyawan tidak ditemukan.'}
          </h2>
          <div className="pt-4">
            <Link
              to="/employees"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Kembali ke Daftar</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-fade-in font-body">
      {/* Top Header Card */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
                Edit Karyawan
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {employee.employee_code}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Perbarui profil <span className="font-semibold text-slate-800">{employee.name}</span>, jabatan, urutan tampilan, atau ganti berkas kartu identitas digital.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/employees/${id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"><FontAwesomeIcon icon={faArrowLeft} /><span>Detail Karyawan</span></Link>
            <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700"><FontAwesomeIcon icon={faTrashCan} /><span>Hapus</span></button>
          </div>
        </div>
      </div>

      {/* Shared Reusable Form */}
      <EmployeeForm
        mode="edit"
        initialData={employee}
        filterOptions={filterOptions}
        submitting={submitting}
        serverErrors={serverErrors}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/employees/${id}`)}
      />
      <EmployeeDeleteDialog employee={showDeleteModal ? employee : null} deleting={deleting} onConfirm={handleDelete} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
}

export default EmployeeEditPage;
