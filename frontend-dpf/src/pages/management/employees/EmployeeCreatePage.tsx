import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/ui/ToastProvider';
import type { AxiosError } from 'axios';
import employeeService from '@/services/employeeService';
import type { EmployeeFormErrors, EmployeeFormPayload } from '@/types/employee';
import { useEmployeeFilters } from '@/hooks/employees/useEmployeeFilters';
import { EmployeeForm } from '@/components/management/employees';

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { filters: filterOptions } = useEmployeeFilters();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<EmployeeFormErrors>({});

  const handleSubmit = async (payload: EmployeeFormPayload) => {
    setSubmitting(true);
    setServerErrors({});

    try {
      const created = await employeeService.createEmployee(payload);
      toast.success('Karyawan berhasil ditambahkan.', { title: 'Berhasil' });
      navigate(`/employees/${created.id}`);
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
        const msg = axiosErr?.response?.data?.message || 'Gagal menambahkan karyawan.';
        setServerErrors({ general: msg });
        toast.error(msg, { title: 'Gagal' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-fade-in font-body">
      {/* Top Header Card */}
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-l-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
              Tambah Karyawan
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Lengkapi data identitas, status organisasi, dan unggah ID Card digital untuk karyawan baru.
            </p>
          </div>
          <Link
            to="/employees"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Kembali ke Daftar</span>
          </Link>
        </div>
      </div>

      {/* Shared Reusable Form */}
      <EmployeeForm
        mode="create"
        filterOptions={filterOptions}
        submitting={submitting}
        serverErrors={serverErrors}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employees')}
      />
    </div>
  );
}

export default EmployeeCreatePage;
