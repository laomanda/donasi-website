import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/ToastProvider';
import type { AxiosError } from 'axios';
import employeeService from '@/services/employeeService';
import type { EmployeeFormErrors, EmployeeFormPayload } from '@/types/employee';
import { useEmployeeDetail } from '@/hooks/employees/useEmployeeDetail';
import { useEmployeeFilters } from '@/hooks/employees/useEmployeeFilters';
import { EmployeeForm } from '@/components/management/employees';

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { employee, loading, error } = useEmployeeDetail(id);
  const { filters: filterOptions } = useEmployeeFilters();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<EmployeeFormErrors>({});

  const handleSubmit = async (payload: EmployeeFormPayload) => {
    if (!id) return;
    setSubmitting(true);
    setServerErrors({});

    try {
      await employeeService.updateEmployee(id, payload);
      toast.success('Data karyawan berhasil diperbarui.');
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
        toast.error('Periksa kembali isian formulir.');
      } else {
        const msg = axiosErr?.response?.data?.message || 'Gagal memperbarui data karyawan.';
        setServerErrors({ general: msg });
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-2xl" />
        </div>
        <h2 className="font-poppins text-lg font-bold text-slate-900">
          {error || 'Karyawan tidak ditemukan.'}
        </h2>
        <div className="pt-2">
          <Link
            to="/employees"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Kembali ke Daftar</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 animate-fade-in font-body">
      {/* Top Navigation */}
      <div className="flex flex-col gap-2">
        <Link
          to={`/employees/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Kembali ke Detail Karyawan</span>
        </Link>
        <h1 className="font-poppins text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Edit Karyawan
        </h1>
        <p className="text-sm text-slate-600">
          Perbarui data profil, jabatan, divisi, urutan tampilan, atau ganti berkas ID Card digital.
        </p>
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
    </div>
  );
}

export default EmployeeEditPage;
